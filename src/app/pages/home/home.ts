import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GreetingService } from '../../services/greeting/greeting';
import { QuoteQueueService } from '../../services/quote-queue/quote-queue';
import { Quote } from '../../services/supabase/supabase';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quoteQueue = inject(QuoteQueueService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly greetingService = inject(GreetingService);

  // Saudação sorteada uma única vez ao abrir a página (de acordo com a hora do aparelho).
  // Fica fixa enquanto a pessoa clica em "Nova Frase", para o texto não ficar trocando.
  protected readonly greeting = this.greetingService.getGreeting();
  protected readonly quote = signal<Quote | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoadingQuote = signal(false);

  ngOnInit(): void {
    this.route.url
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {
      this.loadQuote();
    });
  }

  protected showNewQuote(): void {
    this.loadQuote();
  }

  private loadQuote(): void {
    if (this.isLoadingQuote()) {
      return;
    }

    this.isLoadingQuote.set(true);
    this.errorMessage.set(null);

    const categorySlug = this.getCategorySlug();

    this.quoteQueue.getNextQuote(categorySlug).subscribe({
      next: (quote) => {
        this.quote.set(quote);
        this.isLoadingQuote.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar frase:', error);

        this.quote.set(null);

        this.errorMessage.set(
          'Não foi possível carregar a frase agora. Tente novamente ou escolha outra categoria.'
        );
        
        this.isLoadingQuote.set(false);
      },
    });
  }

  private getCategorySlug(): string | null {
    // const url = this.route.snapshot.url;

    // const categoryIndex = url.findIndex(
    //   (segment) => segment.path === 'categorias'
    // );

    // if (categoryIndex === -1) {
    //   return null;
    // }

    // return url[categoryIndex + 1]?.path ?? null;
    return this.route.snapshot.paramMap.get('slug');
  }
}
