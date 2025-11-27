import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestSmsDto {
  @ApiProperty({ example: '+254726770792', description: 'Recipient phone number (Kenyan format)' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Test message', description: 'SMS message content' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

