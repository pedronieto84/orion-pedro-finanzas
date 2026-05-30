import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { AdminMatter } from './admin-matter.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminMattersService {
  private readonly SECTION = 'admin-matters';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): AdminMatter[] {
    return this.storage.readFile<AdminMatter>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<AdminMatter>): AdminMatter {
    const items = this.findAll(dimensionId);
    const item: AdminMatter = {
      id: uuidv4(),
      dimensionId,
      title: data.title || '',
      organism: data.organism || '',
      status: data.status || 'pending',
      deadline: data.deadline,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<AdminMatter>): AdminMatter | null {
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
