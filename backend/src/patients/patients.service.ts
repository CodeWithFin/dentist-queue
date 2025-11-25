import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { PatientStatus } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    try {
      const patient = await this.prisma.patient.create({
        data: createPatientDto,
      });
      return patient;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Patient with this email or phone already exists');
      }
      throw error;
    }
  }

  async findAll(search?: string, status?: string) {
    const where: any = {};

    if (status) {
      where.status = status as PatientStatus;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const patients = await this.prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            appointments: true,
            queueEntries: true,
          },
        },
      },
    });

    return patients;
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { scheduledTime: 'desc' },
          take: 10,
        },
        queueEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async findByPhone(phone: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { phone },
      include: {
        appointments: {
          where: {
            scheduledTime: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledTime: 'asc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with phone ${phone} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      const patient = await this.prisma.patient.update({
        where: { id },
        data: updatePatientDto,
      });
      return patient;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Patient with this email or phone already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.patient.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
      throw error;
    }
  }
}

