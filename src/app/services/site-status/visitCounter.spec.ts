import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { VisitCounter } from './visitCounter';

describe('VisitCounter', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should count the visit and the new visitor on the first access', () => {
    const counter = TestBed.inject(VisitCounter);

    httpMock.expectOne((r) => r.url.endsWith('/rpc/increment_total_visits')).flush(5);
    httpMock.expectOne((r) => r.url.endsWith('/rpc/increment_unique_visitors')).flush(3);

    expect(counter.totalVisits()).toBe(5);
    expect(counter.visitorCount()).toBe(3);
    expect(sessionStorage.getItem('frases-do-dia:visit-counted')).toBe('true');
    expect(localStorage.getItem('frases-do-dia:visitor-seen')).toBe('true');
  });

  it('should not count the visit again in the same session', () => {
    sessionStorage.setItem('frases-do-dia:visit-counted', 'true');
    localStorage.setItem('frases-do-dia:visitor-seen', 'true');

    const counter = TestBed.inject(VisitCounter);

    httpMock.expectNone((r) => r.url.endsWith('/rpc/increment_total_visits'));
    httpMock.expectNone((r) => r.url.endsWith('/rpc/increment_unique_visitors'));

    // Sem incrementar, os números são apenas lidos da tabela de estatísticas.
    httpMock
      .match((r) => r.url.includes('/rest/v1/site_stats'))
      .forEach((req) => req.flush([{ total_visits: 9, unique_visitors: 4 }]));

    expect(counter.totalVisits()).toBe(9);
    expect(counter.visitorCount()).toBe(4);
  });
});
