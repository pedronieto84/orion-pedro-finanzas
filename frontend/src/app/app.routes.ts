import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'dimension/:id', loadComponent: () => import('./features/dimension/dimension.component').then(m => m.DimensionComponent) },
  { path: 'dimension/:id/:section', loadComponent: () => import('./features/dimension/section/section.component').then(m => m.SectionComponent) },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
];
