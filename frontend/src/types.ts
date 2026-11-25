export type Gender = 'Female' | 'Male' | 'Other';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patient: Patient;
  description: string;
  amount: string;
  tax: string;
  totalAmount: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalPatients: number;
  totalBills: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  recentPatients: Patient[];
}
