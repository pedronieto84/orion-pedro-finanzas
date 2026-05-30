import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { BankAccount } from './bank-account.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BankAccountsService {
  private readonly SECTION = 'bank-accounts';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): BankAccount[] {
    return this.storage.readFile<BankAccount>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<BankAccount>): BankAccount {
    const items = this.findAll(dimensionId);
    const item: BankAccount = {
      id: uuidv4(),
      dimensionId,
      bank: data.bank || '',
      iban: data.iban || '',
      alias: data.alias || '',
      balance: data.balance || 0,
      currency: data.currency || 'EUR',
      notes: data.notes || '',
      updatedAt: new Date().toISOString(),
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<BankAccount>): BankAccount | null {
    const items = this.findAll(dimensionId);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, id, dimensionId, updatedAt: new Date().toISOString() };
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return items[index];
  }

  delete(dimensionId: string, id: string): boolean {
    const items = this.findAll(dimensionId);
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.storage.writeFile(dimensionId, this.SECTION, filtered);
    return true;
  }
}
