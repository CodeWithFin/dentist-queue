import { IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientStatus } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'John', description: 'First name of the patient' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the patient' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '123 Main St, City', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Allergic to penicillin', description: 'Medical notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: PatientStatus, default: PatientStatus.ACTIVE })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;
}

