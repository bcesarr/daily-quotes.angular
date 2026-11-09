import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyBackground } from './sky-background';

describe('SkyBackground', () => {
  beforeEach(async () => {
    // Congela só o relógio (Date) e o setInterval; o resto continua normal.
    // Assim cada teste escolhe a hora do dia e não depende do relógio real.
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });

    await TestBed.configureTestingModule({
      imports: [SkyBackground],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Cria o fundo "fingindo" que são hour:minute
  function render(hour: number, minute = 0): ComponentFixture<SkyBackground> {
    vi.setSystemTime(new Date(2026, 10, 8, hour, minute));

    const fixture = TestBed.createComponent(SkyBackground);
    fixture.detectChanges();

    return fixture;
  }

  const find = <T extends HTMLElement>(fixture: ComponentFixture<SkyBackground>, selector: string) =>
    (fixture.nativeElement as HTMLElement).querySelector<T>(selector);

  // Devolve a foto "sunrise", "afternoon" ou "night" (ou null se ela não estiver na página)
  const photo = (fixture: ComponentFixture<SkyBackground>, name: string) =>
    find<HTMLImageElement>(fixture, `.sky-photo-${name}`);

  const opacityOf = (element: HTMLElement | null) => Number(element?.style.opacity);

  // Nível da noite que o fundo publica no <html> para as cores de texto
  const nightLevel = () => document.documentElement.style.getPropertyValue('--night-level');

  it('should create', () => {
    expect(render(12).componentInstance).toBeTruthy();
  });

  it('should be hidden from screen readers because it is only decorative', () => {
    const host = render(12).nativeElement as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show only the sunrise photo at 12:00, with an empty alt text and the light wash on top', () => {
    const fixture = render(12);
    const sunrise = photo(fixture, 'sunrise');

    expect(sunrise?.getAttribute('src')).toContain('sunrise.jpg');
    expect(sunrise?.getAttribute('alt')).toBe('');
    expect(photo(fixture, 'afternoon')).toBeNull();
    expect(photo(fixture, 'night')).toBeNull();
    expect(find(fixture, '.sky-wash')).not.toBeNull();
  });

  it('should render 12 leaves, 4 gusts and 2 swirls during the day, without stars', () => {
    const element = render(12).nativeElement as HTMLElement;

    expect(element.querySelectorAll('.leaf').length).toBe(12);
    expect(element.querySelectorAll('.wind .gust').length).toBe(4);
    expect(element.querySelectorAll('.wind .swirl').length).toBe(2);
    expect(element.querySelector('.stars')).toBeNull();
  });

  it('should keep only the sunrise photo until 15:30', () => {
    const fixture = render(15, 30);

    expect(photo(fixture, 'sunrise')).not.toBeNull();
    expect(photo(fixture, 'afternoon')).toBeNull();
    expect(photo(fixture, 'night')).toBeNull();
  });

  it('should fade the afternoon photo in over the sunrise photo after 15:30', () => {
    const fixture = render(16, 15);
    const afternoon = photo(fixture, 'afternoon');

    expect(photo(fixture, 'sunrise')).not.toBeNull();
    expect(afternoon?.getAttribute('src')).toContain('afternoon.jpg');
    expect(opacityOf(afternoon)).toBeCloseTo(0.5, 2);
  });

  it('should show the afternoon photo completely at 17:30, still without the night photo', () => {
    const fixture = render(17, 30);

    expect(opacityOf(photo(fixture, 'afternoon'))).toBe(1);
    expect(photo(fixture, 'night')).toBeNull();
  });

  it('should fade the night photo in over the afternoon photo between 18:00 and 19:00', () => {
    const fixture = render(18, 30);
    const night = photo(fixture, 'night');

    expect(night?.getAttribute('src')).toContain('night.jpg');
    expect(opacityOf(night)).toBeCloseTo(0.5, 2);
    expect(opacityOf(photo(fixture, 'afternoon'))).toBe(1);
  });

  it('should show only the night photo at 22:00', () => {
    const fixture = render(22, 0);

    expect(opacityOf(photo(fixture, 'night'))).toBe(1);
    expect(photo(fixture, 'sunrise')).toBeNull();
    expect(photo(fixture, 'afternoon')).toBeNull();
  });

  it('should bring the sunrise photo back under the night photo between 05:00 and 07:00', () => {
    const fixture = render(6, 0);

    expect(photo(fixture, 'sunrise')).not.toBeNull();
    expect(opacityOf(photo(fixture, 'night'))).toBeCloseTo(0.5, 2);
  });

  it('should keep changing the photos while the page stays open', () => {
    const fixture = render(15, 30);
    expect(photo(fixture, 'afternoon')).toBeNull();

    // Passa uma hora e meia com a página aberta: a foto da tarde precisa ter aparecido sozinha
    vi.setSystemTime(new Date(2026, 10, 8, 17, 0));
    vi.advanceTimersByTime(60_000);
    fixture.detectChanges();

    expect(opacityOf(photo(fixture, 'afternoon'))).toBeGreaterThan(0.9);
  });

  describe('leaves, wind and stars', () => {
    it('should show the leaves completely during the day', () => {
      const fixture = render(12);

      expect(opacityOf(find(fixture, '.leaves'))).toBe(1);
    });

    it('should fade the leaves out while the night photo fades in', () => {
      const fixture = render(18, 30);

      expect(opacityOf(find(fixture, '.leaves'))).toBeCloseTo(0.5, 2);
    });

    it('should remove the leaves at night, but keep the wind', () => {
      const fixture = render(22, 0);
      const element = fixture.nativeElement as HTMLElement;

      expect(find(fixture, '.leaves')).toBeNull();
      expect(element.querySelectorAll('.wind .gust').length).toBe(4);
      expect(element.querySelectorAll('.wind .swirl').length).toBe(2);
    });

    it('should bring the leaves back in the morning, as the night fades out', () => {
      const fixture = render(6, 0);

      expect(opacityOf(find(fixture, '.leaves'))).toBeCloseTo(0.5, 2);
    });

    it('should show 12 twinkling stars at night, appearing together with the night photo', () => {
      const night = render(22, 0);
      const fading = render(18, 30);

      expect((night.nativeElement as HTMLElement).querySelectorAll('.star').length).toBe(12);
      expect(opacityOf(find(night, '.stars'))).toBe(1);
      expect(opacityOf(find(fading, '.stars'))).toBeCloseTo(0.5, 2);
    });

    it('should place each star in its own spot, with its own size', () => {
      const stars = (render(22, 0).nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.star');
      const positions = new Set(Array.from(stars, (star) => `${star.style.top}/${star.style.left}`));

      expect(stars[0].style.top).toBe('8%');
      expect(stars[0].style.width).toBe('3px');
      expect(stars[1].style.width).toBe('2px');
      expect(positions.size).toBe(12);
    });
  });

  describe('afternoon level for the text and button colors', () => {
    const afternoonLevel = () => document.documentElement.style.getPropertyValue('--afternoon-level');

    it('should publish 0 in the morning', () => {
      render(10, 0);

      expect(afternoonLevel()).toBe('0.000');
    });

    it('should publish the same level as the afternoon photo', () => {
      render(16, 15);

      expect(Number(afternoonLevel())).toBeCloseTo(0.5, 2);
    });

    it('should publish 1 once the afternoon photo is complete', () => {
      render(17, 30);

      expect(afternoonLevel()).toBe('1.000');
    });

    it('should clean it up when the background is destroyed', () => {
      const fixture = render(17, 30);

      fixture.destroy();

      expect(afternoonLevel()).toBe('');
    });
  });

  describe('night level for the text colors', () => {
    it('should publish 0 on the page root during the day', () => {
      render(12);

      expect(nightLevel()).toBe('0.000');
    });

    it('should publish the same level as the night photo', () => {
      render(18, 30);

      expect(Number(nightLevel())).toBeCloseTo(0.5, 2);
    });

    it('should publish 1 at night', () => {
      render(22, 0);

      expect(nightLevel()).toBe('1.000');
    });

    it('should keep it updated while the page stays open', () => {
      const fixture = render(17, 0);
      expect(nightLevel()).toBe('0.000');

      vi.setSystemTime(new Date(2026, 10, 8, 22, 0));
      vi.advanceTimersByTime(60_000);
      fixture.detectChanges();

      expect(nightLevel()).toBe('1.000');
    });

    it('should clean it up when the background is destroyed', () => {
      const fixture = render(22, 0);
      expect(nightLevel()).toBe('1.000');

      fixture.destroy();

      expect(nightLevel()).toBe('');
    });
  });
});
