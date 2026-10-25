import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Supabase } from './supabase';
import { environment } from '../../../environments/environment';

describe('Supabase', () => {
  let service: Supabase;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Supabase);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que nenhuma requisição inesperada ficou pendente.
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request active categories sending the apikey header', () => {
    service.getCategories().subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/rest/v1/categories'));

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toContain('active=eq.true');
    expect(req.request.headers.get('apikey')).toBe(environment.supabaseKey);

    req.flush([]);
  });

  it('should call the random quotes function with the given parameters', () => {
    service.getRandomQuotes('fe', [1, 2], 5).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/rpc/get_random_quotes'));

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      p_category_slug: 'fe',
      p_excluded_ids: [1, 2],
      p_limit: 5,
    });

    req.flush([]);
  });

  it('should return only the first row of site stats', () => {
    let result: { total_visits: number; unique_visitors: number } | undefined;

    service.getStats().subscribe((stats) => (result = stats));

    const req = httpMock.expectOne((r) => r.url.includes('/rest/v1/site_stats'));
    req.flush([{ total_visits: 10, unique_visitors: 4 }]);

    expect(result).toEqual({ total_visits: 10, unique_visitors: 4 });
  });
});
