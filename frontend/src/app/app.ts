import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DimensionsService } from './core/services/dimensions.service';
import { Dimension } from './core/models/dimension.model';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private dimensionsService = inject(DimensionsService);
  dimensions = signal<Dimension[]>([]);
  appVersion = environment.appVersion;
  sidebarOpen = signal(true);

  ngOnInit() {
    this.loadDimensions();
  }

  loadDimensions() {
    this.dimensionsService.getAll().subscribe({
      next: (dims) => this.dimensions.set(dims),
      error: () => this.dimensions.set([]),
    });
  }
}
