import { Injectable, inject, signal } from '@angular/core';
import { Supabase } from '../supabase/supabase';

const STORAGE_KEY_VISITOR_SEEN = 'frases-do-dia:visitor-seen';
const STORAGE_KEY_VISIT_COUNTED = 'frases-do-dia:visit-counted';

@Injectable({ providedIn: 'root' })
export class VisitCounter {
  private readonly supabase = inject(Supabase);

  readonly totalVisits = signal<number | null>(null);
  readonly visitorCount = signal<number | null>(null);

  constructor() {
    this.registerVisit();
    this.registerVisitorIfNew();
  }

  private registerVisit(): void {
    const alreadyCounted = sessionStorage.getItem(STORAGE_KEY_VISIT_COUNTED);

    if (alreadyCounted) {
      this.supabase.getStats().subscribe({
        next: (stats) => this.totalVisits.set(stats.total_visits),
        error: (err) => console.error('Erro ao buscar estatísticas:', err),
      });
      return;
    }

    this.supabase.callFunction('increment_total_visits').subscribe({
      next: (count) => {
        sessionStorage.setItem(STORAGE_KEY_VISIT_COUNTED, 'true');
        this.totalVisits.set(count);
      },
      error: (err) => console.error('Erro ao registrar visita:', err),
    });
  }

  private registerVisitorIfNew(): void {
    const alreadyVisited = localStorage.getItem(STORAGE_KEY_VISITOR_SEEN);

    if (alreadyVisited) {
      this.supabase.getStats().subscribe({
        next: (stats) => this.visitorCount.set(stats.unique_visitors),
        error: (err) => console.error('Erro ao buscar estatísticas:', err),
      });
      return;
    }

    this.supabase.callFunction('increment_unique_visitors').subscribe({
      next: (count) => {
        localStorage.setItem(STORAGE_KEY_VISITOR_SEEN, 'true');
        this.visitorCount.set(count);
      },
      error: (err) => console.error('Erro ao registrar visitante:', err),
    });
  }
}