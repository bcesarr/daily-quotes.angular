import { Injectable } from '@angular/core';

export type DayPeriod = 'morning' | 'afternoon' | 'night';

// Regra do horário da saudação: em que parte do dia estamos (manhã, tarde ou noite).
// O fundo do site usa uma regra própria, mais gradual (veja sky-tone.ts), porque a cor
// precisa mudar aos poucos e não de uma vez na troca de período.
@Injectable({
  providedIn: 'root',
})
export class DayPeriodService {
  // Manhã:  05:00 até 11:59
  // Tarde:  12:00 até 17:59
  // Noite:  18:00 até 04:59 (atravessa a meia-noite)
  // Usa a hora do aparelho de quem acessa (e não a do servidor), então vale para qualquer fuso.
  getPeriod(date: Date = new Date()): DayPeriod {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return 'morning';
    }

    if (hour >= 12 && hour < 18) {
      return 'afternoon';
    }

    return 'night';
  }
}
