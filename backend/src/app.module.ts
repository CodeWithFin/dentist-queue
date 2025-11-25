import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { PatientsModule } from './patients/patients.module';
import { ProvidersModule } from './providers/providers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { RoomsModule } from './rooms/rooms.module';
import { QueueModule } from './queue/queue.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SmsModule } from './sms/sms.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    PatientsModule,
    ProvidersModule,
    AppointmentsModule,
    RoomsModule,
    QueueModule,
    NotificationsModule,
    WebsocketModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

