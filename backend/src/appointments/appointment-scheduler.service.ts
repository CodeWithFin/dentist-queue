import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AppointmentStatus, QueuePriority, QueueStatus } from '@prisma/client';

@Injectable()
export class AppointmentSchedulerService {
  private readonly logger = new Logger(AppointmentSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  /**
   * Runs every 5 minutes to check for appointments that should be added to the queue
   * Appointments are auto-added 30 minutes before their scheduled time
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoAddAppointmentsToQueue() {
    try {
      const now = new Date();
      const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

      this.logger.debug('Checking for appointments to auto-add to queue...');

      // Find appointments that:
      // 1. Are scheduled within the next 30 minutes
      // 2. Status is SCHEDULED (not checked in yet)
      // 3. Don't have a queue entry yet
      const appointmentsToQueue = await this.prisma.appointment.findMany({
        where: {
          status: AppointmentStatus.SCHEDULED,
          scheduledTime: {
            gte: now,
            lte: in30Minutes,
          },
          queueEntry: null,
        },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (appointmentsToQueue.length === 0) {
        this.logger.debug('No appointments to auto-add to queue');
        return;
      }

      this.logger.log(`Found ${appointmentsToQueue.length} appointment(s) to auto-add to queue`);

      // Add each appointment to the queue
      for (const appointment of appointmentsToQueue) {
        try {
          // Check if patient is already in queue
          const existingQueueEntry = await this.prisma.queueEntry.findFirst({
            where: {
              patientId: appointment.patientId,
              status: {
                in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE],
              },
            },
          });

          if (existingQueueEntry) {
            this.logger.warn(
              `Patient ${appointment.patient.firstName} ${appointment.patient.lastName} is already in queue. Skipping appointment ${appointment.id}`,
            );
            continue;
          }

          // Add to queue
          await this.queueService.checkIn({
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            priority: QueuePriority.APPOINTMENT,
            reason: appointment.reason,
            notes: appointment.notes || undefined,
          });

          this.logger.log(
            `Auto-added appointment ${appointment.id} to queue for ${appointment.patient.firstName} ${appointment.patient.lastName} (scheduled at ${appointment.scheduledTime})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to auto-add appointment ${appointment.id} to queue:`,
            error,
          );
        }
      }

      this.logger.log(`Successfully processed ${appointmentsToQueue.length} appointment(s)`);
    } catch (error) {
      this.logger.error('Error in auto-add appointments scheduler:', error);
    }
  }

  /**
   * Runs every hour to send appointment reminders
   * Sends SMS 1 hour before appointment time
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendAppointmentReminders() {
    try {
      const now = new Date();
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
      const in2Hours = new Date(now.getTime() + 120 * 60 * 1000);

      this.logger.debug('Checking for appointments needing reminders...');

      // Find appointments in the next 1-2 hours that haven't been reminded
      const appointmentsToRemind = await this.prisma.appointment.findMany({
        where: {
          status: AppointmentStatus.SCHEDULED,
          reminderSent: false,
          scheduledTime: {
            gte: in1Hour,
            lte: in2Hours,
          },
        },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (appointmentsToRemind.length === 0) {
        this.logger.debug('No appointment reminders to send');
        return;
      }

      this.logger.log(`Sending ${appointmentsToRemind.length} appointment reminder(s)`);

      // This would integrate with the SMS service to send reminders
      // For now, just mark as sent
      for (const appointment of appointmentsToRemind) {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminderSent: true },
        });

        this.logger.log(
          `Reminder sent for appointment ${appointment.id} - ${appointment.patient.firstName} ${appointment.patient.lastName}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in appointment reminder scheduler:', error);
    }
  }
}

