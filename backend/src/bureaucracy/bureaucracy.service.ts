import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { BureaucracyItem } from './bureaucracy-item.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BureaucracyService {
  private readonly SECTION = 'bureaucracy';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): BureaucracyItem[] {
    return this.storage.readFile<BureaucracyItem>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<BureaucracyItem>): BureaucracyItem {
    const items = this.findAll(dimensionId);
    const item: BureaucracyItem = {
      id: uuidv4(),
      dimensionId,
      title: data.title || '',
      type: data.type || 'other',
      expiryDate: data.expiryDate,
      status: data.status || 'pending',
      notes: data.notes,
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<BureaucracyItem>): BureaucracyItem | null {
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
