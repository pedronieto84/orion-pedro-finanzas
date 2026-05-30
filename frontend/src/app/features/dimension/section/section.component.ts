import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

interface SectionConfig {
  label: string;
  icon: string;
  fields: { key: string; label: string; type: string; options?: string[] }[];
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  'bank-accounts': {
    label: 'Cuentas Bancarias',
    icon: '🏦',
    fields: [
      { key: 'bank', label: 'Banco', type: 'text' },
      { key: 'alias', label: 'Alias', type: 'text' },
      { key: 'iban', label: 'IBAN', type: 'text' },
      { key: 'balance', label: 'Saldo', type: 'number' },
      { key: 'currency', label: 'Moneda', type: 'text' },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
  },
  cards: {
    label: 'Tarjetas',
    icon: '💳',
    fields: [
      { key: 'bank', label: 'Banco', type: 'text' },
      { key: 'alias', label: 'Alias', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'select', options: ['credit', 'debit'] },
      { key: 'last4', label: 'Últimos 4', type: 'text' },
      { key: 'expiryDate', label: 'Vencimiento', type: 'text' },
      { key: 'currency', label: 'Moneda', type: 'text' },
    ],
  },
  bureaucracy: {
    label: 'Burocracia',
    icon: '📋',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'select', options: ['document', 'permit', 'license', 'other'] },
      { key: 'expiryDate', label: 'Vencimiento', type: 'text' },
      { key: 'status', label: 'Estado', type: 'select', options: ['ok', 'expiring_soon', 'expired', 'pending'] },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
  },
  'admin-matters': {
    label: 'Administrativo',
    icon: '🏛️',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'organism', label: 'Organismo', type: 'text' },
      { key: 'status', label: 'Estado', type: 'select', options: ['pending', 'in_progress', 'completed', 'blocked'] },
      { key: 'deadline', label: 'Plazo', type: 'text' },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
  },
  daily: {
    label: 'Diario',
    icon: '📅',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'text' },
      { key: 'priority', label: 'Prioridad', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'dueDate', label: 'Fecha límite', type: 'text' },
    ],
  },
  providers: {
    label: 'Proveedores',
    icon: '🤝',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text' },
      { key: 'category', label: 'Categoría', type: 'text' },
      { key: 'contractNumber', label: 'Nº Contrato', type: 'text' },
      { key: 'monthlyCost', label: 'Coste mensual', type: 'number' },
      { key: 'renewalDate', label: 'Renovación', type: 'text' },
      { key: 'contact', label: 'Contacto', type: 'text' },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
  },
};

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './section.component.html',
})
export class SectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  dimensionId = '';
  sectionKey = '';
  config: SectionConfig | null = null;
  items = signal<any[]>([]);
  showForm = signal(false);
  editingItem: any = null;
  formData: Record<string, any> = {};

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.dimensionId = params['id'];
      this.sectionKey = params['section'];
      this.config = SECTION_CONFIGS[this.sectionKey] || null;
      this.loadItems();
    });
  }

  get basePath() {
    return `/dimensions/${this.dimensionId}/${this.sectionKey}`;
  }

  loadItems() {
    this.api.get<any[]>(this.basePath).subscribe({
      next: (data) => this.items.set(data),
      error: () => this.items.set([]),
    });
  }

  openAdd() {
    this.editingItem = null;
    this.formData = {};
    this.showForm.set(true);
  }

  openEdit(item: any) {
    this.editingItem = item;
    this.formData = { ...item };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingItem = null;
    this.formData = {};
  }

  save() {
    if (this.editingItem) {
      this.api.put(`${this.basePath}/${this.editingItem.id}`, this.formData).subscribe({
        next: () => { this.closeForm(); this.loadItems(); },
      });
    } else {
      this.api.post(this.basePath, this.formData).subscribe({
        next: () => { this.closeForm(); this.loadItems(); },
      });
    }
  }

  deleteItem(id: string) {
    this.api.delete(`${this.basePath}/${id}`).subscribe({
      next: () => this.loadItems(),
    });
  }

  getDisplayValue(item: any): string {
    if (!this.config) return '';
    const first = this.config.fields[0];
    return item[first.key] || '—';
  }

  getSubValue(item: any): string {
    if (!this.config || this.config.fields.length < 2) return '';
    const second = this.config.fields[1];
    return item[second.key] || '';
  }
}
