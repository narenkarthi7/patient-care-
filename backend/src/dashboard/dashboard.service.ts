import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, PaymentStatus } from '../bills/bill.entity';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Bill) private readonly bills: Repository<Bill>,
  ) {}

  async getSummary() {
    const [totalPatients, totalBills, paid, pending, recentPatients] = await Promise.all([
      this.patients.count(),
      this.bills.count(),
      this.bills.createQueryBuilder('bill')
        .select('COALESCE(SUM(bill.totalAmount), 0)', 'total')
        .where('bill.status = :status', { status: PaymentStatus.Paid })
        .getRawOne<{ total: string }>(),
      this.bills.createQueryBuilder('bill')
        .select('COALESCE(SUM(bill.totalAmount), 0)', 'total')
        .where('bill.status = :status', { status: PaymentStatus.Pending })
        .getRawOne<{ total: string }>(),
      this.patients.find({ order: { createdAt: 'DESC' }, take: 5 }),
    ]);
    return {
      totalPatients,
      totalBills,
      totalPaidAmount: Number(paid?.total ?? 0),
      totalPendingAmount: Number(pending?.total ?? 0),
      recentPatients,
    };
  }
}
