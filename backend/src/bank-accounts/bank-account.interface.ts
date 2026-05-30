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
