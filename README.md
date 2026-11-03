# FrasesDoDia

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Fundo do site (foto do amanhecer, folhas e vento)

Tudo é desenhado pelo componente `src/app/components/sky-background/`, que fica fixo atrás de todo o site (montado em `app.html`, antes do cabeçalho):

- **`public/images/sunrise.jpg`**: a foto do céu ao nascer do sol (servida como `images/sunrise.jpg`).
- **`sky-background.css`**: todo o visual do fundo.
  - `.sky-background` e `.sky-wash`: a foto cobrindo a tela e o véu claro por cima.
  - `.leaves`, `.leaf` e os keyframes `wind` e `flutter`: as 12 folhas verdes que cruzam a tela balançando.
  - `.wind`, `.gust`, `.swirl` e o keyframe `gust`: as 4 rajadas e os 2 redemoinhos de vento.
  - `@media (prefers-reduced-motion: reduce)`: desliga as animações para quem prefere menos movimento.
- **`sky-background.html`**: monta a foto, o véu, os 12 `<span class="leaf">` e os 6 elementos de vento (4 `gust` + 2 `swirl`).
- **`src/styles.css`**: os tokens de cor do fundo (`--sky-fallback`, `--sky-wash`, `--leaf`, `--leaf-light`, `--wind-line`, `--wind-swirl`).

O tamanho, a altura e a velocidade de cada folha e de cada vento vêm da posição dele (`:nth-child`) no CSS. Por isso, se mudar a quantidade de folhas ou de elementos de vento, atualize também o CSS.
