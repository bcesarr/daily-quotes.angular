import { Component, DOCUMENT, DestroyRef, inject, signal } from '@angular/core';

import { getSkyTone, SkyTone } from './sky-tone';

// De quanto em quanto tempo o fundo confere a hora de novo (1 minuto).
// A troca de imagem é tão lenta que isso basta, e a transição do CSS suaviza o intervalo.
const TONE_UPDATE_INTERVAL_MS = 60_000;

// Uma estrela da noite. Todas ficam sempre nos mesmos lugares (nada sorteado), para o céu não
// mudar a cada visita. A posição é em % da tela, o tamanho em px e o tempo em segundos.
interface Star {
  top: number;
  left: number;
  size: number;
  duration: number; // quanto tempo leva um ciclo de cintilar (cada estrela tem o seu)
  delay: number;    // negativo: a estrela já começa "no meio" do ciclo, e não todas juntas
}

@Component({
  selector: 'app-sky-background',
  templateUrl: './sky-background.html',
  styleUrl: './sky-background.css',
  // Cenário puramente decorativo: leitores de tela devem ignorá-lo.
  host: {
    'aria-hidden': 'true',
  },
})
export class SkyBackground {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  // Quanto cada foto aparece agora (a da manhã é a base; a da tarde e a da noite vão por cima).
  // Muda sozinho conforme o horário passa; o template usa isto como opacidade de cada foto,
  // das folhas (que somem à noite) e das estrelas (que aparecem à noite).
  protected readonly tone = signal(getSkyTone());

  // 12 folhas e 6 elementos de vento (4 rajadas + 2 redemoinhos).
  // O tamanho, a altura e a velocidade de cada um vêm do CSS, pela posição (:nth-child),
  // por isso a ORDEM e a QUANTIDADE aqui precisam bater com o sky-background.css.
  protected readonly leaves = Array.from({ length: 12 }, (_, index) => index);
  protected readonly windElements = Array.from({ length: 6 }, (_, index) => index);

  // Poucas estrelas de propósito: a foto da noite já tem muitas. Nenhuma fica em cima da lua.
  protected readonly stars: Star[] = [
    { top: 8, left: 12, size: 3, duration: 5.2, delay: -1.2 },
    { top: 14, left: 34, size: 2, duration: 4.1, delay: -3.0 },
    { top: 6, left: 58, size: 2.5, duration: 6.4, delay: -2.1 },
    { top: 12, left: 86, size: 3, duration: 5.6, delay: -4.4 },
    { top: 29, left: 22, size: 2.5, duration: 6.0, delay: -3.7 },
    { top: 41, left: 12, size: 3, duration: 5.0, delay: -1.9 },
    { top: 38, left: 40, size: 2, duration: 4.3, delay: -0.2 },
    { top: 46, left: 62, size: 2.5, duration: 6.8, delay: -5.1 },
    { top: 52, left: 84, size: 3, duration: 5.4, delay: -4.0 },
    { top: 58, left: 28, size: 2, duration: 4.8, delay: -1.5 },
    { top: 66, left: 52, size: 2.5, duration: 6.2, delay: -3.3 },
    { top: 74, left: 74, size: 2, duration: 5.8, delay: -2.4 },
  ];

  constructor() {
    this.publishLevels(this.tone());

    // Mantém o fundo atualizado se a página ficar aberta enquanto o horário passa
    const timer = setInterval(() => this.updateTone(), TONE_UPDATE_INTERVAL_MS);

    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
      this.document.documentElement.style.removeProperty('--afternoon-level');
      this.document.documentElement.style.removeProperty('--night-level');
    });
  }

  private updateTone(): void {
    const tone = getSkyTone();

    this.tone.set(tone);
    this.publishLevels(tone);
  }

  // Coloca os níveis da tarde e da noite (0 a 1) no <html> como as variáveis CSS --afternoon-level e
  // --night-level. São elas que fazem as cores de texto e de botão (styles.css) irem de manhã para
  // tarde e noite. É só uma troca de valor no navegador: nenhuma requisição, nada vai para o banco.
  private publishLevels(tone: SkyTone): void {
    const rootStyle = this.document.documentElement.style;

    rootStyle.setProperty('--afternoon-level', tone.afternoon.toFixed(3));
    rootStyle.setProperty('--night-level', tone.night.toFixed(3));
  }
}
