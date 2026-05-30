import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly dataDir = path.join(process.cwd(), 'data');

  constructor() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  readFile<T>(dimensionId: string, section: string): T[] {
    const filePath = this.getFilePath(dimensionId, section);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content) as T[];
    } catch {
      return [];
    }
  }

  writeFile<T>(dimensionId: string, section: string, data: T[]): void {
    const filePath = this.getFilePath(dimensionId, section);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  ensureDir(dimensionId: string): void {
    const dir = path.join(this.dataDir, dimensionId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  readRootFile<T>(filename: string): T[] {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content) as T[];
    } catch {
      return [];
    }
  }

  writeRootFile<T>(filename: string, data: T[]): void {
    const filePath = path.join(this.dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private getFilePath(dimensionId: string, section: string): string {
    return path.join(this.dataDir, dimensionId, `${section}.json`);
  }
}
