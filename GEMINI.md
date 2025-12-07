# Project Overview

`pdv-electron-app` is an Electron application designed as a Point of Sale (PDV) system (implied by the name). It utilizes a modern stack incorporating **Electron**, **TypeScript**, **Vite**, and **Electron Forge**.

## Key Technologies

-   **Electron:** Cross-platform desktop application framework.
-   **TypeScript:** Statically typed superset of JavaScript for type safety.
-   **Vite:** Fast build tool and development server, handling bundling for both main and renderer processes.
-   **Electron Forge:** Complete tool for creating, publishing, and installing Electron applications.
-   **ESLint:** Pluggable linting utility for JavaScript and TypeScript.

## Architecture

The application follows the standard Electron architecture with a separation of concerns between the Main and Renderer processes, facilitated by Electron Forge's Vite plugin.

*   **Main Process (`src/main.ts`):** The entry point of the application. It manages the application lifecycle, creates browser windows, and handles system-level operations. It uses variables like `MAIN_WINDOW_VITE_DEV_SERVER_URL` injected by the build system to load the correct content.
*   **Renderer Process (`src/renderer.ts`):** Loaded via `index.html`. This handles the frontend UI/UX of the application.
*   **Preload Script (`src/preload.ts`):** Executes in a context that has access to both Node.js APIs and the DOM, serving as a bridge to safely expose features to the renderer process.
*   **Configuration:**
    *   `forge.config.ts`: Electron Forge configuration, including makers (Squirrel, ZIP, Deb, RPM) and plugins (Vite, Fuses).
    *   `vite.main.config.ts` / `vite.renderer.config.ts` / `vite.preload.config.ts`: Specific Vite configurations for each process.

# Building and Running

The project uses `npm` scripts defined in `package.json` for development and build tasks.

| Command | Description |
| :--- | :--- |
| `npm start` | Starts the application in development mode with hot-reloading (via `electron-forge start`). |
| `npm run package` | Packages the application into a platform-specific executable bundle (via `electron-forge package`). |
| `npm run make` | Generates distributables (installers) for the current platform (via `electron-forge make`). |
| `npm run publish` | Publishes the generated artifacts (via `electron-forge publish`). |
| `npm run lint` | Runs ESLint to check for code quality and style issues. |

# Development Conventions

*   **Language:** Strict TypeScript is used throughout the project (`tsconfig.json` enforces `noImplicitAny`).
*   **Module System:** The project uses ES Modules syntax (`import`/`export`) which is compiled by Vite.
*   **Linting:** ESLint is configured with TypeScript support. Ensure code passes lint checks before committing.
*   **Formatting:** While not explicitly enforced by a script in `package.json`, standard formatting conventions should be followed.
*   **Vite Integration:** When adding new entry points or modifying the build pipeline, update `forge.config.ts` to reflect changes in the Vite plugin configuration.
