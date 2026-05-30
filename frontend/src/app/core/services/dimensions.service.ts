import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Dimension } from '../models/dimension.model';

@Injectable({ providedIn: 'root' })
export class DimensionsService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<Dimension[]>('/dimensions');
  }

  create(data: Partial<Dimension>) {
    return this.api.post<Dimension>('/dimensions', data);
  }

  update(id: string, data: Partial<Dimension>) {
    return this.api.put<Dimension>(`/dimensions/${id}`, data);
  }

  delete(id: string) {
    return this.api.delete(`/dimensions/${id}`);
  }
}
