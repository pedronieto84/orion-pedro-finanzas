import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { DailyTask } from './daily-task.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DailyService {
  private readonly SECTION = 'daily';

  constructor(private readonly storage: StorageService) {}

  findAll(dimensionId: string): DailyTask[] {
    return this.storage.readFile<DailyTask>(dimensionId, this.SECTION);
  }

  create(dimensionId: string, data: Partial<DailyTask>): DailyTask {
    const items = this.findAll(dimensionId);
    const item: DailyTask = {
      id: uuidv4(),
      dimensionId,
      title: data.title || '',
      description: data.description,
      done: data.done || false,
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    this.storage.writeFile(dimensionId, this.SECTION, items);
    return item;
  }

  update(dimensionId: string, id: string, data: Partial<DailyTask>): DailyTask | null {
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
