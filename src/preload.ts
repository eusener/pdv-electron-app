// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    saveSale: (saleData: any) => ipcRenderer.invoke('save-sale', saleData),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printData: (options: any) => ipcRenderer.invoke('print-data', options),
    getPrinterConfig: () => ipcRenderer.invoke('get-printer-config'),
    savePrinterConfig: (config: any) => ipcRenderer.invoke('save-printer-config', config),

    // Gestão de Caixa
    getCaixaAtual: () => ipcRenderer.invoke('get-caixa-atual'),
    abrirCaixa: (data: any) => ipcRenderer.invoke('abrir-caixa', data),
    registrarMovimento: (data: any) => ipcRenderer.invoke('registrar-movimento', data),
    getResumoCaixa: (caixaId: string) => ipcRenderer.invoke('get-resumo-caixa', caixaId),
    fecharCaixa: (data: any) => ipcRenderer.invoke('fechar-caixa', data),
    getHistoricoCaixa: () => ipcRenderer.invoke('get-historico-caixa'),
    getMovimentosCaixa: (caixaId: string) => ipcRenderer.invoke('get-movimentos-caixa', caixaId),

    // PDF Generation
    generatePDF: (options: { html: string; filename?: string }) => ipcRenderer.invoke('generate-pdf', options),

    // Fiscal Configuration
    getFiscalConfig: () => ipcRenderer.invoke('get-fiscal-config'),
    saveFiscalConfig: (config: any) => ipcRenderer.invoke('save-fiscal-config', config),

    // Notas Fiscais Pendentes
    getNotasPendentes: () => ipcRenderer.invoke('get-notas-pendentes'),
    salvarNotaPendente: (nota: any) => ipcRenderer.invoke('salvar-nota-pendente', nota),
    removerNotaPendente: (id: string) => ipcRenderer.invoke('remover-nota-pendente', id),
    emitirNotasPendentes: (ids: string[]) => ipcRenderer.invoke('emitir-notas-pendentes', ids),
});
