import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto, UpdateProviderDto } from './dto';

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new provider (dentist)' })
  @ApiResponse({ status: 201, description: 'Provider created successfully' })
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({ status: 200, description: 'Returns all providers' })
  findAll() {
    return this.providersService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active providers' })
  @ApiResponse({ status: 200, description: 'Returns active providers' })
  findActive() {
    return this.providersService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: 200, description: 'Returns the provider' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update provider' })
  @ApiResponse({ status: 200, description: 'Provider updated successfully' })
  update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providersService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider' })
  @ApiResponse({ status: 204, description: 'Provider deleted successfully' })
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }
}

