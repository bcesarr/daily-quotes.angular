import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { getSkyTone } from './sky-tone';

// De quanto em quanto tempo o fundo confere a hora de novo (1 minuto).
// A mudança de cor é tão lenta que isso basta, e a transição do CSS suaviza o intervalo.
const TONE_UPDATE_INTERVAL_MS = 60_000;

@Component({
  selector: 'app-sky-background',
  templateUrl: './sky-background.html',
  styleUrl: './sky-background.css',
  // Os dois níveis viram variáveis CSS no próprio fundo (--sky-dusk-level e --sky-golden-level).
  // O CSS usa essas variáveis como opacidade das camadas de entardecer e de hora dourada.
  host: {
    'aria-hidden': 'true', // Cenário puramente decorativo: leitores de tela devem ignorá-lo.
    '[style.--sky-dusk-level]': 'duskLevel()',
    '[style.--sky-golden-level]': 'goldenLevel()',
  },
})
export class SkyBackground {
  private readonly destroyRef = inject(DestroyRef);

  // Quanto o fundo está entardecido/dourado agora. Muda sozinho conforme o horário passa.
  private readonly tone = signal(getSkyTone());

  protected readonly duskLevel = computed(() => this.tone().dusk.toFixed(3));
  protected readonly goldenLevel = computed(() => this.tone().golden.toFixed(3));

  // 12 folhas e 6 elementos de vento (4 rajadas + 2 redemoinhos).
  // O tamanho, a altura e a velocidade de cada um vêm do CSS, pela posição (:nth-child),
  // por isso a ORDEM e a QUANTIDADE aqui precisam bater com o sky-background.css.
  protected readonly leaves = Array.from({ length: 12 }, (_, index) => index);
  protected readonly windElements = Array.from({ length: 6 }, (_, index) => index);

  constructor() {
    // Mantém o fundo atualizado se a página ficar aberta enquanto o horário passa
    const timer = setInterval(() => this.tone.set(getSkyTone()), TONE_UPDATE_INTERVAL_MS);

    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
