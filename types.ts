export enum UserRole {
  CLIENT = 'CLIENT',
  ACCOUNTANT = 'ACCOUNTANT',
  NONE = 'NONE'
}

export enum DocStatus {
  PENDING = 'PENDENTE',
  REVIEWING = 'EM_ANALISE',
  APPROVED = 'APROVADO',
  REJECTED = 'REJEITADO'
}

export enum DocType {
  INVOICE = 'FATURA',
  EXPENSE = 'DESPESA',
  BANK_STATEMENT = 'EXTRATO',
  SALARY = 'SALARIOS',
  TAX_DECLARATION = 'IMPOSTO'
}

export interface Document {
  id: string;
  title: string;
  type: DocType;
  date: string; // ISO string
  status: DocStatus;
  amount?: number;
  fileUrl?: string;
  clientId: string;
}

export interface Client {
  id: string;
  companyName: string;
  nif: string; // Número de Identificação Fiscal
  contactPerson: string;
  email: string;
  avatarUrl: string;
  // Added INVITED and INACTIVE for the invitation flow
  status: 'ACTIVE' | 'PENDING' | 'OVERDUE' | 'INVITED' | 'INACTIVE';
  pendingDocs: number;
  nextTaxDeadline?: string;
  accountantId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

export interface TaxObligation {
  id: string;
  name: string; // e.g., "IVA Trimestral", "TSU"
  deadline: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  amount: number;
}