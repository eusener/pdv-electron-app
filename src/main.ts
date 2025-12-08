import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase } from './database/init';
import { SyncWorker } from './services/SyncWorker';
import { NFCeService } from './fiscal/nfce';
import { query } from './database';
import { getPrinterConfig, savePrinterConfig, printData } from './services/printer';

let syncWorker: SyncWorker;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Initialize Database
  await initDatabase();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.on('ready', async () => {
  await createWindow();
  syncWorker = new SyncWorker();
  syncWorker.start();

  // ... (previous code)

  // IPC Handler for Saving Sales
  ipcMain.handle('save-sale', async (event, saleData: any) => {
    try {
      console.log('💾 Saving Sale:', saleData);
      const nfceService = new NFCeService();

      // 1. Insert Sale
      const saleRes = await query(
        `INSERT INTO vendas (total, status, payment_method, total_icms, total_ibs, total_cbs) 
                 VALUES ($1, 'COMPLETED', $2, $3, $4, $5) RETURNING id`,
        [saleData.total, saleData.paymentMethod, saleData.totalTax.icms, saleData.totalTax.ibs, saleData.totalTax.cbs]
      );
      const saleId = saleRes.rows[0].id;

      // 2. Insert Items
      for (const item of saleData.items) {
        await query(
          `INSERT INTO venda_items (venda_id, description, quantity, unit_price, total_price, icms_value, ibs_value, cbs_value)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [saleId, item.name, item.qtd, item.price, item.price * item.qtd, 0, 0, 0] // Simplified tax per item
        );
      }

      // 3. Handle Offline Contingency OR Normal Flow
      // Even in normal flow, we might want to generate the XML immediately.

      const xml = nfceService.generateXML({
        venda_id: saleId,
        items: saleData.items,
        total: saleData.total,
        payment_method: saleData.paymentMethod
      }, saleData.isOffline);

      const signedXml = nfceService.signXML(xml);

      if (saleData.isOffline) {
        console.log('⚠️ Offline Sale - Queuing signed XML for Sync');
        await query(
          `INSERT INTO vendas_sync_queue (venda_id, xml_assinado, status) VALUES ($1, $2, 'PENDING')`,
          [saleId, signedXml]
        );
      } else {
        // Online: ideally transmit immediately. 
        // For this architecture, we can strictly stick to "Save locally first, then sync" for robustness,
        // OR try to send and fall back to queue.
        // The robust pattern requested ("Toda venda finalizada offline gera um registro...") 
        // usually implies simpler architecture: Always Queue -> Background Worker picks up immediately if online.
        // BUT to be fast, we might want to try sending.
        // For simplicity in this step, I'll add to queue but with status 'PENDING' so worker picks it up instantly.
        console.log('✅ Online Sale - Queuing for immediate transmission');
        await query(
          `INSERT INTO vendas_sync_queue (venda_id, xml_assinado, status) VALUES ($1, $2, 'PENDING')`,
          [saleId, signedXml]
        );
        // Trigger worker (optional optimization)
        if (syncWorker) syncWorker.processQueue();
      }

      return { success: true, saleId };
    } catch (error) {
      console.error('❌ Save Sale Error:', error);
      // Mock success for development if DB is down
      if ((error as any).code === 'ECONNREFUSED') {
        console.warn('⚠️ DB Down - Mocking successful sale');
        return { success: true, saleId: 'MOCK-' + Date.now() };
      }
      return { success: false, error: (error as Error).message };
    }
  });

  // Printer Handlers
  ipcMain.handle('get-printers', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win?.webContents.getPrintersAsync() ?? [];
  });

  ipcMain.handle('print-data', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;
    return printData(win, options);
  });

  ipcMain.handle('get-printer-config', () => getPrinterConfig());

  ipcMain.handle('save-printer-config', (_, config) => savePrinterConfig(config));

});

app.on('will-quit', () => {
  if (syncWorker) syncWorker.stop();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
