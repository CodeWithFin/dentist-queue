import { IsString, IsDateString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Provider (Dentist) ID' })
  @IsString()
  providerId: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'Scheduled time' })
  @IsDateString()
  scheduledTime: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes', default: 30 })
  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'Regular checkup', description: 'Reason for appointment' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Patient prefers morning slots', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}

