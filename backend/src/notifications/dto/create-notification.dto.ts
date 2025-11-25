import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiPropertyOptional({ description: 'Patient ID (optional for system-wide notifications)' })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'Queue Update', description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your position is now #3', description: 'Notification message' })
  @IsString()
  message: string;
}

