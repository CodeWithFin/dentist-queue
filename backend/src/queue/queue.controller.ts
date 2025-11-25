import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { CheckInDto, UpdateQueueStatusDto } from './dto';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check-in a patient (walk-in or appointment)' })
  @ApiResponse({ status: 201, description: 'Patient checked in successfully' })
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.queueService.checkIn(checkInDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current queue' })
  @ApiResponse({ status: 200, description: 'Returns current queue' })
  getCurrentQueue() {
    return this.queueService.getCurrentQueue();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Returns queue statistics' })
  getStats() {
    return this.queueService.getQueueStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get queue entry by ID' })
  @ApiResponse({ status: 200, description: 'Returns queue entry' })
  @ApiResponse({ status: 404, description: 'Queue entry not found' })
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(id);
  }

  @Get('patient/:patientId/position')
  @ApiOperation({ summary: 'Get patient queue position and ETA' })
  @ApiResponse({ status: 200, description: 'Returns position and ETA' })
  getPosition(@Param('patientId') patientId: string) {
    return this.queueService.getPatientPosition(patientId);
  }

  @Patch(':id/call-next')
  @ApiOperation({ summary: 'Call next patient in queue' })
  @ApiResponse({ status: 200, description: 'Patient called successfully' })
  callNext(@Param('id') id: string, @Body() body: { roomId: string }) {
    return this.queueService.callNextPatient(id, body.roomId);
  }

  @Patch(':id/start-service')
  @ApiOperation({ summary: 'Start serving a patient' })
  @ApiResponse({ status: 200, description: 'Service started' })
  startService(@Param('id') id: string) {
    return this.queueService.startService(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete patient service' })
  @ApiResponse({ status: 200, description: 'Service completed' })
  complete(@Param('id') id: string) {
    return this.queueService.completeService(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update queue entry status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateQueueStatusDto) {
    return this.queueService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove patient from queue' })
  @ApiResponse({ status: 204, description: 'Patient removed from queue' })
  remove(@Param('id') id: string) {
    return this.queueService.removeFromQueue(id);
  }
}

