import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { Gender } from './patient.entity';
import { PatientsService } from './patients.service';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('gender', new ParseEnumPipe(Gender, { optional: true })) gender?: Gender,
  ) {
    return this.patients.findAll(search, gender);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patients.findOne(id);
  }

  @Post()
  create(@Body() body: CreatePatientDto) {
    return this.patients.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdatePatientDto) {
    return this.patients.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patients.remove(id);
  }
}
