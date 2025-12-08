// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    saveSale: (saleData: any) => ipcRenderer.invoke('save-sale', saleData),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printData: (options: any) => ipcRenderer.invoke('print-data', options),
    getPrinterConfig: () => ipcRenderer.invoke('get-printer-config'),
    savePrinterConfig: (config: any) => ipcRenderer.invoke('save-printer-config', config),
});
