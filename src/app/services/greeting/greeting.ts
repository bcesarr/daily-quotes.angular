import { Injectable, inject } from '@angular/core';

import { DayPeriod, DayPeriodService } from '../day-period/day-period';

// Nome da "gaveta" do navegador onde guardamos a mensagem do período atual.
const STORAGE_KEY_GREETING = 'frases-do-dia:greeting';

// O que fica guardado: para qual "turno" é a mensagem (ex.: "2026-11-08|morning") e a mensagem em si.
interface StoredGreeting {
  slot: string;
  message: string;
}

// Cada período tem suas mensagens. A primeira é a saudação "pura" (bom dia / boa tarde / boa noite)
// e as demais são frases curtas sobre aquele momento do dia. Uma delas é sorteada a cada período.
// Exportada para os testes conferirem a quantidade e o conteúdo das listas.
export const GREETINGS: Record<DayPeriod, string[]> = {
  morning: [
    'Olá, bom dia!',
    'Bom dia! Que hoje seja um ótimo começo.',
    'Uma nova manhã, uma nova chance.',
    'Comece o dia com boa inspiração.',
    'Bom dia! Hoje é um dia para brilhar.',
    'Respire fundo: o dia está só começando.',
    'A manhã chegou cheia de possibilidades.',
    'Bom dia! Um passo de cada vez.',
    'Que a sua manhã comece com calma e foco.',
    'O dia está em branco. Escreva bem.',
  ],
  afternoon: [
    'Olá, boa tarde!',
    'Boa tarde! Respire fundo e siga firme.',
    'Ainda dá tempo de fazer o dia valer.',
    'Que a sua tarde seja leve e produtiva.',
    'Boa tarde! Você já chegou até aqui.',
    'Uma pausa agora também é produtividade.',
    'Boa tarde! Continue, você está indo bem.',
    'A tarde é boa para recomeçar com calma.',
    'Que a tarde traga boas notícias.',
    'Beba água, respire e siga em frente.',
  ],
  night: [
    'Olá, boa noite!',
    'Boa noite! Você fez o que pôde hoje.',
    'Hora de desacelerar e agradecer o dia.',
    'Descanse: amanhã é uma nova chance.',
    'Boa noite! Que o seu descanso seja leve.',
    'Deixe as preocupações para amanhã.',
    'Boa noite! Todo dia termina com uma lição.',
    'A noite é o momento de recarregar.',
    'Que a noite traga paz e bons sonhos.',
    'Termine o dia com um pensamento bom.',
  ],
};

@Injectable({
  providedIn: 'root',
})
export class GreetingService {
  private readonly dayPeriod = inject(DayPeriodService);

  // A mensagem é sorteada UMA vez por "turno" (um dia + um período) e fica guardada no aparelho.
  // Recarregar a página no mesmo turno mostra sempre a mesma mensagem. Ela só é sorteada de novo
  // quando o período muda (manhã -> tarde -> noite -> manhã) ou quando vira outro dia.
  // "random" existe só para os testes poderem escolher a mensagem de propósito.
  getGreeting(date: Date = new Date(), random: () => number = Math.random): string {
    const period = this.dayPeriod.getPeriod(date);
    const messages = GREETINGS[period];
    const slot = this.getSlot(date, period);

    const stored = this.readStored();

    // Só reaproveita se for do turno atual E ainda existir na lista (caso a lista mude no futuro)
    if (stored && stored.slot === slot && messages.includes(stored.message)) {
      return stored.message;
    }

    const message = messages[Math.floor(random() * messages.length)];

    this.saveStored({ slot, message });

    return message;
  }

  // Identifica o turno, por exemplo "2026-11-08|morning".
  // A madrugada (00:00 até 04:59) ainda faz parte da noite que começou NO DIA ANTERIOR,
  // então a mensagem da noite não muda na virada da meia-noite.
  private getSlot(date: Date, period: DayPeriod): string {
    const day = new Date(date);

    if (period === 'night' && date.getHours() < 5) {
      day.setDate(day.getDate() - 1);
    }

    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(day.getDate()).padStart(2, '0');

    return `${day.getFullYear()}-${month}-${dayOfMonth}|${period}`;
  }

  // O navegador pode bloquear o armazenamento (modo privado, configuração do usuário) ou o
  // conteúdo pode estar corrompido. Nesses casos o site continua funcionando, só sem "lembrar".
  private readStored(): StoredGreeting | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GREETING);

      if (!raw) {
        return null;
      }

      const data = JSON.parse(raw) as Partial<StoredGreeting> | null;

      if (data && typeof data.slot === 'string' && typeof data.message === 'string') {
        return { slot: data.slot, message: data.message };
      }

      return null;
    } catch {
      return null;
    }
  }

  private saveStored(value: StoredGreeting): void {
    try {
      localStorage.setItem(STORAGE_KEY_GREETING, JSON.stringify(value));
    } catch {
      // Sem armazenamento: a mensagem só não fica salva (será sorteada de novo no próximo carregamento)
    }
  }
}
