import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    try {
      const room = await this.prisma.room.create({
        data: createRoomDto,
        include: {
          provider: true,
        },
      });
      return room;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Room with this number already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.room.findMany({
      orderBy: { roomNumber: 'asc' },
      include: {
        provider: true,
        _count: {
          select: {
            queueEntries: true,
          },
        },
      },
    });
  }

  async findAvailable() {
    return this.prisma.room.findMany({
      where: { status: RoomStatus.AVAILABLE },
      orderBy: { roomNumber: 'asc' },
      include: {
        provider: true,
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        provider: true,
        queueEntries: {
          where: {
            status: {
              in: ['WAITING', 'CALLED', 'IN_SERVICE'],
            },
          },
          include: {
            patient: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    try {
      const room = await this.prisma.room.update({
        where: { id },
        data: updateRoomDto,
        include: {
          provider: true,
        },
      });
      return room;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Room with this number already exists');
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: RoomStatus) {
    try {
      const room = await this.prisma.room.update({
        where: { id },
        data: { status },
        include: {
          provider: true,
        },
      });
      return room;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.room.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }
}

