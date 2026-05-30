import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Provider } from './provider.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProvidersService {
  private readonly SECTION = 'providers';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): Provider[] {
    return this.storage.readFile<Provider>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<Provider>): Provider {
    const items = this.findAll(dimensionId);
    const item: Provider = {
      id: uuidv4(),
      dimensionId,
      name: data.name || '',
      category: data.category || '',
      contractNumber: data.contractNumber,
      monthlyCost: data.monthlyCost,
      renewalDate: data.renewalDate,
      contact: data.contact,
      notes: data.notes,
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<Provider>): Provider | null {
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
