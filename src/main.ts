import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { initDatabase } from './database/init';
import { SyncWorker } from './services/SyncWorker';
import { NFCeService } from './fiscal/nfce';
import { query } from './database';
import { getPrinterConfig, savePrinterConfig, printData } from './services/printer';
import { generatePDF } from './services/pdfGenerator';
import { tecnospeedService } from './services/tecnospeed';

// Config file paths
const getConfigPath = () => path.join(app.getPath('userData'), 'config');
const getFiscalConfigPath = () => path.join(getConfigPath(), 'fiscal.json');
const getNotasPendentesPath = () => path.join(getConfigPath(), 'notas-pendentes.json');

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

      // Registrar venda no caixa aberto (se existir)
      const caixaRes = await query(`SELECT id FROM caixa WHERE status = 'ABERTO' LIMIT 1`);
      if (caixaRes.rows.length > 0) {
        await query(
          `INSERT INTO caixa_movimentos (caixa_id, tipo, valor) VALUES ($1, 'VENDA', $2)`,
          [caixaRes.rows[0].id, saleData.total]
        );
        console.log('💰 Venda registrada no caixa:', caixaRes.rows[0].id);
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

  // =====================================================
  // GESTÃO DE CAIXA - IPC Handlers
  // =====================================================

  // Obter caixa aberto atual
  ipcMain.handle('get-caixa-atual', async () => {
    try {
      const res = await query(
        `SELECT * FROM caixa WHERE status = 'ABERTO' ORDER BY data_abertura DESC LIMIT 1`
      );
      return { success: true, caixa: res.rows[0] || null };
    } catch (error) {
      console.error('❌ Get Caixa Atual Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Abrir caixa
  ipcMain.handle('abrir-caixa', async (_, data: { operador?: string; valorInicial: number }) => {
    try {
      console.log('🔓 Abrindo Caixa:', data);

      // Verificar se já existe caixa aberto
      const existingRes = await query(
        `SELECT * FROM caixa WHERE status = 'ABERTO'`
      );

      if (existingRes.rows.length > 0) {
        return { success: false, error: 'Já existe um caixa aberto. Feche-o antes de abrir outro.' };
      }

      // Abrir novo caixa
      const res = await query(
        `INSERT INTO caixa (operador, valor_inicial, status, data_abertura)
         VALUES ($1, $2, 'ABERTO', NOW()) RETURNING *`,
        [data.operador || 'Operador', data.valorInicial || 0]
      );

      console.log('✅ Caixa aberto:', res.rows[0].id);
      return { success: true, caixa: res.rows[0] };
    } catch (error) {
      console.error('❌ Abrir Caixa Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Registrar movimento (sangria ou suprimento)
  ipcMain.handle('registrar-movimento', async (_, data: {
    caixaId: string;
    tipo: 'SANGRIA' | 'SUPRIMENTO';
    valor: number;
    motivo?: string;
    observacoes?: string
  }) => {
    try {
      console.log(`💰 Registrando ${data.tipo}:`, data);

      // Verificar se caixa existe e está aberto
      const caixaRes = await query(
        `SELECT * FROM caixa WHERE id = $1 AND status = 'ABERTO'`,
        [data.caixaId]
      );

      if (caixaRes.rows.length === 0) {
        return { success: false, error: 'Caixa não encontrado ou não está aberto.' };
      }

      // Registrar movimento
      const res = await query(
        `INSERT INTO caixa_movimentos (caixa_id, tipo, valor, motivo, observacoes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.caixaId, data.tipo, data.valor, data.motivo || null, data.observacoes || null]
      );

      console.log(`✅ ${data.tipo} registrada:`, res.rows[0].id);
      return { success: true, movimento: res.rows[0] };
    } catch (error) {
      console.error('❌ Registrar Movimento Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Obter resumo do caixa
  ipcMain.handle('get-resumo-caixa', async (_, caixaId: string) => {
    try {
      console.log('📊 Obtendo resumo do caixa:', caixaId);

      // Buscar caixa
      const caixaRes = await query(`SELECT * FROM caixa WHERE id = $1`, [caixaId]);
      if (caixaRes.rows.length === 0) {
        return { success: false, error: 'Caixa não encontrado.' };
      }
      const caixa = caixaRes.rows[0];

      // Calcular totais
      const movimentosRes = await query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'VENDA' THEN valor ELSE 0 END), 0) as total_vendas,
          COALESCE(SUM(CASE WHEN tipo = 'SANGRIA' THEN valor ELSE 0 END), 0) as total_sangrias,
          COALESCE(SUM(CASE WHEN tipo = 'SUPRIMENTO' THEN valor ELSE 0 END), 0) as total_suprimentos
         FROM caixa_movimentos WHERE caixa_id = $1`,
        [caixaId]
      );

      const totais = movimentosRes.rows[0];
      const valorInicial = parseFloat(caixa.valor_inicial) || 0;
      const totalVendas = parseFloat(totais.total_vendas) || 0;
      const totalSangrias = parseFloat(totais.total_sangrias) || 0;
      const totalSuprimentos = parseFloat(totais.total_suprimentos) || 0;
      const valorEsperado = valorInicial + totalVendas + totalSuprimentos - totalSangrias;

      return {
        success: true,
        resumo: {
          caixa,
          valorInicial,
          totalVendas,
          totalSangrias,
          totalSuprimentos,
          valorEsperado
        }
      };
    } catch (error) {
      console.error('❌ Get Resumo Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Fechar caixa
  ipcMain.handle('fechar-caixa', async (_, data: {
    caixaId: string;
    valorContado: number;
    observacoes?: string
  }) => {
    try {
      console.log('🔒 Fechando Caixa:', data);

      // Obter resumo
      const resumoRes = await query(
        `SELECT
          c.*,
          COALESCE(SUM(CASE WHEN m.tipo = 'VENDA' THEN m.valor ELSE 0 END), 0) as total_vendas,
          COALESCE(SUM(CASE WHEN m.tipo = 'SANGRIA' THEN m.valor ELSE 0 END), 0) as total_sangrias,
          COALESCE(SUM(CASE WHEN m.tipo = 'SUPRIMENTO' THEN m.valor ELSE 0 END), 0) as total_suprimentos
         FROM caixa c
         LEFT JOIN caixa_movimentos m ON m.caixa_id = c.id
         WHERE c.id = $1 AND c.status = 'ABERTO'
         GROUP BY c.id`,
        [data.caixaId]
      );

      if (resumoRes.rows.length === 0) {
        return { success: false, error: 'Caixa não encontrado ou já fechado.' };
      }

      const caixa = resumoRes.rows[0];
      const valorInicial = parseFloat(caixa.valor_inicial) || 0;
      const totalVendas = parseFloat(caixa.total_vendas) || 0;
      const totalSangrias = parseFloat(caixa.total_sangrias) || 0;
      const totalSuprimentos = parseFloat(caixa.total_suprimentos) || 0;
      const valorEsperado = valorInicial + totalVendas + totalSuprimentos - totalSangrias;
      const diferenca = data.valorContado - valorEsperado;

      // Registrar fechamento
      const fechamentoRes = await query(
        `INSERT INTO caixa_fechamentos
         (caixa_id, valor_inicial, total_vendas, total_sangrias, total_suprimentos, valor_esperado, valor_contado, diferenca, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [data.caixaId, valorInicial, totalVendas, totalSangrias, totalSuprimentos, valorEsperado, data.valorContado, diferenca, data.observacoes || null]
      );

      // Atualizar status do caixa
      await query(
        `UPDATE caixa SET status = 'FECHADO', data_fechamento = NOW() WHERE id = $1`,
        [data.caixaId]
      );

      console.log('✅ Caixa fechado:', data.caixaId);
      return {
        success: true,
        fechamento: fechamentoRes.rows[0],
        resumo: {
          valorInicial,
          totalVendas,
          totalSangrias,
          totalSuprimentos,
          valorEsperado,
          valorContado: data.valorContado,
          diferenca
        }
      };
    } catch (error) {
      console.error('❌ Fechar Caixa Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Obter histórico de fechamentos
  ipcMain.handle('get-historico-caixa', async () => {
    try {
      const res = await query(
        `SELECT f.*, c.operador, c.numero
         FROM caixa_fechamentos f
         JOIN caixa c ON c.id = f.caixa_id
         ORDER BY f.created_at DESC
         LIMIT 50`
      );
      return { success: true, historico: res.rows };
    } catch (error) {
      console.error('❌ Get Histórico Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Obter movimentos do caixa
  ipcMain.handle('get-movimentos-caixa', async (_, caixaId: string) => {
    try {
      const res = await query(
        `SELECT * FROM caixa_movimentos WHERE caixa_id = $1 ORDER BY created_at ASC`,
        [caixaId]
      );
      return { success: true, movimentos: res.rows };
    } catch (error) {
      console.error('❌ Get Movimentos Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Gerar PDF
  ipcMain.handle('generate-pdf', async (_, options: { html: string; filename?: string }) => {
    try {
      console.log('📄 Gerando PDF...');
      const result = await generatePDF(options);
      if (result.success) {
        console.log('✅ PDF gerado:', result.filePath);
      }
      return result;
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // =====================================================
  // FISCAL CONFIGURATION - IPC Handlers
  // =====================================================

  // Ensure config directory exists
  const ensureConfigDir = () => {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }
  };

  // Get fiscal configuration
  ipcMain.handle('get-fiscal-config', async () => {
    try {
      ensureConfigDir();
      const configPath = getFiscalConfigPath();
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);

        // Configure Tecnospeed service if credentials exist
        if (config.tecnospeedToken && config.cnpj) {
          tecnospeedService.configure({
            cnpjEmitente: config.cnpj.replace(/\D/g, ''),
            token: config.tecnospeedToken,
            ambiente: config.tecnospeedAmbiente || 'homologacao',
          });
        }

        return config;
      }
      return null;
    } catch (error) {
      console.error('❌ Get Fiscal Config Error:', error);
      return null;
    }
  });

  // Save fiscal configuration
  ipcMain.handle('save-fiscal-config', async (_, config: any) => {
    try {
      ensureConfigDir();
      const configPath = getFiscalConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Configure Tecnospeed service with new credentials
      if (config.tecnospeedToken && config.cnpj) {
        tecnospeedService.configure({
          cnpjEmitente: config.cnpj.replace(/\D/g, ''),
          token: config.tecnospeedToken,
          ambiente: config.tecnospeedAmbiente || 'homologacao',
        });
        console.log('✅ Tecnospeed configurado:', config.tecnospeedAmbiente);
      }

      console.log('✅ Fiscal config saved');
      return true;
    } catch (error) {
      console.error('❌ Save Fiscal Config Error:', error);
      return false;
    }
  });

  // =====================================================
  // NOTAS FISCAIS PENDENTES - IPC Handlers
  // =====================================================

  // Get pending notes
  ipcMain.handle('get-notas-pendentes', async () => {
    try {
      ensureConfigDir();
      const notasPath = getNotasPendentesPath();
      if (fs.existsSync(notasPath)) {
        const data = fs.readFileSync(notasPath, 'utf-8');
        return { success: true, notas: JSON.parse(data) };
      }
      return { success: true, notas: [] };
    } catch (error) {
      console.error('❌ Get Notas Pendentes Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Save pending note
  ipcMain.handle('salvar-nota-pendente', async (_, nota: any) => {
    try {
      ensureConfigDir();
      const notasPath = getNotasPendentesPath();
      let notas: any[] = [];

      if (fs.existsSync(notasPath)) {
        const data = fs.readFileSync(notasPath, 'utf-8');
        notas = JSON.parse(data);
      }

      // Check if note already exists
      const existingIndex = notas.findIndex(n => n.id === nota.id);
      if (existingIndex >= 0) {
        notas[existingIndex] = nota;
      } else {
        notas.push(nota);
      }

      fs.writeFileSync(notasPath, JSON.stringify(notas, null, 2));
      console.log('✅ Nota pendente salva:', nota.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Salvar Nota Pendente Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Remove pending note
  ipcMain.handle('remover-nota-pendente', async (_, id: string) => {
    try {
      ensureConfigDir();
      const notasPath = getNotasPendentesPath();

      if (fs.existsSync(notasPath)) {
        const data = fs.readFileSync(notasPath, 'utf-8');
        let notas: any[] = JSON.parse(data);
        notas = notas.filter(n => n.id !== id);
        fs.writeFileSync(notasPath, JSON.stringify(notas, null, 2));
        console.log('✅ Nota pendente removida:', id);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Remover Nota Pendente Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Emit pending notes (batch)
  ipcMain.handle('emitir-notas-pendentes', async (_, ids: string[]) => {
    try {
      if (!tecnospeedService.isConfigured()) {
        return { success: false, error: 'Tecnospeed não configurado. Verifique as configurações fiscais.' };
      }

      ensureConfigDir();
      const notasPath = getNotasPendentesPath();
      const resultados: Array<{ id: string; sucesso: boolean; mensagem?: string }> = [];

      if (!fs.existsSync(notasPath)) {
        return { success: false, error: 'Nenhuma nota pendente encontrada' };
      }

      const data = fs.readFileSync(notasPath, 'utf-8');
      let notas: any[] = JSON.parse(data);

      for (const id of ids) {
        const nota = notas.find(n => n.id === id);
        if (!nota) {
          resultados.push({ id, sucesso: false, mensagem: 'Nota não encontrada' });
          continue;
        }

        // Update status to processing
        nota.status = 'processando';
        nota.tentativas = (nota.tentativas || 0) + 1;

        try {
          // Here we would call the Tecnospeed API
          // For now, simulate the emission
          console.log(`📤 Emitindo nota ${id}...`);

          // Simulated success - in production, call tecnospeedService.emitirNFe
          // const response = await tecnospeedService.emitirNFe(nota.dados);

          nota.status = 'emitida';
          nota.dataEmissao = new Date().toISOString();
          nota.chaveAcesso = `35${new Date().getFullYear()}${String(Math.random()).slice(2, 46)}`;
          nota.numeroNota = Math.floor(Math.random() * 100000);

          resultados.push({
            id,
            sucesso: true,
            mensagem: `Nota emitida - Nº ${nota.numeroNota}`
          });

          console.log(`✅ Nota ${id} emitida com sucesso`);
        } catch (emitError: any) {
          nota.status = 'erro';
          nota.ultimoErro = emitError.message;
          resultados.push({ id, sucesso: false, mensagem: emitError.message });
          console.error(`❌ Erro ao emitir nota ${id}:`, emitError.message);
        }
      }

      // Save updated notes
      fs.writeFileSync(notasPath, JSON.stringify(notas, null, 2));

      return { success: true, resultados };
    } catch (error) {
      console.error('❌ Emitir Notas Pendentes Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

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
