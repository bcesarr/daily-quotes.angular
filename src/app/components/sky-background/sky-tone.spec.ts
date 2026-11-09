import { getSkyTone } from './sky-tone';

describe('getSkyTone', () => {
  // Cria uma data com a hora e o minuto desejados
  const at = (hour: number, minute = 0, second = 0) => new Date(2026, 10, 8, hour, minute, second);

  it('should show only the morning photo from 07:00 until 15:30, including at 12:00', () => {
    expect(getSkyTone(at(7, 0))).toEqual({ afternoon: 0, night: 0 });
    expect(getSkyTone(at(12, 0))).toEqual({ afternoon: 0, night: 0 });
    expect(getSkyTone(at(15, 29))).toEqual({ afternoon: 0, night: 0 });
    expect(getSkyTone(at(15, 30))).toEqual({ afternoon: 0, night: 0 });
  });

  it('should fade the afternoon photo in between 15:30 and 17:00', () => {
    const start = getSkyTone(at(15, 45));
    const middle = getSkyTone(at(16, 15));

    expect(start.afternoon).toBeGreaterThan(0);
    expect(start.afternoon).toBeLessThan(0.1);
    expect(middle.afternoon).toBeCloseTo(0.5, 5);
    expect(middle.night).toBe(0);
    expect(getSkyTone(at(17, 0)).afternoon).toBe(1);
  });

  it('should keep the afternoon photo complete from 17:00 to 18:00, without the night photo', () => {
    expect(getSkyTone(at(17, 0))).toEqual({ afternoon: 1, night: 0 });
    expect(getSkyTone(at(17, 59))).toEqual({ afternoon: 1, night: 0 });
  });

  it('should fade the night photo in over the afternoon photo between 18:00 and 19:00', () => {
    const middle = getSkyTone(at(18, 30));

    expect(getSkyTone(at(18, 0)).night).toBe(0);
    expect(middle.night).toBeCloseTo(0.5, 5);
    expect(middle.afternoon).toBe(1);
    expect(getSkyTone(at(19, 0)).night).toBe(1);
  });

  it('should only remove the afternoon photo after the night photo is fully visible', () => {
    const middle = getSkyTone(at(19, 30));

    expect(middle.night).toBe(1);
    expect(middle.afternoon).toBeCloseTo(0.5, 5);
    expect(getSkyTone(at(20, 0))).toEqual({ afternoon: 0, night: 1 });
  });

  it('should be night from 20:00 until 05:00, crossing midnight', () => {
    for (const [hour, minute] of [[20, 0], [23, 59], [0, 0], [3, 0], [4, 59]]) {
      expect(getSkyTone(at(hour, minute))).toEqual({ afternoon: 0, night: 1 });
    }
  });

  it('should go back to the morning photo smoothly between 05:00 and 07:00', () => {
    expect(getSkyTone(at(5, 0))).toEqual({ afternoon: 0, night: 1 });
    expect(getSkyTone(at(6, 0)).night).toBeCloseTo(0.5, 5);
    expect(getSkyTone(at(6, 0)).afternoon).toBe(0);
    expect(getSkyTone(at(7, 0))).toEqual({ afternoon: 0, night: 0 });
  });

  it('should never jump between two consecutive minutes of the day', () => {
    // Percorre as 24 horas minuto a minuto (inclusive a virada 23:59 -> 00:00)
    // e garante que nenhum valor salta de uma vez: a imagem muda sempre aos poucos.
    const maxStep = 0.03;
    const toneAt = (minutes: number) => getSkyTone(at(Math.floor(minutes / 60) % 24, minutes % 60));

    for (let minutes = 0; minutes < 24 * 60; minutes++) {
      const now = toneAt(minutes);
      const next = toneAt(minutes + 1);

      expect(Math.abs(next.afternoon - now.afternoon)).toBeLessThan(maxStep);
      expect(Math.abs(next.night - now.night)).toBeLessThan(maxStep);
    }
  });
});
