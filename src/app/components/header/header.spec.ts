import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the categories menu with the button', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('.drop-down-categories-button') as HTMLButtonElement;
    const menu = element.querySelector('#categories-menu') as HTMLElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('dropdown-menu-open')).toBe(false);

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('dropdown-menu-open')).toBe(true);

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close the menu when Escape is pressed', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('.drop-down-categories-button') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close the menu when clicking outside of it', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('.drop-down-categories-button') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
