import { TestBed } from '@angular/core/testing';

import { GREETINGS, GreetingService } from './greeting';

describe('GreetingService', () => {
  let service: GreetingService;

  // Cria uma data com a hora, o minuto e o dia (de novembro de 2026) desejados
  const at = (hour: number, minute = 0, day = 8) => new Date(2026, 10, day, hour, minute);

  // Sorteios "de mentira": o primeiro devolve sempre a 1ª mensagem e o segundo sempre a última
  const first = () => 0;
  const last = () => 0.999;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GreetingService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 10 different messages for each period', () => {
    for (const messages of Object.values(GREETINGS)) {
      expect(messages.length).toBe(10);
      expect(new Set(messages).size).toBe(10);
    }
  });

  it('should return the plain greeting when the first message is picked', () => {
    expect(service.getGreeting(at(8), first)).toBe('Olá, bom dia!');
    expect(service.getGreeting(at(15), first)).toBe('Olá, boa tarde!');
    expect(service.getGreeting(at(21), first)).toBe('Olá, boa noite!');
  });

  it('should return the last message of the period with the highest random value', () => {
    expect(service.getGreeting(at(8), last)).toBe(GREETINGS.morning[9]);
    expect(service.getGreeting(at(15), last)).toBe(GREETINGS.afternoon[9]);
    expect(service.getGreeting(at(21), last)).toBe(GREETINGS.night[9]);
  });

  it('should keep the same message during the whole period, even after reloading', () => {
    const morning = service.getGreeting(at(5, 0), first);

    // "last" tentaria sortear outra, mas a mensagem do turno já está guardada
    expect(service.getGreeting(at(9, 30), last)).toBe(morning);
    expect(service.getGreeting(at(11, 59), last)).toBe(morning);
  });

  it('should pick a new message when the period changes', () => {
    service.getGreeting(at(11, 59), first);

    expect(service.getGreeting(at(12, 0), last)).toBe(GREETINGS.afternoon[9]);
    expect(service.getGreeting(at(18, 0), last)).toBe(GREETINGS.night[9]);
    expect(service.getGreeting(at(5, 0, 9), last)).toBe(GREETINGS.morning[9]);
  });

  it('should pick a new message on the next day in the same period', () => {
    service.getGreeting(at(8, 0, 8), first);

    expect(service.getGreeting(at(8, 0, 9), last)).toBe(GREETINGS.morning[9]);
  });

  it('should keep the same night message after midnight until 04:59', () => {
    const night = service.getGreeting(at(22, 0, 8), first);

    expect(service.getGreeting(at(0, 0, 9), last)).toBe(night);
    expect(service.getGreeting(at(4, 59, 9), last)).toBe(night);
    expect(service.getGreeting(at(5, 0, 9), last)).toBe(GREETINGS.morning[9]);
  });

  it('should pick a new message on the next night', () => {
    service.getGreeting(at(22, 0, 8), first);

    expect(service.getGreeting(at(22, 0, 9), last)).toBe(GREETINGS.night[9]);
  });

  it('should ignore saved data that is corrupted or has the wrong shape', () => {
    localStorage.setItem('frases-do-dia:greeting', '{isto não é json');
    expect(service.getGreeting(at(8), first)).toBe('Olá, bom dia!');

    localStorage.setItem('frases-do-dia:greeting', '123');
    expect(service.getGreeting(at(8), first)).toBe('Olá, bom dia!');
  });

  it('should ignore a saved message that is no longer in the list', () => {
    localStorage.setItem(
      'frases-do-dia:greeting',
      JSON.stringify({ slot: '2026-11-08|morning', message: 'mensagem antiga' }),
    );

    expect(service.getGreeting(at(8), first)).toBe('Olá, bom dia!');
  });

  it('should still work when the browser blocks the storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(service.getGreeting(at(8), first)).toBe('Olá, bom dia!');
  });
});
