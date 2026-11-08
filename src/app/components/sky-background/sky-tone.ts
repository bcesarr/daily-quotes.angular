// Quanto o fundo está "entardecido" e quanto está "dourado" em cada horário.
// Os dois valores vão de 0 (nada) a 1 (máximo) e mudam POUCO A POUCO ao longo do dia,
// para a cor nunca dar um salto quando passa de um horário para o outro.
export interface SkyTone {
  dusk: number;   // escurecimento do entardecer (0 = foto original, 1 = entardecer completo)
  golden: number; // brilho dourado da "hora dourada" (sobe, chega ao máximo no meio da transição e volta a 0)
}

const toMinutes = (hour: number, minute = 0) => hour * 60 + minute;

// Linha do tempo do dia (hora do aparelho):
//   05:00 -> 07:00  amanhece: o entardecer vai sumindo e a foto original volta
//   07:00 -> 15:30  dia: foto original
//   15:30 -> 19:00  entardece: o fundo escurece e esquenta aos poucos
//   19:00 -> 05:00  noite: fica como o entardecer completo
const DAWN_START = toMinutes(5);
const DAWN_END = toMinutes(7);
const DUSK_START = toMinutes(15, 30);
const DUSK_END = toMinutes(19);

// Transforma "onde estamos" dentro de uma faixa de horário em um número de 0 a 1
const progress = (minutes: number, start: number, end: number) => (minutes - start) / (end - start);

// Curva suave: começa e termina devagar, sem "quinas" (t=0 -> 0, t=0.5 -> 0.5, t=1 -> 1)
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Sobe até 1 no meio da faixa e volta a 0 no fim (0 -> 1 -> 0)
const bell = (t: number) => Math.sin(Math.PI * t);

export function getSkyTone(date: Date = new Date()): SkyTone {
  // Inclui os segundos, para o valor andar de forma contínua entre um minuto e outro
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  if (minutes >= DUSK_START && minutes < DUSK_END) {
    const t = progress(minutes, DUSK_START, DUSK_END);

    return { dusk: smoothstep(t), golden: bell(t) };
  }

  if (minutes >= DUSK_END || minutes < DAWN_START) {
    return { dusk: 1, golden: 0 };
  }

  if (minutes < DAWN_END) {
    const t = progress(minutes, DAWN_START, DAWN_END);

    return { dusk: 1 - smoothstep(t), golden: bell(t) };
  }

  return { dusk: 0, golden: 0 };
}
