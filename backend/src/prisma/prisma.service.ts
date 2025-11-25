import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Clean all tables for testing
    await this.notification.deleteMany();
    await this.queueEntry.deleteMany();
    await this.appointment.deleteMany();
    await this.room.deleteMany();
    await this.provider.deleteMany();
    await this.patient.deleteMany();
    await this.systemConfig.deleteMany();
  }
}

