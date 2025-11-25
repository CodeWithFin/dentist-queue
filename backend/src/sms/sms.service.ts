import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: any;
  private readonly enabled: boolean;
  private readonly mockMode: boolean;
  private readonly from: string;
  private readonly clinicName: string;
  private readonly clinicPhone: string;
  private readonly minIntervalMinutes: number;
  private lastSentMap: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.enabled = this.configService.get<string>('SMS_ENABLED', 'false') === 'true';
    this.mockMode = this.configService.get<string>('SMS_MOCK_MODE', 'false') === 'true';
    this.from = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');
    this.clinicName = this.configService.get<string>('SMS_CLINIC_NAME', 'Dental Clinic');
    this.clinicPhone = this.configService.get<string>('SMS_CLINIC_PHONE', '');
    this.minIntervalMinutes = parseInt(
      this.configService.get<string>('SMS_MIN_INTERVAL_MINUTES', '5'),
    );

    if (this.enabled && !this.mockMode) {
      try {
        // Dynamic import of Twilio
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

        if (!accountSid || !authToken) {
          this.logger.warn('Twilio credentials not configured. SMS disabled.');
          return;
        }

        // Twilio will be imported dynamically when needed
        this.logger.log('SMS Service initialized with Twilio');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client', error);
      }
    } else if (this.mockMode) {
      this.logger.log('SMS Service initialized in MOCK mode');
    } else {
      this.logger.log('SMS Service disabled');
    }
  }

  private async getTwilioClient() {
    if (!this.twilioClient) {
      try {
        const twilio = require('twilio');
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.twilioClient = twilio(accountSid, authToken);
      } catch (error) {
        this.logger.error('Twilio package not installed. Run: npm install twilio');
        throw new Error('Twilio not available');
      }
    }
    return this.twilioClient;
  }

  private canSendToPatient(patientId: string): boolean {
    const lastSent = this.lastSentMap.get(patientId);
    if (!lastSent) return true;

    const minutesSinceLast = (Date.now() - lastSent) / 1000 / 60;
    return minutesSinceLast >= this.minIntervalMinutes;
  }

  private markSent(patientId: string) {
    this.lastSentMap.set(patientId, Date.now());
  }

  private isBusinessHours(): boolean {
    const startHour = parseInt(
      this.configService.get<string>('SMS_BUSINESS_HOURS_START', '08:00').split(':')[0],
    );
    const endHour = parseInt(
      this.configService.get<string>('SMS_BUSINESS_HOURS_END', '18:00').split(':')[0],
    );

    const currentHour = new Date().getHours();
    return currentHour >= startHour && currentHour < endHour;
  }

  async sendSms(to: string, message: string): Promise<any> {
    if (!this.enabled) {
      this.logger.debug(`SMS disabled: Would send to ${to}: ${message}`);
      return { status: 'disabled', message: 'SMS service is disabled' };
    }

    if (this.mockMode) {
      this.logger.log(`MOCK SMS to ${to}: ${message}`);
      return {
        status: 'mock',
        to,
        message,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const client = await this.getTwilioClient();
      const result = await client.messages.create({
        body: message,
        from: this.from,
        to: to,
      });

      this.logger.log(`SMS sent to ${to}. SID: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error);
      throw error;
    }
  }

  async sendCheckInConfirmation(patientId: string, data: any): Promise<void> {
    if (
      this.configService.get<string>('SMS_SEND_ON_CHECKIN', 'true') !== 'true' ||
      !this.canSendToPatient(patientId)
    ) {
      return;
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      this.logger.warn(`Patient ${patientId} has no phone number`);
      return;
    }

    const message = `Welcome to ${this.clinicName}! You're #${data.queueNumber} in queue, position ${data.position}. Estimated wait: ~${data.estimatedWait} minutes. We'll text you when it's your turn!`;

    await this.sendSms(patient.phone, message);
    this.markSent(patientId);
  }

  async sendPositionUpdate(patientId: string, data: any): Promise<void> {
    if (
      this.configService.get<string>('SMS_SEND_ON_POSITION_CHANGE', 'true') !== 'true' ||
      !this.canSendToPatient(patientId) ||
      !this.isBusinessHours()
    ) {
      return;
    }

    const threshold = parseInt(
      this.configService.get<string>('SMS_POSITION_CHANGE_THRESHOLD', '3'),
    );

    // Only send if position change is significant
    if (data.oldPosition - data.newPosition < threshold) {
      return;
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      return;
    }

    const message = `Queue Update: You're now #${data.newPosition} in line! Estimated wait: ~${data.estimatedWait} minutes. Please stay nearby.`;

    await this.sendSms(patient.phone, message);
    this.markSent(patientId);
  }

  async sendCalledToRoom(patientId: string, roomName: string): Promise<void> {
    if (
      this.configService.get<string>('SMS_SEND_ON_CALLED', 'true') !== 'true' ||
      !this.isBusinessHours()
    ) {
      return;
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      return;
    }

    const message = `🔔 You're being called! Please proceed to ${roomName}.`;

    await this.sendSms(patient.phone, message);
    this.markSent(patientId);
  }

  async sendAlmostYourTurn(patientId: string, position: number): Promise<void> {
    if (!this.canSendToPatient(patientId) || !this.isBusinessHours()) {
      return;
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      return;
    }

    const message = `⏰ Almost your turn! You're #${position} in line. Please return to waiting area.`;

    await this.sendSms(patient.phone, message);
    this.markSent(patientId);
  }

  async sendAppointmentReminder(appointmentId: string): Promise<void> {
    if (this.configService.get<string>('SMS_SEND_APPOINTMENT_REMINDER', 'true') !== 'true') {
      return;
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment || !appointment.patient.phone) {
      return;
    }

    const scheduledDate = new Date(appointment.scheduledTime);
    const timeStr = scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    const message = `Reminder: Your dental appointment is ${dateStr} at ${timeStr}. Reply CONFIRM or call us at ${this.clinicPhone}.`;

    await this.sendSms(appointment.patient.phone, message);
  }

  async getStats(): Promise<any> {
    // In a real implementation, you'd store SMS logs in database
    // For now, return mock stats
    return {
      today: {
        sent: this.lastSentMap.size,
        delivered: this.lastSentMap.size,
        failed: 0,
        cost: this.lastSentMap.size * 0.0075,
      },
      enabled: this.enabled,
      mockMode: this.mockMode,
    };
  }

  async testSms(to: string, message: string): Promise<any> {
    this.logger.log(`Test SMS requested to ${to}`);
    return await this.sendSms(to, message);
  }
}

