import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyBackground } from './sky-background';

describe('SkyBackground', () => {
  let component: SkyBackground;
  let fixture: ComponentFixture<SkyBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkyBackground],
    }).compileComponents();

    fixture = TestBed.createComponent(SkyBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden from screen readers because it is only decorative', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render the sunrise photo with an empty alt text and the light wash on top', () => {
    const element = fixture.nativeElement as HTMLElement;
    const photo = element.querySelector('.sky-background') as HTMLImageElement;

    expect(photo.getAttribute('src')).toContain('sunrise.jpg');
    expect(photo.getAttribute('alt')).toBe('');
    expect(element.querySelector('.sky-wash')).not.toBeNull();
  });

  it('should render the golden hour and dusk layers', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.sky-golden')).not.toBeNull();
    expect(element.querySelector('.sky-dusk')).not.toBeNull();
  });

  it('should render 12 leaves, 4 gusts and 2 swirls', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.leaf').length).toBe(12);
    expect(element.querySelectorAll('.wind .gust').length).toBe(4);
    expect(element.querySelectorAll('.wind .swirl').length).toBe(2);
  });
});

describe('SkyBackground colors by time of day', () => {
  // Congela só o relógio (Date) e o setInterval; o resto continua normal
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Lê o nível de uma das variáveis CSS que o componente coloca no fundo
  const level = (fixture: ComponentFixture<SkyBackground>, name: string) =>
    Number((fixture.nativeElement as HTMLElement).style.getPropertyValue(name));

  it('should keep the original photo at 12:00', () => {
    vi.setSystemTime(new Date(2026, 10, 8, 12, 0));

    const fixture = TestBed.createComponent(SkyBackground);
    fixture.detectChanges();

    expect(level(fixture, '--sky-dusk-level')).toBe(0);
    expect(level(fixture, '--sky-golden-level')).toBe(0);
  });

  it('should be in the middle of the transition at 17:15', () => {
    vi.setSystemTime(new Date(2026, 10, 8, 17, 15));

    const fixture = TestBed.createComponent(SkyBackground);
    fixture.detectChanges();

    expect(level(fixture, '--sky-dusk-level')).toBeCloseTo(0.5, 2);
    expect(level(fixture, '--sky-golden-level')).toBeCloseTo(1, 2);
  });

  it('should be fully dusk at night', () => {
    vi.setSystemTime(new Date(2026, 10, 8, 22, 0));

    const fixture = TestBed.createComponent(SkyBackground);
    fixture.detectChanges();

    expect(level(fixture, '--sky-dusk-level')).toBe(1);
    expect(level(fixture, '--sky-golden-level')).toBe(0);
  });

  it('should keep changing the colors while the page stays open', () => {
    vi.setSystemTime(new Date(2026, 10, 8, 15, 30));

    const fixture = TestBed.createComponent(SkyBackground);
    fixture.detectChanges();
    expect(level(fixture, '--sky-dusk-level')).toBe(0);

    // Passa uma hora e meia com a página aberta: o fundo precisa ter entardecido sozinho
    vi.setSystemTime(new Date(2026, 10, 8, 17, 0));
    vi.advanceTimersByTime(60_000);
    fixture.detectChanges();

    expect(level(fixture, '--sky-dusk-level')).toBeGreaterThan(0.3);
    expect(level(fixture, '--sky-dusk-level')).toBeLessThan(0.7);
  });
});
