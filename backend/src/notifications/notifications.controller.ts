import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns notifications' })
  findAll(@Query('patientId') patientId?: string, @Query('unreadOnly') unreadOnly?: boolean) {
    return this.notificationsService.findAll(patientId, unreadOnly === true);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get notifications for a patient' })
  @ApiResponse({ status: 200, description: 'Returns patient notifications' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.notificationsService.findByPatient(patientId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('patient/:patientId/read-all')
  @ApiOperation({ summary: 'Mark all patient notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@Param('patientId') patientId: string) {
    return this.notificationsService.markAllAsRead(patientId);
  }
}

