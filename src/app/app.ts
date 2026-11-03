import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { SkyBackground } from './components/sky-background/sky-background';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, SkyBackground],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frases-do-dia');
}
