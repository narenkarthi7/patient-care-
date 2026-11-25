import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly bills: BillsService) {}

  @Get()
  findAll() {
    return this.bills.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bills.findOne(id);
  }

  @Post()
  create(@Body() body: CreateBillDto) {
    return this.bills.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateBillDto) {
    return this.bills.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bills.remove(id);
  }
}
