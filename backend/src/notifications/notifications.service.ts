import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        patient: true,
      },
    });

    return notification;
  }

  async findAll(patientId?: string, unreadOnly = false) {
    const where: any = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (unreadOnly) {
      where.read = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      include: {
        patient: true,
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.notification.findMany({
      where: { patientId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(patientId: string) {
    return this.prisma.notification.updateMany({
      where: { patientId, read: false },
      data: { read: true },
    });
  }

  // Helper method to create specific notification types
  async notifyQueuePositionChange(patientId: string, position: number, eta: number) {
    return this.create({
      patientId,
      type: NotificationType.QUEUE_POSITION_CHANGE,
      title: 'Queue Position Updated',
      message: `Your position is now #${position}. Estimated wait: ${eta} minutes`,
    });
  }

  async notifyPatientCalled(patientId: string, roomNumber: string) {
    return this.create({
      patientId,
      type: NotificationType.PATIENT_CALLED,
      title: 'You are being called',
      message: `Please proceed to ${roomNumber}`,
    });
  }

  async notifyRoomReady(patientId: string, roomNumber: string) {
    return this.create({
      patientId,
      type: NotificationType.ROOM_READY,
      title: 'Room Ready',
      message: `${roomNumber} is now ready for you`,
    });
  }
}

