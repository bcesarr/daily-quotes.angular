import { getSkyTone } from './sky-tone';

describe('getSkyTone', () => {
  // Cria uma data com a hora e o minuto desejados
  const at = (hour: number, minute = 0, second = 0) => new Date(2026, 10, 8, hour, minute, second);

  it('should keep the original photo during the day, including at 12:00', () => {
    expect(getSkyTone(at(7, 0))).toEqual({ dusk: 0, golden: 0 });
    expect(getSkyTone(at(12, 0))).toEqual({ dusk: 0, golden: 0 });
    expect(getSkyTone(at(15, 29))).toEqual({ dusk: 0, golden: 0 });
  });

  it('should start changing only at 15:30, from zero', () => {
    const start = getSkyTone(at(15, 30));
    const later = getSkyTone(at(15, 45));

    expect(start).toEqual({ dusk: 0, golden: 0 });
    expect(later.dusk).toBeGreaterThan(0);
    expect(later.dusk).toBeLessThan(0.05);
    expect(later.golden).toBeGreaterThan(0);
  });

  it('should reach the golden hour peak halfway through the dusk', () => {
    const middle = getSkyTone(at(17, 15));

    expect(middle.dusk).toBeCloseTo(0.5, 5);
    expect(middle.golden).toBeCloseTo(1, 5);
  });

  it('should be fully dusk (and not golden anymore) from 19:00 until 05:00', () => {
    for (const [hour, minute] of [[19, 0], [21, 30], [23, 59], [0, 0], [3, 0], [4, 59]]) {
      expect(getSkyTone(at(hour, minute))).toEqual({ dusk: 1, golden: 0 });
    }
  });

  it('should go back to the original photo smoothly between 05:00 and 07:00', () => {
    const sunrise = getSkyTone(at(6, 0));

    expect(getSkyTone(at(5, 0))).toEqual({ dusk: 1, golden: 0 });
    expect(sunrise.dusk).toBeCloseTo(0.5, 5);
    expect(sunrise.golden).toBeCloseTo(1, 5);
    expect(getSkyTone(at(7, 0))).toEqual({ dusk: 0, golden: 0 });
  });

  it('should only get darker from 15:30 to 19:00', () => {
    let previous = -1;

    for (let minutes = 15 * 60 + 30; minutes <= 19 * 60; minutes += 5) {
      const { dusk } = getSkyTone(at(Math.floor(minutes / 60), minutes % 60));

      expect(dusk).toBeGreaterThanOrEqual(previous);
      previous = dusk;
    }
  });

  it('should never jump between two consecutive minutes of the day', () => {
    // Percorre as 24 horas minuto a minuto (inclusive a virada 23:59 -> 00:00)
    // e garante que nenhum valor salta de uma vez: a cor muda sempre aos poucos.
    const maxStep = 0.03;
    const toneAt = (minutes: number) => getSkyTone(at(Math.floor(minutes / 60) % 24, minutes % 60));

    for (let minutes = 0; minutes < 24 * 60; minutes++) {
      const now = toneAt(minutes);
      const next = toneAt(minutes + 1);

      expect(Math.abs(next.dusk - now.dusk)).toBeLessThan(maxStep);
      expect(Math.abs(next.golden - now.golden)).toBeLessThan(maxStep);
    }
  });
});
