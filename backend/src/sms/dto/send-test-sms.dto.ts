import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestSmsDto {
  @ApiProperty({ example: '+15551234567', description: 'Recipient phone number' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Test message', description: 'SMS message content' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

