import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Bill } from '../bills/bill.entity';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { Gender, Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Bill) private readonly bills: Repository<Bill>,
  ) {}

  findAll(search?: string, gender?: Gender) {
    const query = this.patients.createQueryBuilder('patient').orderBy('patient.createdAt', 'DESC');
    if (search?.trim()) query.andWhere('patient.name ILIKE :search', { search: `%${search.trim()}%` });
    if (gender && Object.values(Gender).includes(gender)) query.andWhere('patient.gender = :gender', { gender });
    return query.getMany();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patients.findOneBy({ id });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(input: CreatePatientDto): Promise<Patient> {
    try {
      return await this.patients.save(this.patients.create({
        ...input,
        email: input.email.trim().toLowerCase(),
        name: input.name.trim(),
      }));
    } catch (error) {
      this.throwForEmailConflict(error);
      throw error;
    }
  }

  async update(id: string, input: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, input);
    if (input.email) patient.email = input.email.trim().toLowerCase();
    if (input.name) patient.name = input.name.trim();
    try {
      return await this.patients.save(patient);
    } catch (error) {
      this.throwForEmailConflict(error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.findOne(id);
    if (await this.bills.countBy({ patientId: id })) {
      throw new ConflictException('This patient has bills and cannot be deleted');
    }
    await this.patients.remove(patient);
    return { message: 'Patient deleted' };
  }

  private throwForEmailConflict(error: unknown): void {
    if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === '23505') {
      throw new ConflictException('A patient with this email already exists');
    }
  }
}
