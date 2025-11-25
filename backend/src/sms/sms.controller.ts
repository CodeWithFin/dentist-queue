import { Controller, Get, Post, Body } from '@nestjs/common';
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
  testSms(@Body() dto: SendTestSmsDto) {
    return this.smsService.testSms(dto.to, dto.message);
  }
}

