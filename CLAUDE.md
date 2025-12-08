# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development with hot-reloading |
| `npm run package` | Package executable for current platform |
| `npm run make` | Generate installers for current OS |
| `npm run publish` | Publish application artifacts |
| `npm run lint` | Run ESLint on TypeScript files |

## Architecture Overview

This is an Electron PDV (Point of Sale) application built with React 19, TypeScript, and PostgreSQL.

### Process Architecture

```
┌─────────────────┐     IPC Bridge      ┌──────────────────┐
│  Main Process   │◄──────────────────►│ Renderer Process │
│  (src/main.ts)  │   contextBridge    │   (React App)    │
└────────┬────────┘                     └──────────────────┘
         │
    ┌────┴────┐
    │ Preload │  Exposes: window.api
    │  Bridge │  Methods: saveSale, getPrinters, printData,
    └─────────┘           getPrinterConfig, savePrinterConfig
```

### IPC Communication Pattern

All IPC uses `ipcRenderer.invoke()` / `ipcMain.handle()` request-response pattern. The preload script (`src/preload.ts`) exposes a whitelist of methods via `contextBridge.exposeInMainWorld('api', {...})`.

### Database Layer

- **PostgreSQL** via `pg` library with connection pool
- Environment config: `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
- Schema in `src/database/schema.sql` initialized on app start

**Key Tables:**
- `products` - Product catalog with legacy (ICMS/PIS/COFINS) and reform (IBS/CBS) tax rates
- `vendas` - Sales master with tax totals
- `venda_items` - Line items with per-item tax breakdown
- `vendas_sync_queue` - Offline-to-online sync queue (status: PENDING → PROCESSING → SYNCED)

### Services

- **SyncWorker** (`src/services/SyncWorker.ts`): Background daemon (5s interval) that syncs PENDING sales when online
- **Printer Service** (`src/services/printer/`): Supports HTML (BrowserWindow silent print) and raw modes (ZPL, ESC/POS, text via `lp` command)
- **Receipt Generator** (`src/services/receiptGenerator.ts`): Formats receipts for thermal printers

### Fiscal/Tax System

- **TaxEngine** (`src/fiscal/TaxEngine.ts`): Calculates legacy taxes (ICMS, PIS, COFINS) and reform taxes (IBS, CBS from 2026)
- **NFCe** (`src/fiscal/nfce.ts`): Generates NFC-e XML (Model 65) with offline contingency support (stubs for signing/QR code)

### Layout System

Multi-layout support configured in `src/layouts/config.tsx`:
- **Retail**: Grid cards, categories, left cart
- **Restaurant**: Table map, right cart
- **Supermarket**: Barcode scanning focus
- **PetShop**: Service queue + products
- **Decor**: Interior design products

Each layout defines: theme colors, product card style, cart position, labels, categories, and sample products.

### React State Management

Local component state in `App.tsx` (no Redux/Context):
- Cart, search, categories
- Global discount, payment dialog
- Online/offline status (Navigator.onLine)
- Theme (light/dark, localStorage-persisted)
- Layout-specific: tables (restaurant), services (petshop)

### Key Hooks

- **useBarcodeScanner**: Buffers keyboard input, fires callback on Enter when buffer ≥ 3 chars
- **useShortcuts**: Maps F1-F12 and Escape to PDV workflow actions

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F1 | Client selection |
| F2 | Save presale |
| F3 | Save quote |
| F4 | Checkout/Payment |
| F6 | Saved sales |
| F7 | Apply discount |
| F8 | Clear cart |
| Escape | Close modals |

### Theming

CSS variables for Material You design system. Theme colors updated dynamically from layout config. Variables include `--md-primary`, `--md-surface`, etc.

## Key Design Decisions

1. **Offline-First**: Sales queued locally, synced when online via SyncWorker
2. **Secure IPC**: Context bridge whitelist, no nodeIntegration in renderer
3. **Tax Duality**: Supports both legacy Brazilian tax system and 2026 reform
4. **Raw Printing**: Uses Linux `lp` command; Windows would need adjustment
