export { };

declare global {
    interface Window {
        api: {
            saveSale: (saleData: any) => Promise<{ success: boolean; saleId?: string; error?: string }>;
            getPrinters: () => Promise<Electron.PrinterInfo[]>;
            printData: (options: { content: string; type?: 'html' | 'raw'; printerName?: string; copies?: number }) => Promise<boolean>;
            getPrinterConfig: () => Promise<any>;
            savePrinterConfig: (config: any) => Promise<boolean>;
        };
    }
}
