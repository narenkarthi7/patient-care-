import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Patient } from '../patients/patient.entity';
import { Bill } from './bill.entity';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Patient]), AuthModule],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
