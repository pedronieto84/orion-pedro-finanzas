import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Dimension } from './dimension.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DimensionsService {
  private readonly FILE = 'dimensions.json';

  constructor(private readonly storage: StorageService) {}

  findAll(): Dimension[] {
    return this.storage.readRootFile<Dimension>(this.FILE);
  }

  create(data: Partial<Dimension>): Dimension {
    const dimensions = this.findAll();
    const dimension: Dimension = {
      id: uuidv4(),
      name: data.name || '',
      icon: data.icon || '📁',
      color: data.color || '#3b82f6',
      createdAt: new Date().toISOString(),
    };
    dimensions.push(dimension);
    this.storage.writeRootFile(this.FILE, dimensions);
    this.storage.ensureDir(dimension.id);
    return dimension;
  }

  update(id: string, data: Partial<Dimension>): Dimension | null {
    const dimensions = this.findAll();
    const index = dimensions.findIndex((d) => d.id === id);
    if (index === -1) return null;
    dimensions[index] = { ...dimensions[index], ...data, id };
    this.storage.writeRootFile(this.FILE, dimensions);
    return dimensions[index];
  }

  delete(id: string): boolean {
    const dimensions = this.findAll();
    const filtered = dimensions.filter((d) => d.id !== id);
    if (filtered.length === dimensions.length) return false;
    this.storage.writeRootFile(this.FILE, filtered);
    return true;
  }
}
