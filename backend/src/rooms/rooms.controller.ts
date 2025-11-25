import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from './dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Returns all rooms' })
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available rooms' })
  @ApiResponse({ status: 200, description: 'Returns available rooms' })
  findAvailable() {
    return this.roomsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Returns the room' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update room status' })
  @ApiResponse({ status: 200, description: 'Room status updated' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete room' })
  @ApiResponse({ status: 204, description: 'Room deleted successfully' })
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}

