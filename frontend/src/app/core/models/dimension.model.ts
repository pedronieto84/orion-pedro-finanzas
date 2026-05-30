export interface Dimension {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  dimensionId: string;
  bank: string;
  iban: string;
  alias: string;
  balance: number;
  currency: string;
  notes: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  dimensionId: string;
  bank: string;
  type: 'credit' | 'debit';
  alias: string;
  last4: string;
  expiryDate: string;
  limit?: number;
  currentBalance?: number;
  currency: string;
}

export interface Provider {
  id: string;
  dimensionId: string;
  name: string;
  category: string;
  contractNumber?: string;
  monthlyCost?: number;
  renewalDate?: string;
  contact?: string;
  notes?: string;
}

export interface BureaucracyItem {
  id: string;
  dimensionId: string;
  title: string;
  type: 'document' | 'permit' | 'license' | 'other';
  expiryDate?: string;
  status: 'ok' | 'expiring_soon' | 'expired' | 'pending';
  notes?: string;
}

export interface DailyTask {
  id: string;
  dimensionId: string;
  title: string;
  description?: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface AdminMatter {
  id: string;
  dimensionId: string;
  title: string;
  organism: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  deadline?: string;
  notes?: string;
  createdAt: string;
}
