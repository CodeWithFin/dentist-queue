import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';
import { CheckInDto } from './dto';
import { QueuePriority, QueueStatus, AppointmentStatus } from '@prisma/client';

const QUEUE_KEY = 'dentist:queue';

@Injectable()
export class QueueService {
  private priorityMap = {
    [QueuePriority.EMERGENCY]: 1,
    [QueuePriority.URGENT]: 2,
    [QueuePriority.APPOINTMENT]: 3,
    [QueuePriority.NORMAL]: 4,
  };

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
    private smsService: SmsService,
  ) {}

  async checkIn(checkInDto: CheckInDto) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: checkInDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if patient is already in queue
    const existingEntry = await this.prisma.queueEntry.findFirst({
      where: {
        patientId: checkInDto.patientId,
        status: {
          in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE],
        },
      },
    });

    if (existingEntry) {
      throw new BadRequestException('Patient is already in queue');
    }

    // If appointment ID provided, verify and update appointment
    let appointment = null;
    if (checkInDto.appointmentId) {
      appointment = await this.prisma.appointment.findUnique({
        where: { id: checkInDto.appointmentId },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      // Update appointment status to checked in
      await this.prisma.appointment.update({
        where: { id: checkInDto.appointmentId },
        data: { status: AppointmentStatus.CHECKED_IN },
      });
    }

    // Generate queue number
    const queueNumber = await this.generateQueueNumber();

    // Create queue entry in database
    const queueEntry = await this.prisma.queueEntry.create({
      data: {
        patientId: checkInDto.patientId,
        appointmentId: checkInDto.appointmentId,
        priority: checkInDto.priority,
        queueNumber,
        reason: checkInDto.reason,
        notes: checkInDto.notes,
        status: QueueStatus.WAITING,
      },
      include: {
        patient: true,
        appointment: true,
      },
    });

    // Add to Redis priority queue
    const priorityScore = this.priorityMap[checkInDto.priority];
    await this.redis.addToQueue(QUEUE_KEY, priorityScore, {
      id: queueEntry.id,
      queueNumber: queueEntry.queueNumber,
      patientId: patient.id,
      priority: checkInDto.priority,
    });

    // Update positions for all waiting patients
    await this.updateQueuePositions();

    // Calculate ETA
    const position = await this.getQueuePositionById(queueEntry.id);
    const eta = await this.calculateETA(position);

    // Send SMS confirmation
    try {
      await this.smsService.sendCheckInConfirmation(patient.id, {
        queueNumber: queueEntry.queueNumber,
        position,
        estimatedWait: eta,
      });
    } catch (error) {
      // Log error but don't fail the check-in
      console.error('Failed to send SMS confirmation:', error);
    }

    return {
      ...queueEntry,
      position,
      estimatedWait: eta,
    };
  }

  async getCurrentQueue() {
    const queueEntries = await this.prisma.queueEntry.findMany({
      where: {
        status: {
          in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE],
        },
      },
      include: {
        patient: true,
        appointment: true,
        room: true,
      },
      orderBy: [{ priority: 'asc' }, { checkedInAt: 'asc' }],
    });

    // Enrich with position and ETA
    const enrichedQueue = await Promise.all(
      queueEntries.map(async (entry) => {
        const position = await this.getQueuePositionById(entry.id);
        const eta = await this.calculateETA(position);
        return {
          ...entry,
          position,
          estimatedWait: eta,
        };
      }),
    );

    return enrichedQueue;
  }

  async findOne(id: string) {
    const queueEntry = await this.prisma.queueEntry.findUnique({
      where: { id },
      include: {
        patient: true,
        appointment: true,
        room: true,
      },
    });

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    const position = await this.getQueuePositionById(id);
    const eta = await this.calculateETA(position);

    return {
      ...queueEntry,
      position,
      estimatedWait: eta,
    };
  }

  async getPatientPosition(patientId: string) {
    const queueEntry = await this.prisma.queueEntry.findFirst({
      where: {
        patientId,
        status: {
          in: [QueueStatus.WAITING, QueueStatus.CALLED],
        },
      },
      include: {
        patient: true,
      },
    });

    if (!queueEntry) {
      throw new NotFoundException('Patient not in queue');
    }

    const position = await this.getQueuePositionById(queueEntry.id);
    const eta = await this.calculateETA(position);
    const queueSize = await this.redis.getQueueSize(QUEUE_KEY);

    return {
      queueEntry,
      position,
      estimatedWait: eta,
      totalInQueue: queueSize,
    };
  }

  async callNextPatient(id: string, roomId: string) {
    const queueEntry = await this.prisma.queueEntry.findUnique({
      where: { id },
    });

    if (!queueEntry) {
      throw new NotFoundException('Queue entry not found');
    }

    // Verify room exists and is available
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Update queue entry
    const updated = await this.prisma.queueEntry.update({
      where: { id },
      data: {
        status: QueueStatus.CALLED,
        roomId,
        calledAt: new Date(),
      },
      include: {
        patient: true,
        room: true,
      },
    });

    // Send SMS notification
    try {
      await this.smsService.sendCalledToRoom(updated.patientId, room.name);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }

    return updated;
  }

  async startService(id: string) {
    const queueEntry = await this.prisma.queueEntry.update({
      where: { id },
      data: {
        status: QueueStatus.IN_SERVICE,
        startedAt: new Date(),
      },
      include: {
        patient: true,
        room: true,
      },
    });

    // Update room status to occupied
    if (queueEntry.roomId) {
      await this.prisma.room.update({
        where: { id: queueEntry.roomId },
        data: { status: 'OCCUPIED' },
      });
    }

    return queueEntry;
  }

  async completeService(id: string) {
    const queueEntry = await this.prisma.queueEntry.update({
      where: { id },
      data: {
        status: QueueStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        patient: true,
        room: true,
        appointment: true,
      },
    });

    // Remove from Redis queue
    await this.removeFromRedisQueue(id);

    // Update room status to available
    if (queueEntry.roomId) {
      await this.prisma.room.update({
        where: { id: queueEntry.roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    // Update appointment status if exists
    if (queueEntry.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: queueEntry.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }

    // Update positions
    await this.updateQueuePositions();

    return queueEntry;
  }

  async updateStatus(id: string, status: QueueStatus) {
    try {
      const queueEntry = await this.prisma.queueEntry.update({
        where: { id },
        data: { status },
        include: {
          patient: true,
          room: true,
        },
      });
      return queueEntry;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Queue entry with ID ${id} not found`);
      }
      throw error;
    }
  }

  async removeFromQueue(id: string) {
    try {
      await this.prisma.queueEntry.update({
        where: { id },
        data: { status: QueueStatus.CANCELLED },
      });

      await this.removeFromRedisQueue(id);
      await this.updateQueuePositions();
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Queue entry with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getQueueStats() {
    const stats = await this.prisma.queueEntry.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const avgWaitTime = await this.calculateAverageWaitTime();
    const queueSize = await this.redis.getQueueSize(QUEUE_KEY);

    return {
      currentQueueSize: queueSize,
      todayStats: stats,
      averageWaitTime: avgWaitTime,
    };
  }

  // Helper methods
  private async generateQueueNumber(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.queueEntry.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    return count + 1;
  }

  private async getQueuePositionById(id: string): Promise<number> {
    const allEntries = await this.redis.getAllInQueue(QUEUE_KEY);
    const index = allEntries.findIndex((entry) => entry.id === id);
    return index >= 0 ? index + 1 : 0;
  }

  private async updateQueuePositions() {
    const allEntries = await this.redis.getAllInQueue(QUEUE_KEY);
    
    for (let i = 0; i < allEntries.length; i++) {
      const entry = allEntries[i];
      await this.prisma.queueEntry.updateMany({
        where: { id: entry.id },
        data: { position: i + 1 },
      });
    }
  }

  private async calculateETA(position: number): Promise<number> {
    if (position <= 0) return 0;

    // Get real-time average service time from completed entries today
    const avgServiceTime = await this.getAverageServiceTime();
    
    // Get currently active patients (being served)
    const activeCount = await this.prisma.queueEntry.count({
      where: {
        status: QueueStatus.IN_SERVICE,
      },
    });

    // Get average number of rooms/providers
    const activeRooms = await this.prisma.room.count({
      where: {
        status: 'OCCUPIED',
      },
    });

    const availableRooms = Math.max(activeRooms, 1); // At least 1 room

    // Calculate estimated wait time based on position and parallel processing
    // If multiple rooms are available, patients are served in parallel
    const patientsAheadPerRoom = Math.ceil(position / availableRooms);
    const estimatedMinutes = patientsAheadPerRoom * avgServiceTime;

    // Add buffer time (10% margin for transitions between patients)
    const bufferTime = Math.ceil(estimatedMinutes * 0.1);
    
    return Math.max(estimatedMinutes + bufferTime, 5); // Minimum 5 minutes
  }

  private async getAverageServiceTime(): Promise<number> {
    // Get completed entries from today
    const completed = await this.prisma.queueEntry.findMany({
      where: {
        status: QueueStatus.COMPLETED,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    if (completed.length === 0) {
      // If no completed entries today, use default
      return this.config.get<number>('AVERAGE_CONSULTATION_TIME', 20);
    }

    // Calculate actual service times
    const totalServiceTime = completed.reduce((sum, entry) => {
      if (entry.startedAt && entry.completedAt) {
        const serviceTime = entry.completedAt.getTime() - entry.startedAt.getTime();
        return sum + serviceTime / 1000 / 60; // Convert to minutes
      }
      return sum;
    }, 0);

    const avgTime = Math.round(totalServiceTime / completed.length);
    
    // Return average, but cap between 5 and 60 minutes for safety
    return Math.max(5, Math.min(avgTime, 60));
  }

  private async calculateAverageWaitTime(): Promise<number> {
    const completed = await this.prisma.queueEntry.findMany({
      where: {
        status: QueueStatus.COMPLETED,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      select: {
        checkedInAt: true,
        startedAt: true,
      },
    });

    if (completed.length === 0) return 0;

    const totalWait = completed.reduce((sum, entry) => {
      if (entry.startedAt) {
        const wait = entry.startedAt.getTime() - entry.checkedInAt.getTime();
        return sum + wait / 1000 / 60; // Convert to minutes
      }
      return sum;
    }, 0);

    return Math.round(totalWait / completed.length);
  }

  private async removeFromRedisQueue(id: string) {
    const allEntries = await this.redis.getAllInQueue(QUEUE_KEY);
    const entry = allEntries.find((e) => e.id === id);
    if (entry) {
      await this.redis.removeFromQueue(QUEUE_KEY, entry);
    }
  }
}

