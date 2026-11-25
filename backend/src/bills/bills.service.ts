import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Bill, PaymentStatus } from './bill.entity';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function billTotal(amount: number, tax: number): string {
  const totalCents = toCents(amount) + toCents(tax);
  if (totalCents > 999999999999) {
    throw new BadRequestException('Bill total exceeds the supported maximum');
  }
  return fromCents(totalCents);
}

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill) private readonly bills: Repository<Bill>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
  ) {}

  findAll() {
    return this.bills.find({ relations: { patient: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.bills.findOne({ where: { id }, relations: { patient: true } });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async create(input: CreateBillDto): Promise<Bill> {
    const patient = await this.patients.findOneBy({ id: input.patientId });
    if (!patient) throw new NotFoundException('Patient not found');
    const amount = toCents(input.amount);
    const tax = toCents(input.tax);
    const totalAmount = billTotal(input.amount, input.tax);
    return this.bills.save(this.bills.create({
      patientId: patient.id,
      description: input.description.trim(),
      amount: fromCents(amount),
      tax: fromCents(tax),
      totalAmount,
      status: PaymentStatus.Pending,
    }));
  }

  async update(id: string, input: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);
    if (input.patientId) {
      const patient = await this.patients.findOneBy({ id: input.patientId });
      if (!patient) throw new NotFoundException('Patient not found');
      bill.patientId = patient.id;
    }
    if (input.description !== undefined) bill.description = input.description.trim();
    if (input.amount !== undefined) bill.amount = fromCents(toCents(input.amount));
    if (input.tax !== undefined) bill.tax = fromCents(toCents(input.tax));
    if (input.status !== undefined) bill.status = input.status;
    bill.totalAmount = billTotal(Number(bill.amount), Number(bill.tax));
    return this.bills.save(bill);
  }

  async remove(id: string): Promise<{ message: string }> {
    const bill = await this.findOne(id);
    await this.bills.remove(bill);
    return { message: 'Bill deleted' };
  }
}
