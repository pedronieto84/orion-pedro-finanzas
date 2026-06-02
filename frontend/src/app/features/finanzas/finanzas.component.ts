import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Movimiento {
  fecha: string;
  mes_informe: string;
  cuenta: string;
  tipo: string;
  importe: number;
  concepto: string;
  categoria: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Nómina': '#10b981',
  'Pensión': '#6ee7b7',
  'Alquiler/Parking': '#3b82f6',
  'Seguros': '#f59e0b',
  'Préstamo': '#ef4444',
  'Tarjeta': '#dc2626',
  'Suministros': '#8b5cf6',
  'Impuestos': '#f97316',
  'Transferencia': '#64748b',
  'Gasolina': '#eab308',
  'Alimentación': '#22c55e',
  'Restaurante': '#ec4899',
  'Transporte': '#06b6d4',
  'Inversión': '#a855f7',
  'Autónomos': '#f43f5e',
  'Retirada Efectivo': '#78716c',
  'Taxi/VTC': '#0ea5e9',
  'Educación': '#84cc16',
  'Otros': '#94a3b8',
};

const CUENTA_MAP: Record<string, string> = {
  '5283': 'Mamá',
  '3672': 'Pedro',
  'Tarjeta 2437': 'Tarjeta Pedro',
};

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas.component.html',
})
export class FinanzasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartBar') chartBarRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartLine') chartLineRef!: ElementRef<HTMLCanvasElement>;

  allData: Movimiento[] = [];
  filtered: Movimiento[] = [];

  // filters
  search = '';
  filterMes = '';
  filterCuenta = '';
  filterTipo = '';
  filterCategoria = '';

  // options
  meses: string[] = [];
  cuentas = ['5283', '3672', 'Tarjeta 2437'];
  categorias: string[] = [];

  // sort
  sortCol = '';
  sortAsc = true;

  // mobile
  showFilters = false;

  // charts
  private barChart: Chart | null = null;
  private lineChart: Chart | null = null;
  private viewReady = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Movimiento[]>('data/bbva.json').subscribe(data => {
      this.allData = data;
      this.meses = [...new Set(data.map(d => d.mes_informe))];
      this.categorias = [...new Set(data.map(d => d.categoria))].sort();
      this.applyFilters();
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    // charts will be created once data arrives via applyFilters
    // Also trigger if data already loaded
    if (this.allData.length > 0) {
      setTimeout(() => this.renderCharts(), 50);
    }
  }

  ngOnDestroy() {
    this.barChart?.destroy();
    this.lineChart?.destroy();
  }

  clearFilters() {
    this.search = '';
    this.filterMes = '';
    this.filterCuenta = '';
    this.filterTipo = '';
    this.filterCategoria = '';
    this.applyFilters();
  }

  applyFilters() {
    let d = this.allData;
    if (this.search) {
      const s = this.search.toLowerCase();
      d = d.filter(r => r.concepto.toLowerCase().includes(s));
    }
    if (this.filterMes) d = d.filter(r => r.mes_informe === this.filterMes);
    if (this.filterCuenta) d = d.filter(r => r.cuenta === this.filterCuenta);
    if (this.filterTipo) d = d.filter(r => r.tipo === this.filterTipo);
    if (this.filterCategoria) d = d.filter(r => r.categoria === this.filterCategoria);

    if (this.sortCol) {
      d = [...d].sort((a, b) => {
        let va: any = (a as any)[this.sortCol];
        let vb: any = (b as any)[this.sortCol];
        if (this.sortCol === 'importe') { va = +va; vb = +vb; }
        else if (this.sortCol === 'fecha') {
          va = this.parseDateStr(va); vb = this.parseDateStr(vb);
        } else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        if (va < vb) return this.sortAsc ? -1 : 1;
        if (va > vb) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    this.filtered = d;
    if (this.viewReady) {
      setTimeout(() => this.renderCharts(), 0);
    }
  }

  private parseDateStr(s: string): number {
    const [d, m, y] = s.split('/');
    return new Date(+y, +m - 1, +d).getTime();
  }

  sort(col: string) {
    if (this.sortCol === col) this.sortAsc = !this.sortAsc;
    else { this.sortCol = col; this.sortAsc = true; }
    this.applyFilters();
  }

  sortIcon(col: string): string {
    if (this.sortCol !== col) return '⇅';
    return this.sortAsc ? '▲' : '▼';
  }

  // KPIs
  get totalIngresos(): number {
    return this.filtered.filter(r => r.tipo === 'INGRESO').reduce((s, r) => s + r.importe, 0);
  }
  get totalGastos(): number {
    return this.filtered.filter(r => r.tipo === 'GASTO').reduce((s, r) => s + r.importe, 0);
  }
  get balance(): number { return this.totalIngresos - this.totalGastos; }
  get numMovimientos(): number { return this.filtered.length; }

  // helpers
  cuentaLabel(c: string): string { return CUENTA_MAP[c] || c; }

  cuentaShort(c: string): string {
    if (c === '5283') return 'Mamá';
    if (c === '3672') return 'Pedro';
    if (c === 'Tarjeta 2437') return 'Tarjeta';
    return c;
  }

  shortDate(fecha: string): string {
    // fecha is DD/MM/YYYY, return DD/MM
    const parts = fecha.split('/');
    return parts.length >= 2 ? parts[0] + '/' + parts[1] : fecha;
  }

  cuentaBadgeClass(c: string): string {
    if (c === '5283') return 'bg-purple-100 text-purple-800';
    if (c === '3672') return 'bg-blue-100 text-blue-800';
    if (c === 'Tarjeta 2437') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  }

  catColor(cat: string): string { return CATEGORY_COLORS[cat] || '#94a3b8'; }

  trackRow(index: number, _item: Movimiento): number { return index; }

  fmt(n: number): string {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Charts
  private renderCharts() {
    // Retry if canvas refs aren't ready yet (Angular rendering timing)
    if (!this.chartBarRef?.nativeElement || !this.chartLineRef?.nativeElement) {
      setTimeout(() => this.renderCharts(), 100);
      return;
    }
    this.renderBarChart();
    this.renderLineChart();
  }

  private renderBarChart() {
    if (!this.chartBarRef?.nativeElement) return;
    this.barChart?.destroy();

    const gastos = this.filtered.filter(r => r.tipo === 'GASTO');
    const meses = [...new Set(gastos.map(r => r.mes_informe))];
    // sort months chronologically
    meses.sort((a, b) => {
      const ga = gastos.find(r => r.mes_informe === a)!;
      const gb = gastos.find(r => r.mes_informe === b)!;
      return this.parseDateStr(ga.fecha) - this.parseDateStr(gb.fecha);
    });
    const cats = [...new Set(gastos.map(r => r.categoria))].sort();

    const datasets = cats.map(cat => ({
      label: cat,
      data: meses.map(m => gastos.filter(r => r.mes_informe === m && r.categoria === cat).reduce((s, r) => s + r.importe, 0)),
      backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8',
    }));

    this.barChart = new Chart(this.chartBarRef.nativeElement, {
      type: 'bar',
      data: { labels: meses, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Gastos por categoría/mes' }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (v: any) => v.toLocaleString('es-ES') + ' €' } } },
      },
    });
  }

  private renderLineChart() {
    if (!this.chartLineRef?.nativeElement) return;
    this.lineChart?.destroy();

    const meses = [...new Set(this.filtered.map(r => r.mes_informe))];
    meses.sort((a, b) => {
      const ga = this.filtered.find(r => r.mes_informe === a)!;
      const gb = this.filtered.find(r => r.mes_informe === b)!;
      return this.parseDateStr(ga.fecha) - this.parseDateStr(gb.fecha);
    });

    const cuentas = [...new Set(this.filtered.map(r => r.cuenta))];
    const colors = ['#8b5cf6', '#3b82f6', '#f97316', '#10b981'];

    const datasets = cuentas.map((c, i) => ({
      label: this.cuentaLabel(c),
      data: meses.map(m => {
        const rows = this.filtered.filter(r => r.mes_informe === m && r.cuenta === c);
        const ing = rows.filter(r => r.tipo === 'INGRESO').reduce((s, r) => s + r.importe, 0);
        const gas = rows.filter(r => r.tipo === 'GASTO').reduce((s, r) => s + r.importe, 0);
        return ing - gas;
      }),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '22',
      fill: true,
      tension: 0.3,
    }));

    this.lineChart = new Chart(this.chartLineRef.nativeElement, {
      type: 'line',
      data: { labels: meses, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Balance mensual por cuenta' }, legend: { position: 'bottom' } },
        scales: { y: { ticks: { callback: (v: any) => v.toLocaleString('es-ES') + ' €' } } },
      },
    });
  }
}
