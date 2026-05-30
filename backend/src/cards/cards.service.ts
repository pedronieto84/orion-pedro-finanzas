import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Card } from './card.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardsService {
  private readonly SECTION = 'cards';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): Card[] {
    return this.storage.readFile<Card>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<Card>): Card {
    const items = this.findAll(dimensionId);
    const item: Card = {
      id: uuidv4(),
      dimensionId,
      bank: data.bank || '',
      type: data.type || 'debit',
      alias: data.alias || '',
      last4: data.last4 || '',
      expiryDate: data.expiryDate || '',
      limit: data.limit,
      currentBalance: data.currentBalance,
      currency: data.currency || 'EUR',
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<Card>): Card | null {
    const items = this.findAll(dimensionId);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, id, dimensionId };
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
