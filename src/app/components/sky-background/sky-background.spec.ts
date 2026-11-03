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

  it('should render 12 leaves, 4 gusts and 2 swirls', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.leaf').length).toBe(12);
    expect(element.querySelectorAll('.wind .gust').length).toBe(4);
    expect(element.querySelectorAll('.wind .swirl').length).toBe(2);
  });
});
