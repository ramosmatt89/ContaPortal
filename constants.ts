import { Client, Document, DocStatus, DocType, TaxObligation } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    companyName: 'TechSolutions Lda',
    nif: '501234567',
    contactPerson: 'João Silva',
    email: 'joao@techsolutions.pt',
    avatarUrl: 'https://picsum.photos/200',
    status: 'ACTIVE',
    pendingDocs: 2,
    nextTaxDeadline: '2024-06-20',
    accountantId: 'a1'
  },
  {
    id: 'c2',
    companyName: 'Café Lisboa',
    nif: '509876543',
    contactPerson: 'Maria Santos',
    email: 'geral@cafelisboa.pt',
    avatarUrl: 'https://picsum.photos/201',
    status: 'OVERDUE',
    pendingDocs: 5,
    nextTaxDeadline: '2024-06-15',
    accountantId: 'a1'
  },
  {
    id: 'c3',
    companyName: 'Construções Norte SA',
    nif: '505555555',
    contactPerson: 'Pedro Costa',
    email: 'admin@cnorte.pt',
    avatarUrl: 'https://picsum.photos/202',
    status: 'INVITED',
    pendingDocs: 0,
    accountantId: 'a1'
  },
  {
    id: 'c4',
    companyName: 'Design Studio Unipessoal',
    nif: '503333333',
    contactPerson: 'Ana Sousa',
    email: 'ana@design.pt',
    avatarUrl: 'https://picsum.photos/203',
    status: 'INACTIVE',
    pendingDocs: 0,
    accountantId: 'a1'
  }
];

export const MOCK_DOCS: Document[] = [
  {
    id: 'd1',
    title: 'Fatura Fornecedor XYZ',
    type: DocType.INVOICE,
    date: '2024-06-01',
    status: DocStatus.PENDING,
    amount: 1230.50,
    clientId: 'c1'
  },
  {
    id: 'd2',
    title: 'Extrato Bancário Maio',
    type: DocType.BANK_STATEMENT,
    date: '2024-06-02',
    status: DocStatus.APPROVED,
    clientId: 'c1'
  },
  {
    id: 'd3',
    title: 'Declaração IVA Trimestral',
    type: DocType.TAX_DECLARATION,
    date: '2024-05-20',
    status: DocStatus.APPROVED,
    clientId: 'c1'
  },
  {
    id: 'd4',
    title: 'Despesas Almoço Negócios',
    type: DocType.EXPENSE,
    date: '2024-06-03',
    status: DocStatus.REJECTED,
    amount: 45.00,
    clientId: 'c1'
  }
];

export const MOCK_OBLIGATIONS: TaxObligation[] = [
  {
    id: 't1',
    name: 'IVA - Declaração Periódica',
    deadline: '2024-06-20',
    status: 'PENDING',
    amount: 1450.00
  },
  {
    id: 't2',
    name: 'TSU - Segurança Social',
    deadline: '2024-06-20',
    status: 'PENDING',
    amount: 320.50
  },
  {
    id: 't3',
    name: 'Retenção na Fonte IRS',
    deadline: '2024-06-20',
    status: 'PAID',
    amount: 150.00
  }
];