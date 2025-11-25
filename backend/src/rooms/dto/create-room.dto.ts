import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ example: 'R101', description: 'Room number' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ example: 'Treatment Room 1', description: 'Room name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional({ description: 'Provider ID assigned to this room' })
  @IsString()
  @IsOptional()
  providerId?: string;
}

