import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { QueueModule } from '../queue/queue.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    forwardRef(() => QueueModule),
    SmsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentSchedulerService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

