import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueStatus } from '@prisma/client';

export class UpdateQueueStatusDto {
  @ApiProperty({ enum: QueueStatus, description: 'New queue status' })
  @IsEnum(QueueStatus)
  status: QueueStatus;
}

