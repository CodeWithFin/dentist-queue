import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly enabled: boolean;
  private readonly mockMode: boolean;
  private readonly apiKey: string;
  private readonly shortcode: string;
  private readonly clinicName: string;
  private readonly clinicPhone: string;
  private readonly minIntervalMinutes: number;
  private readonly apiUrl: string;
  private lastSentMap: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.enabled = this.configService.get<string>('SMS_ENABLED', 'false') === 'true';
    this.mockMode = this.configService.get<string>('SMS_MOCK_MODE', 'false') === 'true';
    this.apiKey = this.configService.get<string>('TILIL_API_KEY', '');
    this.shortcode = this.configService.get<string>('TILIL_SHORTCODE', '');
    this.clinicName = this.configService.get<string>('SMS_CLINIC_NAME', 'Dental Clinic');
    this.clinicPhone = this.configService.get<string>('SMS_CLINIC_PHONE', '');
    this.apiUrl = this.configService.get<string>(
      'SMS_ENDPOINT',
      'https://api.tililtech.com/sms/v3/sendsms',
    );
    this.minIntervalMinutes = parseInt(
      this.configService.get<string>('SMS_MIN_INTERVAL_MINUTES', '5'),
    );

    if (this.enabled && !this.mockMode) {
      if (!this.apiKey || !this.shortcode) {
        this.logger.warn('Tilil credentials not configured. SMS disabled.');
      } else {
        this.logger.log('SMS Service initialized with Tilil');
      }
    } else if (this.mockMode) {
      this.logger.log('SMS Service initialized in MOCK mode');
    } else {
      this.logger.log('SMS Service disabled');
    }
  }

  /**
   * Format phone number to Tilil format (254XXXXXXXXX)
   * Handles various formats: +254..., 254..., 07..., etc.
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('254')) {
      // Already in 254 format
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Kenyan format starting with 0 (e.g., 0726...)
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      // Kenyan format without leading 0 (e.g., 726...)
      return '254' + cleaned;
    } else if (cleaned.length >= 9) {
      // Assume it's a local number, add 254
      return '254' + cleaned;
    }

    // Return as-is if we can't determine format
    return cleaned;
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

  async sendSms(to: string, message: string, retryCount: number = 0): Promise<any> {
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

    if (!this.apiKey || !this.shortcode) {
      this.logger.error('Tilil API credentials not configured');
      throw new BadRequestException('Tilil API credentials not configured. Please check your environment variables.');
    }

    // Format phone number to Tilil format
    const formattedPhone = this.formatPhoneNumber(to);
    const maxRetries = 2;
    
    try {
      this.logger.log(`[SMS] Attempting to send to ${to} → formatted: ${formattedPhone}${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`);

      // Prepare request payload
      const payload = {
        api_key: this.apiKey,
        service_id: 0, // 0 for bulk messages
        mobile: formattedPhone,
        response_type: 'json',
        shortcode: this.shortcode,
        message: message,
      };

      this.logger.log(`[SMS] Payload: ${JSON.stringify({ ...payload, api_key: '***' })}`);
      this.logger.log(`[SMS] API URL: ${this.apiUrl}`);

      // Send SMS via Tilil API with increased timeout
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 60000, // Increased to 60 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      this.logger.log(`[SMS] ✅ SMS sent to ${to} (${formattedPhone}). Response: ${JSON.stringify(response.data)}`);
      this.logger.log(`[SMS] Response status: ${response.status}`);

      // Check if response indicates success or failure
      if (response.data && typeof response.data === 'object') {
        const responseStatus = response.data.status || response.data.Status || response.data.success;
        const responseMessage = response.data.message || response.data.Message || response.data.msg;
        
        if (responseStatus === 'success' || responseStatus === 'Success' || response.status === 200) {
          return {
            status: 'success',
            to: formattedPhone,
            message,
            response: response.data,
            timestamp: new Date().toISOString(),
          };
        } else {
          // API returned an error response
          this.logger.warn(`[SMS] ⚠️ API returned error status: ${responseStatus}, message: ${responseMessage}`);
          throw new BadRequestException({
            statusCode: 400,
            message: `SMS API error: ${responseMessage || 'Unknown error'}`,
            error: 'SMS_API_ERROR',
            details: response.data,
          });
        }
      }

      return {
        status: 'success',
        to: formattedPhone,
        message,
        response: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // Log detailed error information
      this.logger.error(`[SMS] ❌ Failed to send SMS to ${to}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      this.logger.error(`[SMS] Error type: ${error.constructor?.name || 'Unknown'}`);
      this.logger.error(`[SMS] Error message: ${error.message || 'No message'}`);
      this.logger.error(`[SMS] Error response: ${JSON.stringify(error.response?.data || {})}`);
      this.logger.error(`[SMS] Error code: ${error.code || 'No code'}`);
      if (error.response) {
        this.logger.error(`[SMS] HTTP Status: ${error.response.status}`);
        this.logger.error(`[SMS] Response headers: ${JSON.stringify(error.response.headers || {})}`);
      }
      
      // Extract error message from Tilil API response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.Message ||
                          error.message || 
                          'Unknown error occurred';
      
      // Check if it's a network/timeout error - retry if we haven't exceeded max retries
      if ((error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout') || error.code === 'ECONNREFUSED') && retryCount < maxRetries) {
        this.logger.warn(`[SMS] ⚠️ Network/timeout error - retrying (${retryCount + 1}/${maxRetries})...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.sendSms(to, message, retryCount + 1);
      }
      
      // If it's a timeout after all retries, log but don't throw
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        this.logger.error(`[SMS] ❌ Timeout after ${retryCount + 1} attempts - SMS likely NOT sent`);
        throw new InternalServerErrorException({
          statusCode: 500,
          message: `SMS service timeout: The SMS API did not respond within 60 seconds. The SMS was likely NOT sent. Please check your API credentials and network connection.`,
          error: 'SMS_TIMEOUT',
          details: {
            to: formattedPhone,
            attempts: retryCount + 1,
            apiUrl: this.apiUrl,
          },
        });
      }
      
      // If it's an axios error with response, it's likely a bad request
      if (error.response) {
        throw new BadRequestException({
          statusCode: error.response.status || 400,
          message: `Failed to send SMS: ${errorMessage}`,
          error: 'SMS_SEND_FAILED',
          details: error.response.data,
        });
      }
      
      // For network errors or other issues
      throw new InternalServerErrorException({
        statusCode: 500,
        message: `SMS service error: ${errorMessage}`,
        error: 'SMS_SERVICE_ERROR',
        details: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  async sendCheckInConfirmation(patientId: string, data: any): Promise<void> {
    this.logger.log(`[SMS] sendCheckInConfirmation called for patient ${patientId}`);
    
    const smsEnabled = this.configService.get<string>('SMS_ENABLED', 'true') === 'true';
    const sendOnCheckIn = this.configService.get<string>('SMS_SEND_ON_CHECKIN', 'true') === 'true';
    
    if (!smsEnabled) {
      this.logger.warn(`[SMS] SMS disabled`);
      return;
    }
    
    if (!sendOnCheckIn) {
      this.logger.warn(`[SMS] Check-in SMS disabled by config`);
      return;
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      this.logger.warn(`[SMS] Patient ${patientId} has no phone number`);
      return;
    }

    // Format wait time
    const waitTime = data.estimatedWait || 0;
    const waitTimeText = waitTime > 0 ? `${waitTime} minutes` : 'a few minutes';
    
    // Format position text
    const positionText = data.position > 0 
      ? `You are currently #${data.position} in the queue at ${this.clinicName}.`
      : `You are currently in the queue at ${this.clinicName}.`;

    const message = `${positionText} The estimated wait time is ${waitTimeText}. You will be notified when it is your turn.`;

    this.logger.log(`[SMS] Sending check-in confirmation to ${patient.phone}: ${message}`);
    
    try {
      await this.sendSms(patient.phone, message);
      this.markSent(patientId);
      this.logger.log(`[SMS] ✅ Check-in confirmation sent to ${patient.phone}`);
    } catch (error) {
      this.logger.error(`[SMS] ❌ Failed to send check-in confirmation:`, error);
      // Don't throw - allow check-in to succeed even if SMS fails
    }
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

  async sendCalledToRoom(
    patientId: string,
    roomName: string,
    doctorName?: string | null,
  ): Promise<void> {
    this.logger.log(`[SMS] ========== sendCalledToRoom START ==========`);
    this.logger.log(`[SMS] Patient ID: ${patientId}`);
    this.logger.log(`[SMS] Room: ${roomName}`);
    this.logger.log(`[SMS] Doctor: ${doctorName || 'None'}`);

    // Check if SMS is enabled and if called SMS is enabled
    const smsEnabled = this.configService.get<string>('SMS_ENABLED', 'true') === 'true';
    const sendOnCalled = this.configService.get<string>('SMS_SEND_ON_CALLED', 'true') === 'true';
    
    this.logger.log(`[SMS] Configuration - SMS_ENABLED: ${smsEnabled}, SMS_SEND_ON_CALLED: ${sendOnCalled}`);

    if (!smsEnabled) {
      this.logger.warn(`[SMS] ❌ SMS is disabled globally. SMS_ENABLED=${smsEnabled}`);
      return;
    }

    if (!sendOnCalled) {
      this.logger.warn(`[SMS] ❌ Called SMS is disabled. SMS_SEND_ON_CALLED=${sendOnCalled}`);
      return;
    }

    // ALWAYS send this critical SMS - no business hours restriction
    this.logger.log(`[SMS] Looking up patient ${patientId} in database...`);
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      this.logger.error(`[SMS] ❌ Patient ${patientId} not found in database`);
      throw new Error(`Patient ${patientId} not found`);
    }

    this.logger.log(`[SMS] Patient found: ${patient.firstName} ${patient.lastName}`);
    this.logger.log(`[SMS] Patient phone: ${patient.phone || 'NOT SET'}`);

    if (!patient.phone) {
      this.logger.error(`[SMS] ❌ Patient ${patientId} (${patient.firstName} ${patient.lastName}) has no phone number`);
      throw new Error(`Patient ${patient.firstName} ${patient.lastName} has no phone number`);
    }

    // Build message with room information - simple and clear
    // roomName is actually roomNumber (e.g., "101")
    let message: string;
    
    // Format room number - ensure it says "room 101" not just "101"
    const roomText = roomName.toLowerCase().includes('room') ? roomName : `room ${roomName}`;
    
    if (doctorName) {
      message = `Please go to ${roomText} for service. ${doctorName} is ready to see you.`;
    } else {
      message = `Please go to ${roomText} for service.`;
    }

    const formattedPhone = this.formatPhoneNumber(patient.phone);
    this.logger.log(`[SMS] Message: "${message}"`);
    this.logger.log(`[SMS] Phone: ${patient.phone} → formatted: ${formattedPhone}`);

    try {
      this.logger.log(`[SMS] Attempting to send SMS...`);
      const result = await this.sendSms(patient.phone, message);
      this.markSent(patientId);
      this.logger.log(`[SMS] ✅ Called to room SMS sent successfully!`);
      this.logger.log(`[SMS] Result: ${JSON.stringify(result)}`);
      this.logger.log(`[SMS] ========== sendCalledToRoom SUCCESS ==========`);
      return result;
    } catch (error: any) {
      this.logger.error(`[SMS] ❌ Failed to send called SMS`);
      this.logger.error(`[SMS] Error type: ${error.constructor?.name || 'Unknown'}`);
      this.logger.error(`[SMS] Error message: ${error.message || 'No message'}`);
      this.logger.error(`[SMS] Error code: ${error.code || 'No code'}`);
      if (error.response) {
        this.logger.error(`[SMS] Error response status: ${error.response.status}`);
        this.logger.error(`[SMS] Error response data: ${JSON.stringify(error.response.data || {})}`);
      }
      this.logger.error(`[SMS] Error stack:`, error.stack);
      this.logger.error(`[SMS] ========== sendCalledToRoom FAILED ==========`);
      throw error; // Re-throw to propagate error
    }
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

  async sendServiceCompleted(patientId: string, clinicName?: string): Promise<void> {
    this.logger.log(`[SMS] sendServiceCompleted called for patient ${patientId}`);

    // Check if SMS is enabled
    const smsEnabled = this.configService.get<string>('SMS_ENABLED', 'true') === 'true';
    
    this.logger.log(`[SMS] SMS_ENABLED: ${smsEnabled}`);

    if (!smsEnabled) {
      this.logger.warn(`[SMS] SMS disabled. SMS_ENABLED=${smsEnabled}`);
      return;
    }

    // Always send completion/thank you message (not restricted by business hours)
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.phone) {
      this.logger.warn(`[SMS] Patient ${patientId} has no phone for completion SMS`);
      return;
    }

    this.logger.log(`[SMS] Patient found: ${patient.firstName} ${patient.lastName}, phone: ${patient.phone}`);

    const clinic = clinicName || 'our dental clinic';
    
    const message = `Thank you for visiting ${clinic}! We sincerely hope you had a great experience.

Your feedback is invaluable to us—please share your thoughts to help us improve our services. We look forward to seeing you again soon!`;

    this.logger.log(`[SMS] Sending message: "${message}"`);
    this.logger.log(`[SMS] Patient phone: ${patient.phone}, formatted: ${this.formatPhoneNumber(patient.phone)}`);

    try {
      const result = await this.sendSms(patient.phone, message);
      this.markSent(patientId);
      this.logger.log(`[SMS] ✅ Completion SMS sent successfully to ${patient.phone}. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (error: any) {
      this.logger.error(`[SMS] ❌ Failed to send completion SMS:`, error);
      this.logger.error(`[SMS] Error details: ${error.message || 'Unknown error'}`);
      this.logger.error(`[SMS] Error stack:`, error.stack);
      throw error; // Re-throw to propagate error
    }
  }

  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    this.logger.log(`[SMS] sendAppointmentConfirmation called for appointment ${appointmentId}`);

    const smsEnabled = this.configService.get<string>('SMS_ENABLED', 'true') === 'true';
    
    if (!smsEnabled) {
      this.logger.warn(`[SMS] SMS disabled`);
      return;
    }

    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (!appointment) {
        this.logger.warn(`[SMS] Appointment ${appointmentId} not found`);
        return;
      }

      if (!appointment.patient || !appointment.patient.phone) {
        this.logger.warn(`[SMS] Appointment ${appointmentId} has no patient or phone`);
        return;
      }

      // Extract appointment type from reason (format: "Appointment Type - reason")
      // e.g., "Dental Cleaning - Regular cleaning" -> "Dental Cleaning"
      let appointmentType = 'appointment';
      if (appointment.reason && appointment.reason.includes(' - ')) {
        appointmentType = appointment.reason.split(' - ')[0].trim();
      } else if (appointment.reason) {
        appointmentType = appointment.reason.trim();
      }

      // Format date as "Nov 27, 2025"
      const appointmentDate = new Date(appointment.scheduledTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Format time as "10:30 AM"
      const appointmentTime = new Date(appointment.scheduledTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const message = `Appointment Confirmed! Your ${appointmentType} appointment is scheduled for ${appointmentDate} at ${appointmentTime}. See you then!`;

      this.logger.log(`[SMS] Sending booking confirmation to ${appointment.patient.phone} (formatted: ${this.formatPhoneNumber(appointment.patient.phone)})`);

      const result = await this.sendSms(appointment.patient.phone, message);
      this.markSent(appointment.patient.id);
      this.logger.log(`[SMS] ✅ Booking confirmation sent to ${appointment.patient.phone}. Result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      this.logger.error(`[SMS] ❌ Failed to send booking confirmation:`, error);
      this.logger.error(`[SMS] Error details: ${error.message || 'Unknown error'}`);
      this.logger.error(`[SMS] Error stack:`, error.stack);
      // Don't throw error - allow booking to succeed even if SMS fails
    }
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
        cost: this.lastSentMap.size * 0.5, // Approximate cost per SMS in KES
      },
      enabled: this.enabled,
      mockMode: this.mockMode,
      provider: 'Tilil',
    };
  }

  async testSms(to: string, message: string): Promise<any> {
    this.logger.log(`Test SMS requested to ${to}`);
    return await this.sendSms(to, message);
  }
}
