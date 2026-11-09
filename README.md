# Inspira

Site de frases motivacionais. A cada clique em **Nova Frase** aparece uma frase aleatória, sem repetir as que a pessoa já viu, e as frases podem ser filtradas por categoria (Fé, Motivação, Disciplina e outras).

Projeto pessoal e de portfólio, em desenvolvimento. Feito com Angular, TypeScript e CSS puro, com dados no Supabase.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Configuração](#configuração)
- [Scripts](#scripts)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Backend (Supabase)](#backend-supabase)
- [Estilização](#estilização)
- [Acessibilidade](#acessibilidade)
- [Segurança](#segurança)
- [Testes](#testes)
- [Build e deploy](#build-e-deploy)
- [Autor](#autor)

## Funcionalidades

- Frase aleatória a cada clique, sem repetir as já exibidas até acabarem (fila por categoria, com novo ciclo quando todas foram vistas).
- Categorias carregadas do banco (`/categorias/:slug`).
- Saudação que muda com o horário do aparelho: manhã (05:00–11:59), tarde (12:00–17:59) e noite (18:00–04:59). A mensagem é sorteada entre as 10 de cada período e fica salva no aparelho (`localStorage`), então não troca ao recarregar: só muda quando o período muda ou vira outro dia.
- Fundo com três fotos do céu (manhã, entardecer e noite) que se misturam aos poucos, sem saltos: foto da manhã até 15:30; entardecer entre 15:30 e 17:00; noite entre 18:00 e 19:00; e volta à manhã entre 05:00 e 07:00. Cada foto só é baixada quando aparece.
- À noite as folhas somem suavemente (o vento continua) e aparecem poucas estrelas com brilho suave que cintila. As cores do texto passam do azul-marinho ao branco azulado, também aos poucos.
- Página Sobre com o mesmo vidro desfocado do cartão das frases.
- Contador de acessos e de visitantes no rodapé.
- Layout responsivo, mobile-first, com menu hambúrguer no celular e cabeçalho que fica fixo ao rolar a página.
- Páginas: Início, Sobre e 404. Entrar, Cadastre-se e Recuperar senha ainda não estão disponíveis.

## Tecnologias

| Área | Tecnologia |
| --- | --- |
| Framework | Angular 22 (componentes standalone, signals, novo controle de fluxo `@if`/`@for`) |
| Linguagem | TypeScript 6, com `strict` e `strictTemplates` ativos |
| Estilos | CSS puro (sem Tailwind ou outro framework), com variáveis CSS |
| Dados | Supabase (PostgREST), acessado com `HttpClient` |
| Testes | Vitest + jsdom, pelo runner do Angular (`ng test`) |
| Formatação | Prettier |

## Como rodar

Pré-requisitos: **Node.js 24** e **npm 12** (versões usadas no desenvolvimento; o campo `packageManager` do `package.json` indica o npm).

```bash
npm install
npm start
```

O site abre em `http://localhost:4200/` e recarrega sozinho a cada alteração.

## Configuração

Os dados do Supabase ficam em `src/environments/`:

| Arquivo | Quando é usado |
| --- | --- |
| `environment.development.ts` | `npm start` e `npm run watch` |
| `environment.ts` | `npm run build` (produção) |

Cada arquivo tem:

```ts
export const environment = {
  production: false,                       // true em environment.ts
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseKey: 'sb_publishable_...',       // chave pública (publishable/anon)
};
```

> Use **somente** a chave pública (publishable/anon). Nunca coloque a `service_role` no front-end: tudo que está em `environment*.ts` vai para o navegador.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Servidor de desenvolvimento (`ng serve`) |
| `npm run build` | Build de produção em `dist/inspira/browser/` |
| `npm run watch` | Build de desenvolvimento que recompila ao salvar |
| `npm test` | Testes em modo observação |
| `npx ng test --watch=false` | Roda os testes uma vez e termina |

## Estrutura do projeto

```text
public/
  icons/                       ícones SVG (redes sociais, setas)
  images/                      fotos do céu: sunrise.jpg (manhã), afternoon.jpg (entardecer) e night.jpg (noite)
src/
  environments/                configuração por ambiente
  styles.css                   tokens (cores, tipografia, animações) e estilos globais
  app/
    app.config.ts              providers (roteador, HttpClient)
    app.routes.ts              rotas
    components/
      header/                  cabeçalho, menu hambúrguer e dropdown de categorias
      footer/                  rodapé e estatísticas de acesso
      sky-background/          fundo animado
    pages/                     home, about, login-page, sign-up-page, reset-password-page, not-found
    services/
      supabase/                acesso à API do Supabase (modelos Quote e Category)
      category/                lista de categorias
      day-period/              período do dia (manhã, tarde, noite) usado pela saudação
      greeting/                saudação por período do dia, salva no aparelho
      quote-queue/             fila de frases sem repetição
      site-status/             contador de acessos e visitantes
```

Cada componente e página tem seu `.ts`, `.html`, `.css` e `.spec.ts`, e os estilos são isolados por componente.

## Backend (Supabase)

O SQL do banco não está versionado neste repositório; ele foi aplicado direto no painel do Supabase. O front-end depende deste contrato:

| Item | Descrição |
| --- | --- |
| `categories` | `id`, `name`, `slug`, `display_order`, `active`. Só as ativas são listadas. |
| `quotes` | `id`, `category_id`, `text`, `author_name`, `active`. |
| `site_stats` | Linha única (`id = 1`) com `total_visits` e `unique_visitors`. |
| RPC `get_random_quotes(p_category_slug, p_excluded_ids, p_limit)` | Frases ativas aleatórias, sem as já exibidas, com limite máximo de 20. |
| RPC `increment_total_visits()` | Soma 1 aos acessos e devolve o novo total. |
| RPC `increment_unique_visitors()` | Soma 1 aos visitantes e devolve o novo total. |

Regras de segurança aplicadas no banco:

- RLS ligado nas três tabelas, com políticas apenas de leitura (`SELECT`): categorias e frases ativas, e estatísticas.
- Nenhuma política de escrita: só as funções `increment_*` alteram `site_stats`.
- As funções `increment_*` são `SECURITY DEFINER` com `search_path` vazio e nomes de tabela qualificados (`public.site_stats`).

**Como contamos:** a visita é registrada uma vez por sessão do navegador (`sessionStorage`) e o visitante uma vez por navegador (`localStorage`). Os números são aproximados e não à prova de manipulação.

## Estilização

CSS puro, **mobile-first**: os estilos sem `@media` valem para celular e as `@media (min-width: ...)` só acrescentam ajustes.

- **Breakpoints:** `40rem` (640px), `48rem` (768px) e `64rem` (1024px), em `rem`.
- **Telas grandes:** o tamanho-base do `html` aumenta em 1440px, 1920px, 2560px e 3840px, e como tudo usa `rem`, a interface cresce proporcionalmente.
- **Tipografia:** escala fluida única em tokens (`--font-size-h1`, `--font-size-body`, `--font-size-link` e outros). Nenhum CSS usa `font-size` fixo.
- **Tokens:** paleta, cores semânticas, tipografia e animações do menu ficam no `:root` do `src/styles.css`.
- **Cores de texto e de botão por horário:** `--color-text`, `--color-text-soft`, `--color-text-accent` e `--color-button-*` passam de manhã (azul-marinho) para tarde (um tom mais escuro de azul-marinho, por causa da foto mais azul) e noite (branco azulado). Elas dependem de `--afternoon-level` e `--night-level` (de 0 a 1), que o componente `sky-background` atualiza no `<html>` a cada minuto. Use sempre estes tokens para cor de texto e de botão, e não as cores da paleta direto.
- **Fontes:** Manrope em todo o site e Cormorant Garamond somente nas frases motivacionais, no nome do autor e na citação da página Sobre, pelo Google Fonts. Os nomes ficam nos tokens `--font-sans` e `--font-serif`.

## Acessibilidade

- Menu e dropdown acessíveis por teclado, com `aria-expanded` dinâmico; `Esc` fecha e clicar fora também.
- Áreas de toque de cerca de 44px nos itens do menu.
- Fundo animado marcado como decorativo (`aria-hidden`) e desligado para quem prefere menos movimento.
- Páginas em `pt-BR` (`<html lang="pt-BR">`).

## Segurança

- Só a chave pública do Supabase vai para o navegador; as regras reais de proteção estão no RLS do banco (veja [Backend](#backend-supabase)).
- Os dados do formulário não são registrados no console.
- Dependências: rode `npm audit` periodicamente. Avisos em ferramentas de desenvolvimento (Angular CLI, Vite) não vão para o site publicado; confira com `npm audit --omit=dev`.

## Testes

```bash
npx ng test --watch=false
```

Cobrem os serviços (fila de frases, categorias, período do dia, saudação, Supabase e contador), o cabeçalho (menu, categorias e cabeçalho fixo), o rodapé e o fundo. O Supabase é substituído por simulações, então nenhum teste faz requisição real.

## Build e deploy

```bash
npm run build
```

Os arquivos estáticos ficam em `dist/inspira/browser/`. Para publicar em qualquer hospedagem estática:

- Configure o **fallback para `index.html`** em todas as rotas. Sem isso, abrir `/sobre` direto dá erro 404.
- Configure **cabeçalhos de segurança** na hospedagem (ainda não configurados): `Content-Security-Policy` (liberando o domínio do Supabase e do Google Fonts), `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `frame-ancestors`.

## Autor

**Bruno Cesar** · [LinkedIn](https://www.linkedin.com/in/bcesarr/) · [GitHub](https://www.github.com/bcesarr)
