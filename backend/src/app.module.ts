import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BillsModule } from './bills/bills.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PatientsModule } from './patients/patients.module';
import { User } from './users/user.entity';
import { Patient } from './patients/patient.entity';
import { Bill } from './bills/bill.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'patient_management',
      entities: [User, Patient, Bill],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    PatientsModule,
    BillsModule,
    DashboardModule,
  ],
})
export class AppModule {}
