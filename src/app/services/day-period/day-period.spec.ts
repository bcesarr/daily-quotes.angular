import { TestBed } from '@angular/core/testing';

import { DayPeriodService } from './day-period';

describe('DayPeriodService', () => {
  let service: DayPeriodService;

  // Cria uma data no dia de hoje, com a hora e o minuto desejados
  const at = (hour: number, minute = 0) => new Date(2026, 10, 8, hour, minute);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be morning from 05:00 to 11:59', () => {
    expect(service.getPeriod(at(5, 0))).toBe('morning');
    expect(service.getPeriod(at(11, 59))).toBe('morning');
  });

  it('should be afternoon from 12:00 to 17:59', () => {
    expect(service.getPeriod(at(12, 0))).toBe('afternoon');
    expect(service.getPeriod(at(17, 59))).toBe('afternoon');
  });

  it('should be night from 18:00 to 04:59, crossing midnight', () => {
    expect(service.getPeriod(at(18, 0))).toBe('night');
    expect(service.getPeriod(at(23, 59))).toBe('night');
    expect(service.getPeriod(at(0, 0))).toBe('night');
    expect(service.getPeriod(at(4, 59))).toBe('night');
  });
});
