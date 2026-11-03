import { Component } from '@angular/core';

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
  // 12 folhas e 6 elementos de vento (4 rajadas + 2 redemoinhos).
  // O tamanho, a altura e a velocidade de cada um vêm do CSS, pela posição (:nth-child),
  // por isso a ORDEM e a QUANTIDADE aqui precisam bater com o sky-background.css.
  protected readonly leaves = Array.from({ length: 12 }, (_, index) => index);
  protected readonly windElements = Array.from({ length: 6 }, (_, index) => index);
}
