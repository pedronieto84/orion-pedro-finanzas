import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DimensionsService } from '../../core/services/dimensions.service';
import { Dimension } from '../../core/models/dimension.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dimensionsService = inject(DimensionsService);
  private router = inject(Router);

  dimensions = signal<Dimension[]>([]);
  showModal = signal(false);

  newDimension = {
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

  openModal() {
    this.newDimension = { name: '', icon: '📁', color: '#3b82f6' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  createDimension() {
    if (!this.newDimension.name.trim()) return;
    this.dimensionsService.create(this.newDimension).subscribe({
      next: () => {
        this.closeModal();
        this.loadDimensions();
        // Reload sidebar too
        window.location.reload();
      },
    });
  }

  goToDimension(id: string) {
    this.router.navigate(['/dimension', id]);
  }
}
