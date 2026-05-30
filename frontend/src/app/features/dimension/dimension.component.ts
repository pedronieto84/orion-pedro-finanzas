import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DimensionsService } from '../../core/services/dimensions.service';
import { Dimension } from '../../core/models/dimension.model';

interface SectionTab {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dimension',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dimension.component.html',
})
export class DimensionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dimensionsService = inject(DimensionsService);

  dimension = signal<Dimension | null>(null);
  dimensionId = '';

  tabs: SectionTab[] = [
    { key: 'bank-accounts', label: 'Cuentas', icon: '🏦' },
    { key: 'cards', label: 'Tarjetas', icon: '💳' },
    { key: 'bureaucracy', label: 'Burocracia', icon: '📋' },
    { key: 'admin-matters', label: 'Administrativo', icon: '🏛️' },
    { key: 'daily', label: 'Diario', icon: '📅' },
    { key: 'providers', label: 'Proveedores', icon: '🤝' },
  ];

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.dimensionId = params['id'];
      this.loadDimension();
    });
  }

  loadDimension() {
    this.dimensionsService.getAll().subscribe({
      next: (dims) => {
        const found = dims.find((d) => d.id === this.dimensionId);
        this.dimension.set(found || null);
      },
    });
  }

  goToSection(section: string) {
    this.router.navigate(['/dimension', this.dimensionId, section]);
  }
}
