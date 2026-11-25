import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Bill } from '../bills/bill.entity';

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Other = 'Other',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'smallint' })
  age!: number;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ length: 30 })
  phone!: string;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ type: 'text' })
  address!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Bill, (bill) => bill.patient)
  bills!: Bill[];
}
