import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
    
    // Auto-seed database if empty (for production)
    await this.autoSeedIfEmpty();
  }

  private async autoSeedIfEmpty() {
    try {
      // Check if database has any providers (indicator that it's been seeded)
      const providerCount = await this.provider.count();
      
      if (providerCount === 0) {
        console.log('🌱 Database is empty, running seed...');
        
        // Run the seed script
        const seedPath = join(__dirname, '../../prisma/seed.ts');
        execSync(`npx ts-node ${seedPath}`, { 
          stdio: 'inherit',
          cwd: join(__dirname, '../..'),
        });
        
        console.log('✅ Auto-seed completed');
      } else {
        console.log(`✅ Database already seeded (${providerCount} providers found)`);
      }
    } catch (error) {
      console.error('⚠️ Auto-seed check failed:', error.message);
      // Don't throw - allow app to start even if seed fails
    }
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

