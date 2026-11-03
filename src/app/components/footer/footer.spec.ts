import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Footer } from './footer';
import { VisitCounter } from '../../services/site-status/visitCounter';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Footer visit statistics', () => {
  // Monta o rodapé com números fixos no lugar do contador real (sem rede)
  async function renderStats(visitors: number, visits: number): Promise<string> {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        {
          provide: VisitCounter,
          useValue: { visitorCount: signal(visitors), totalVisits: signal(visits) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Footer);
    await fixture.whenStable();

    return (fixture.nativeElement as HTMLElement).querySelector('.site-footer-stats')?.textContent ?? '';
  }

  it('should use the singular for one person and one access', async () => {
    const text = await renderStats(1, 1);

    expect(text).toContain('1 Pessoa passou por aqui');
    expect(text).toContain('1 acesso');
  });

  it('should use the plural for several people and accesses', async () => {
    const text = await renderStats(5, 12);

    expect(text).toContain('5 Pessoas passaram por aqui');
    expect(text).toContain('12 acessos');
  });
});
