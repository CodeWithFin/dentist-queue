import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendTestSmsDto } from './dto';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get SMS statistics' })
  @ApiResponse({ status: 200, description: 'Returns SMS usage statistics' })
  getStats() {
    return this.smsService.getStats();
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test SMS' })
  @ApiResponse({ status: 200, description: 'Test SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - SMS failed to send' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async testSms(@Body() dto: SendTestSmsDto) {
    try {
      return await this.smsService.testSms(dto.to, dto.message);
    } catch (error) {
      // Re-throw HTTP exceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }
      // Wrap unexpected errors
      throw new HttpException(
        {
          statusCode: 500,
          message: 'Failed to send test SMS',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

