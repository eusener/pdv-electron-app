# pdv-electron-app

`pdv-electron-app` é uma aplicação Electron projetada como um sistema de Ponto de Venda (PDV). Ela utiliza uma pilha de desenvolvimento moderna, incluindo **Electron**, **TypeScript**, **Vite** e **Electron Forge** para entregar uma aplicação desktop robusta e eficiente.

## Principais Tecnologias

-   **Electron:** Permite o desenvolvimento de aplicações desktop multiplataforma usando tecnologias web.
-   **TypeScript:** Fornece tipagem estática para melhor qualidade e manutenção do código.
-   **Vite:** Uma ferramenta de build rápida e servidor de desenvolvimento, otimizando a experiência de desenvolvimento para os processos principal e de renderização.
-   **Electron Forge:** Um conjunto de ferramentas abrangente para criar, publicar e instalar aplicações Electron, lidando com tudo, desde o scaffolding até o empacotamento.
-   **ESLint:** Garante a qualidade e consistência do código através de regras de linting configuráveis para TypeScript e JavaScript.

## Arquitetura

A aplicação adere ao padrão de arquitetura padrão do Electron, separando as preocupações entre os processos Principal (Main) e de Renderização (Renderer). Essa separação é gerenciada eficientemente pelo plugin Vite do Electron Forge.

*   **Processo Principal (`src/main.ts`):** Este é o ponto de entrada da aplicação, responsável por gerenciar o ciclo de vida do app, criar e controlar janelas do navegador e lidar com interações nativas do sistema. Ele carrega conteúdo dinamicamente usando variáveis como `MAIN_WINDOW_VITE_DEV_SERVER_URL` injetadas durante o processo de build.
*   **Processo de Renderização (`src/renderer.ts`):** Este processo é responsável por renderizar a interface do usuário e a experiência da aplicação, carregada principalmente através do `index.html`.
*   **Script de Preload (`src/preload.ts`):** Atua como uma ponte, executando em um contexto isolado que fornece acesso seguro às APIs do Node.js a partir do processo de renderização, mantendo a segurança.

### Configuração

*   `forge.config.ts`: Configuração central do Electron Forge, detalhando o empacotamento (criadores como Squirrel, ZIP, Deb, RPM) e plugins integrados (Vite, Fuses).
*   `vite.main.config.ts`, `vite.renderer.config.ts`, `vite.preload.config.ts`: Configurações específicas do Vite adaptadas para cada um dos processos distintos do Electron.

## Compilando e Executando

O projeto utiliza scripts `npm` definidos no `package.json` para fluxos de trabalho de desenvolvimento e build simplificados.

| Comando               | Descrição                                                                 |
| :-------------------- | :------------------------------------------------------------------------ |
| `npm start`           | Inicia a aplicação em modo de desenvolvimento, com hot-reloading.         |
| `npm run package`     | Empacota a aplicação em um bundle executável específico da plataforma.    |
| `npm run make`        | Gera distribuíveis (instaladores) para o sistema operacional atual.       |
| `npm run publish`     | Publica os artefatos da aplicação gerados.                                |
| `npm run lint`        | Executa o ESLint para impor padrões de qualidade e estilo de código.      |

## Estrutura do Projeto

```
.
├── .env.example
├── .eslintrc.json
├── .gitignore
├── forge.config.ts
├── forge.env.d.ts
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.main.config.ts
├── vite.preload.config.ts
├── vite.renderer.config.ts
├── src/
│   ├── App.tsx
│   ├── global.d.ts
│   ├── index.css
│   ├── main.ts
│   ├── preload.ts
│   ├── renderer.ts
│   ├── components/
│   │   ├── ClientDialog.tsx
│   │   ├── Core.tsx
│   │   ├── DiscountDialog.tsx
│   │   ├── Input.tsx
│   │   ├── LayoutSelector.tsx
│   │   ├── PaymentDialog.tsx
│   │   ├── SavedSalesDialog.tsx
│   │   ├── petshop/
│   │   │   └── ServiceQueue.tsx
│   │   ├── restaurant/
│   │   │   └── TableMap.tsx
│   │   └── retail/
│   │       └── SmartRecommendations.tsx
│   ├── database/
│   │   ├── index.ts
│   │   ├── init.ts
│   │   └── schema.sql
│   ├── fiscal/
│   │   ├── nfce.ts
│   │   └── TaxEngine.ts
│   ├── hooks/
│   │   ├── useBarcodeScanner.ts
│   │   └── useShortcuts.ts
│   ├── layouts/
│   │   └── config.tsx
│   ├── services/
│   │   ├── SyncWorker.ts
│   │   └── TefService.ts
│   └── styles/
│       └── theme.css
└── README.md
```