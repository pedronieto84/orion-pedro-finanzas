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
