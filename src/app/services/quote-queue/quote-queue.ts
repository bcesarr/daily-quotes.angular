import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';

import { Quote, Supabase } from '../supabase/supabase';

interface QueueState {
  quotes: Quote[];
  lastQuoteId: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class QuoteQueueService {
  private readonly supabase = inject(Supabase);

  private readonly queues = new Map<string, QueueState>();

  private readonly usedIdsByCategory = new Map<string, Set<number>>();

  private readonly usedIdsByGeneral = new Set<number>();

  getNextQuote(categorySlug: string | null): Observable<Quote> {
    const key = categorySlug ?? 'all';
    const state = this.getQueueState(key);

    if (state.quotes.length > 0) {
      return of(this.consumeQuote(state, categorySlug));
    }

    return this.loadBatch(categorySlug, state).pipe(
      switchMap((quotes) => {
        if (quotes.length > 0) {
          return of(this.consumeQuote(state, categorySlug));
        }

        return this.startNewCycle(categorySlug, state);
      }),
    );
  }

  private getQueueState(key: string): QueueState {
    let state = this.queues.get(key);

    if (!state) {
      state = {
        quotes: [],
        lastQuoteId: null,
      };

      this.queues.set(key, state);
    }

    return state;
  }

  private getUsedIds(categorySlug: string): Set<number> {
    let usedIds = this.usedIdsByCategory.get(categorySlug);

    if (!usedIds) {
      usedIds = new Set<number>();
      this.usedIdsByCategory.set(categorySlug, usedIds);
    }

    return usedIds;
  }

  private loadBatch(
    categorySlug: string | null,
    state: QueueState,
  ): Observable<Quote[]> {
    const excludedIds =
      categorySlug === null
        ? [...this.usedIdsByGeneral]
        : [...this.getUsedIds(categorySlug)];

    return this.supabase
      .getRandomQuotes(categorySlug, excludedIds, 20)
      .pipe(
        tap((quotes) => {
          state.quotes.push(...quotes);
        }),
      );
  }

  private consumeQuote(
    state: QueueState,
    categorySlug: string | null,
  ): Quote {
    const quote = state.quotes.shift()!;

    state.lastQuoteId = quote.id;

    this.markQuoteAsUsed(quote, categorySlug);

    return quote;
  }

  private markQuoteAsUsed(
    quote: Quote,
    categorySlug: string | null,
  ): void {
    if (categorySlug === null) {
      this.usedIdsByGeneral.add(quote.id);

      this.getUsedIds(quote.category_slug).add(quote.id);

      return;
    }

    this.getUsedIds(categorySlug).add(quote.id);
  }

  private startNewCycle(
    categorySlug: string | null,
    state: QueueState,
  ): Observable<Quote> {
    if (categorySlug === null) {
      this.usedIdsByGeneral.clear();

      if (state.lastQuoteId !== null) {
        this.usedIdsByGeneral.add(state.lastQuoteId);
      }
    } else {
      const usedIds = this.getUsedIds(categorySlug);

      usedIds.clear();

      if (state.lastQuoteId !== null) {
        usedIds.add(state.lastQuoteId);
      }
    }

    return this.loadBatch(categorySlug, state).pipe(
      switchMap((quotes) => {
        if (quotes.length === 0) {
          throw new Error(
            'Não existem frases suficientes para iniciar um novo ciclo.',
          );
        }

        return of(this.consumeQuote(state, categorySlug));
      }),
    );
  }
}