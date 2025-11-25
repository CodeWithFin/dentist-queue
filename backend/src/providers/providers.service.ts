import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto, UpdateProviderDto } from './dto';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(createProviderDto: CreateProviderDto) {
    try {
      const provider = await this.prisma.provider.create({
        data: createProviderDto,
      });
      return provider;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Provider with this email or license number already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.provider.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        rooms: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });
  }

  async findActive() {
    return this.prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { lastName: 'asc' },
      include: {
        rooms: true,
      },
    });
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        rooms: true,
        appointments: {
          orderBy: { scheduledTime: 'desc' },
          take: 10,
          include: {
            patient: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto) {
    try {
      const provider = await this.prisma.provider.update({
        where: { id },
        data: updateProviderDto,
      });
      return provider;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Provider with this email or license number already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.provider.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }
      throw error;
    }
  }
}

