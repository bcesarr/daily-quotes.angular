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

  it('should open and close the hamburger menu with its button', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector('.header-menu-button') as HTMLButtonElement;
    const menu = element.querySelector('#header-menu') as HTMLElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menuButton.getAttribute('aria-label')).toBe('Abrir menu');
    expect(menu.classList.contains('header-menu-open')).toBe(false);

    menuButton.click();
    await fixture.whenStable();
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(menuButton.getAttribute('aria-label')).toBe('Fechar menu');
    expect(menu.classList.contains('header-menu-open')).toBe(true);

    menuButton.click();
    await fixture.whenStable();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('header-menu-open')).toBe(false);
  });

  it('should close the hamburger menu when Escape is pressed', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector('.header-menu-button') as HTMLButtonElement;

    menuButton.click();
    await fixture.whenStable();

    menuButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close only the categories list when Escape is pressed with both menus open', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector('.header-menu-button') as HTMLButtonElement;
    const categoriesButton = element.querySelector('.drop-down-categories-button') as HTMLButtonElement;

    menuButton.click();
    categoriesButton.click();
    await fixture.whenStable();

    categoriesButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(categoriesButton.getAttribute('aria-expanded')).toBe('false');
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close the hamburger menu when clicking on the blurred background', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector('.header-menu-button') as HTMLButtonElement;
    const backdrop = element.querySelector('.header-menu-backdrop') as HTMLElement;

    menuButton.click();
    await fixture.whenStable();
    expect(backdrop.classList.contains('header-menu-backdrop-open')).toBe(true);

    backdrop.click();
    await fixture.whenStable();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(backdrop.classList.contains('header-menu-backdrop-open')).toBe(false);
  });

  it('should close the hamburger menu when clicking outside of the header', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector('.header-menu-button') as HTMLButtonElement;

    menuButton.click();
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});
