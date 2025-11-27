import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus, QueuePriority, QueueStatus } from '@prisma/client';
import { QueueService } from '../queue/queue.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => QueueService))
    private queueService: QueueService,
    private smsService: SmsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      // Check if patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: createAppointmentDto.patientId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Check if provider exists
      const provider = await this.prisma.provider.findUnique({
        where: { id: createAppointmentDto.providerId },
      });
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      // Ensure scheduledTime is a proper Date object
      const scheduledTime = new Date(createAppointmentDto.scheduledTime);
      if (isNaN(scheduledTime.getTime())) {
        throw new BadRequestException('Invalid scheduled time format');
      }

      // Prepare appointment data
      const appointmentData = {
        ...createAppointmentDto,
        scheduledTime: scheduledTime,
        duration: createAppointmentDto.duration || 30,
        status: createAppointmentDto.status || AppointmentStatus.SCHEDULED,
      };

      const appointment = await this.prisma.appointment.create({
        data: appointmentData,
        include: {
          patient: true,
          provider: true,
        },
      });

      // Send booking confirmation SMS
      try {
        await this.smsService.sendAppointmentConfirmation(appointment.id);
      } catch (error) {
        console.error('Failed to send booking confirmation SMS:', error);
        // Don't fail the booking if SMS fails
      }

      // Note: Appointments will be automatically added to queue by the scheduler
      // when their scheduled time is reached (handled by AppointmentScheduler service)
      
      return appointment;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException('An appointment already exists at this time');
      }
      
      // Log and re-throw unknown errors
      console.error('Error creating appointment:', error);
      throw new BadRequestException(
        error.message || 'Failed to create appointment. Please check your input and try again.',
      );
    }
  }

  async findAll(filters: {
    patientId?: string;
    providerId?: string;
    status?: string;
    date?: string;
  }) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.providerId) {
      where.providerId = filters.providerId;
    }

    if (filters.status) {
      where.status = filters.status as AppointmentStatus;
    }

    if (filters.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      where.scheduledTime = {
        gte: date,
        lt: nextDay,
      };
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { scheduledTime: 'asc' },
      include: {
        patient: true,
        provider: true,
      },
    });

    return appointments;
  }

  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED],
        },
      },
      orderBy: { scheduledTime: 'asc' },
      include: {
        patient: true,
        provider: true,
        queueEntry: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: true,
        queueEntry: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: updateAppointmentDto,
        include: {
          patient: true,
          provider: true,
        },
      });
      return appointment;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    try {
      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          patient: true,
          provider: true,
        },
      });
      return appointment;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }
      throw error;
    }
  }

  async cancel(id: string) {
    try {
      await this.prisma.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }
      throw error;
    }
  }
}

