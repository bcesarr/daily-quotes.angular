// Quanto cada foto do céu aparece em cada horário.
//
// A foto da MANHÃ (sunrise.jpg) é a base e fica sempre por baixo. A da TARDE e a da NOITE ficam por
// cima e ganham opacidade aos poucos (0 = invisível, 1 = totalmente visível). Como a foto de cima
// vai aparecendo sobre a de baixo, uma imagem se transforma na outra sem nenhum salto.
export interface SkyTone {
  afternoon: number; // opacidade da foto do entardecer (afternoon.jpg)
  night: number;     // opacidade da foto da noite (night.jpg)
}

const toMinutes = (hour: number, minute = 0) => hour * 60 + minute;

// Linha do tempo do dia (hora do aparelho):
//   05:00 -> 07:00  amanhece: a noite some aos poucos e a foto da manhã volta
//   07:00 -> 15:30  dia: foto da manhã
//   15:30 -> 17:00  a foto do entardecer aparece sobre a da manhã
//   17:00 -> 18:00  entardecer completo
//   18:00 -> 19:00  a foto da noite aparece sobre a do entardecer
//   19:00 -> 05:00  noite (a foto do entardecer sai de baixo, sem ninguém ver, entre 19:00 e 20:00)
const AFTERNOON_IN_START = toMinutes(15, 30);
const AFTERNOON_IN_END = toMinutes(17);
const NIGHT_IN_START = toMinutes(18);
const NIGHT_IN_END = toMinutes(19);
const AFTERNOON_OUT_END = toMinutes(20);
const DAWN_START = toMinutes(5);
const DAWN_END = toMinutes(7);

// Transforma "onde estamos" dentro de uma faixa de horário em um número de 0 a 1
const progress = (minutes: number, start: number, end: number) => (minutes - start) / (end - start);

// Curva suave: começa e termina devagar, sem "quinas" (t=0 -> 0, t=0.5 -> 0.5, t=1 -> 1)
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function getAfternoonLevel(minutes: number): number {
  if (minutes < AFTERNOON_IN_START) {
    return 0;
  }

  if (minutes < AFTERNOON_IN_END) {
    return smoothstep(progress(minutes, AFTERNOON_IN_START, AFTERNOON_IN_END));
  }

  if (minutes < NIGHT_IN_END) {
    return 1;
  }

  // Já com a noite totalmente visível por cima, a foto do entardecer sai de baixo.
  // O valor também muda aos poucos, para a regra "nada salta" valer para o dia inteiro.
  if (minutes < AFTERNOON_OUT_END) {
    return 1 - smoothstep(progress(minutes, NIGHT_IN_END, AFTERNOON_OUT_END));
  }

  return 0;
}

function getNightLevel(minutes: number): number {
  if (minutes < DAWN_START) {
    return 1;
  }

  if (minutes < DAWN_END) {
    return 1 - smoothstep(progress(minutes, DAWN_START, DAWN_END));
  }

  if (minutes < NIGHT_IN_START) {
    return 0;
  }

  if (minutes < NIGHT_IN_END) {
    return smoothstep(progress(minutes, NIGHT_IN_START, NIGHT_IN_END));
  }

  return 1;
}

export function getSkyTone(date: Date = new Date()): SkyTone {
  // Inclui os segundos, para o valor andar de forma contínua entre um minuto e outro
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  return {
    afternoon: getAfternoonLevel(minutes),
    night: getNightLevel(minutes),
  };
}
