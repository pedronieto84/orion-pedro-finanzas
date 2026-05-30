import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DimensionsService } from '../../core/services/dimensions.service';
import { Dimension } from '../../core/models/dimension.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private dimensionsService = inject(DimensionsService);

  dimensions = signal<Dimension[]>([]);
  showForm = signal(false);
  editingDimension: Dimension | null = null;

  formData = {
    name: '',
    icon: '📁',
    color: '#3b82f6',
  };

  ngOnInit() {
    this.loadDimensions();
  }

  loadDimensions() {
    this.dimensionsService.getAll().subscribe({
      next: (dims) => this.dimensions.set(dims),
    });
  }

  openAdd() {
    this.editingDimension = null;
    this.formData = { name: '', icon: '📁', color: '#3b82f6' };
    this.showForm.set(true);
  }

  openEdit(dim: Dimension) {
    this.editingDimension = dim;
    this.formData = { name: dim.name, icon: dim.icon, color: dim.color };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingDimension = null;
  }

  save() {
    if (!this.formData.name.trim()) return;

    if (this.editingDimension) {
      this.dimensionsService.update(this.editingDimension.id, this.formData).subscribe({
        next: () => { this.closeForm(); this.loadDimensions(); },
      });
    } else {
      this.dimensionsService.create(this.formData).subscribe({
        next: () => { this.closeForm(); this.loadDimensions(); },
      });
    }
  }

  deleteDimension(id: string) {
    this.dimensionsService.delete(id).subscribe({
      next: () => this.loadDimensions(),
    });
  }
}
