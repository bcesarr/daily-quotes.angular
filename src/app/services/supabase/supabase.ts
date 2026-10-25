import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SiteStats {
  total_visits: number;
  unique_visitors: number;
}

export interface Quote {
  id: number;
  category_id: number;
  category_slug: string;
  text: string;
  author_name: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
}

@Injectable({ providedIn: 'root' })
export class Supabase {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.supabaseUrl}/rest/v1`;
  private readonly headers = new HttpHeaders({
    apikey: environment.supabaseKey,
    Authorization: `Bearer ${environment.supabaseKey}`,
    'Content-Type': 'application/json',
  });

  callFunction(functionName: string): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/rpc/${functionName}`, {}, { headers: this.headers });
  }

  getStats(): Observable<SiteStats> {
    return this.http
      .get<SiteStats[]>(`${this.baseUrl}/site_stats?select=total_visits,unique_visitors&limit=1`, { headers: this.headers })
      .pipe(map((rows) => rows[0]));
  }

  getRandomQuotes(
    categorySlug: string | null,
    excludedIds: number[] = [],
    limit = 20
  ): Observable<Quote[]> {
    return this.http.post<Quote[]>(
      `${this.baseUrl}/rpc/get_random_quotes`,
      {
        p_category_slug: categorySlug,
        p_excluded_ids: excludedIds,
        p_limit: limit,
      },
      { headers: this.headers }
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.baseUrl}/categories?select=id,name,slug,display_order&active=eq.true&order=display_order.asc`,
      { headers: this.headers }
    );
  }
}