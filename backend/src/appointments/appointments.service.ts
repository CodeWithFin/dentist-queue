import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
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

    const appointment = await this.prisma.appointment.create({
      data: createAppointmentDto,
      include: {
        patient: true,
        provider: true,
      },
    });

    return appointment;
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

