import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ example: 'Jane', description: 'First name of the dentist' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of the dentist' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jane.smith@dentist.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'Orthodontics', description: 'Speciality' })
  @IsString()
  @IsOptional()
  speciality?: string;

  @ApiProperty({ example: 'DEN123456', description: 'License number' })
  @IsString()
  licenseNo: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

