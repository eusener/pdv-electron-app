import { BrowserWindow } from 'electron';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface PrinterConfig {
    pdvNumber: string;
    printerName: string;
    type: 'html' | 'raw';
    rawProtocol: 'zpl' | 'escpos' | 'text';
    width?: string;
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'printer-config.json');

export const getPrinterConfig = (): PrinterConfig => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to read printer config', error);
    }
    return {
        pdvNumber: '001',
        printerName: '',
        type: 'html',
        rawProtocol: 'text'
    };
};

export const savePrinterConfig = (config: PrinterConfig) => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Failed to save printer config', error);
        return false;
    }
};

export const getPrinters = async (win: BrowserWindow) => {
    return win.webContents.getPrintersAsync();
};

export const printData = async (win: BrowserWindow, options: { content: string; type?: 'html' | 'raw'; printerName?: string; copies?: number }): Promise<boolean> => {
    const config = getPrinterConfig();
    const printerName = options.printerName || config.printerName;
    const type = options.type || config.type;

    if (!printerName) {
        console.warn('No printer selected');
        return false;
    }

    if (type === 'raw') {
        // Raw printing via LP (Linux/Unix)
        // Note: Windows requires different handling (e.g. 'print /D:\\Server\Printer file') or dedicated lib.
        // Assuming Linux based on User Information.
        return new Promise((resolve) => {
            // Write content to temporary file
            const tempPath = path.join(app.getPath('temp'), `print_${Date.now()}.raw`);
            fs.writeFileSync(tempPath, options.content);

            const command = `lp -d "${printerName}" -o raw "${tempPath}"`;
            console.log('Executing raw print:', command);

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Raw print error:', error);
                    resolve(false);
                } else {
                    console.log('Raw print success:', stdout);
                    resolve(true);
                }
                // Cleanup
                try { fs.unlinkSync(tempPath); } catch { }
            });
        });
    } else {
        // HTML Printing via Electron
        return new Promise((resolve) => {
            // We usually print the current window or a hidden window.
            // If content is passed as HTML string, we might need a hidden window.
            // For simplicity, if content is meant to be printed, it should be rendered.
            // But here we likely receive formatted HTML string or we assume the current page?
            // "permitir que possa ser impresso direto na porta" implies backend handling.

            // If the content is an HTML string, we ideally create a hidden window to render it.
            // Creating windows is expensive. 
            // Alternative: Win.webContents.print() prints the CURRENT page.
            // If we want to print a receipt, we usually open a small window or use a hidden one.

            // Let's CREATE a lightweight hidden window for printing HTML content.
            const printWin = new BrowserWindow({ show: false, width: 800, height: 600 });
            printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(options.content));

            printWin.webContents.on('did-finish-load', () => {
                printWin.webContents.print({
                    deviceName: printerName,
                    silent: true,
                    printBackground: true,
                    copies: options.copies || 1
                }, (success, failureReason) => {
                    if (!success) console.error('Print failed:', failureReason);
                    printWin.close();
                    resolve(success);
                });
            });
        });
    }
};
