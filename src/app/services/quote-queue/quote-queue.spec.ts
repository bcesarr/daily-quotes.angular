import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { QuoteQueueService } from './quote-queue';
import { Quote, Supabase } from '../supabase/supabase';

function makeQuote(id: number, categorySlug = 'fe'): Quote {
  return {
    id,
    category_id: 1,
    category_slug: categorySlug,
    text: `Frase ${id}`,
    author_name: null,
  };
}

describe('QuoteQueueService', () => {
  let service: QuoteQueueService;
  // Simulação do Supabase: nenhum teste faz requisição de verdade.
  const supabaseFake = { getRandomQuotes: vi.fn() };

  /** Pede a próxima frase e devolve o resultado (as respostas fake são síncronas). */
  function nextQuote(categorySlug: string | null): Quote {
    let result: Quote | undefined;
    service.getNextQuote(categorySlug).subscribe((quote) => (result = quote));
    return result as Quote;
  }

  beforeEach(() => {
    supabaseFake.getRandomQuotes.mockReset();

    TestBed.configureTestingModule({
      providers: [{ provide: Supabase, useValue: supabaseFake }],
    });
    service = TestBed.inject(QuoteQueueService);
  });

  it('should load a batch and return its first quote', () => {
    supabaseFake.getRandomQuotes.mockReturnValueOnce(of([makeQuote(1), makeQuote(2)]));

    expect(nextQuote(null).id).toBe(1);
    expect(supabaseFake.getRandomQuotes).toHaveBeenCalledWith(null, [], 20);
  });

  it('should not call the server again while there are quotes in the queue', () => {
    supabaseFake.getRandomQuotes.mockReturnValueOnce(of([makeQuote(1), makeQuote(2)]));

    nextQuote(null);
    expect(nextQuote(null).id).toBe(2);
    expect(supabaseFake.getRandomQuotes).toHaveBeenCalledTimes(1);
  });

  it('should exclude already shown quotes when loading the next batch', () => {
    supabaseFake.getRandomQuotes
      .mockReturnValueOnce(of([makeQuote(1)]))
      .mockReturnValueOnce(of([makeQuote(2)]));

    nextQuote(null);
    expect(nextQuote(null).id).toBe(2);
    expect(supabaseFake.getRandomQuotes).toHaveBeenLastCalledWith(null, [1], 20);
  });

  it('should keep separate history for each category', () => {
    supabaseFake.getRandomQuotes
      .mockReturnValueOnce(of([makeQuote(1, 'fe')]))
      .mockReturnValueOnce(of([makeQuote(7, 'disciplina')]));

    nextQuote('fe');
    nextQuote('disciplina');

    // A categoria "disciplina" não deve excluir a frase 1, que é de "fe".
    expect(supabaseFake.getRandomQuotes).toHaveBeenLastCalledWith('disciplina', [], 20);
  });

  it('should start a new cycle, avoiding an immediate repeat, when all quotes were shown', () => {
    supabaseFake.getRandomQuotes
      .mockReturnValueOnce(of([makeQuote(1)])) // primeiro lote
      .mockReturnValueOnce(of([])) // acabaram as frases inéditas
      .mockReturnValueOnce(of([makeQuote(2)])); // novo ciclo

    nextQuote(null);
    const quote = nextQuote(null);

    expect(quote.id).toBe(2);
    // No novo ciclo só a última frase exibida fica excluída.
    expect(supabaseFake.getRandomQuotes).toHaveBeenLastCalledWith(null, [1], 20);
  });

  it('should fail when there are no quotes even after a new cycle', () => {
    supabaseFake.getRandomQuotes.mockReturnValue(of([]));

    let error: unknown;
    service.getNextQuote(null).subscribe({ error: (e) => (error = e) });

    expect(error).toBeInstanceOf(Error);
  });

  it('should propagate server errors', () => {
    supabaseFake.getRandomQuotes.mockReturnValueOnce(throwError(() => new Error('falha de rede')));

    let error: unknown;
    service.getNextQuote(null).subscribe({ error: (e) => (error = e) });

    expect((error as Error).message).toBe('falha de rede');
  });
});


// import { TestBed } from '@angular/core/testing';

// import { QuoteQueue } from '../quote-queue';

// describe('QuoteQueue', () => {
//   let service: QuoteQueue;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(QuoteQueue);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
// });
