import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueuePriority } from '@prisma/client';

export class CheckInDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiPropertyOptional({ description: 'Appointment ID (if checking in for an appointment)' })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ 
    enum: QueuePriority, 
    example: QueuePriority.NORMAL,
    description: 'Priority level: EMERGENCY > URGENT > APPOINTMENT > NORMAL' 
  })
  @IsEnum(QueuePriority)
  priority: QueuePriority;

  @ApiProperty({ example: 'Toothache', description: 'Reason for visit' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Patient arrived 10 minutes early', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

