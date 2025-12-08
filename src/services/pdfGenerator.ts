import { BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';

interface PDFGenerateOptions {
    html: string;
    filename?: string;
    openAfterGenerate?: boolean;
}

export async function generatePDF(options: PDFGenerateOptions): Promise<{ success: boolean; filePath?: string; error?: string }> {
    const { html, filename, openAfterGenerate = true } = options;

    return new Promise((resolve) => {
        // Create hidden window for PDF rendering
        const win = new BrowserWindow({
            width: 800,
            height: 1200,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // Load HTML content
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on('did-finish-load', async () => {
            try {
                // Generate PDF
                const pdfBuffer = await win.webContents.printToPDF({
                    printBackground: true,
                    pageSize: 'A4',
                    margins: {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }
                });

                // Determine save path
                const documentsPath = app.getPath('documents');
                const pdvFolder = path.join(documentsPath, 'PDV-Relatorios');

                // Create folder if it doesn't exist
                if (!fs.existsSync(pdvFolder)) {
                    fs.mkdirSync(pdvFolder, { recursive: true });
                }

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const finalFilename = filename || `relatorio-caixa-${timestamp}.pdf`;
                const filePath = path.join(pdvFolder, finalFilename);

                // Save PDF
                fs.writeFileSync(filePath, pdfBuffer);

                // Open file if requested
                if (openAfterGenerate) {
                    const { shell } = require('electron');
                    shell.openPath(filePath);
                }

                win.close();
                resolve({ success: true, filePath });
            } catch (error) {
                win.close();
                console.error('PDF Generation Error:', error);
                resolve({ success: false, error: (error as Error).message });
            }
        });

        win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
            win.close();
            resolve({ success: false, error: errorDescription });
        });
    });
}
