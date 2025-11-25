import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Returns all patients' })
  findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.patientsService.findAll(search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Returns the patient' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Get patient by phone number' })
  @ApiResponse({ status: 200, description: 'Returns the patient' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPhone(@Param('phone') phone: string) {
    return this.patientsService.findByPhone(phone);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({ status: 204, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}

