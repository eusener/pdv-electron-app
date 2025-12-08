import { PrinterConfig } from '../components/SettingsDialog';

export const generateReceipt = (saleData: any, config: PrinterConfig): string => {
    if (config.type === 'html') {
        const date = new Date(saleData.date).toLocaleString('pt-BR');
        return `
            <html>
                <head>
                    <style>
                        body { font-family: monospace; padding: 20px; width: ${config.width || '80mm'}; margin: 0; }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
                        .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; display: flex; justify-content: space-between; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>NIMBUS PDV</h2>
                        <p>PDV: ${config.pdvNumber}</p>
                        <p>${date}</p>
                    </div>
                    <div>
                        ${saleData.items.map((item: any) => `
                            <div class="item">
                                <span>${item.qtd}x ${item.name}</span>
                                <span>R$ ${(item.price * item.qtd).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total">
                        <span>TOTAL</span>
                        <span>R$ ${saleData.total.toFixed(2)}</span>
                    </div>
                    <div class="footer">
                        Obrigado pela preferência!
                    </div>
                </body>
            </html>
        `;
    } else {
        // RAW GENERATION
        if (config.rawProtocol === 'zpl') {
            // Very Basic ZPL
            let zpl = `^XA^CI28
^FO50,50^A0N,50,50^ADN,36,20^FDNIMBUS PDV^FS
^FO50,100^A0N,30,30^FDPDV: ${config.pdvNumber}^FS
^FO50,140^A0N,30,30^FD${new Date(saleData.date).toLocaleString('pt-BR')}^FS
`;
            let y = 200;
            saleData.items.forEach((item: any) => {
                zpl += `^FO50,${y}^A0N,25,25^FD${item.qtd}x ${item.name}^FS
^FO400,${y}^A0N,25,25^FDR$ ${(item.price * item.qtd).toFixed(2)}^FS`;
                y += 40;
            });

            zpl += `^FO50,${y + 20}^A0N,40,40^FDTOTAL^FS
^FO350,${y + 20}^A0N,40,40^FDR$ ${saleData.total.toFixed(2)}^FS
^XZ`;
            return zpl;

        } else if (config.rawProtocol === 'escpos') {
            // Basic ESC/POS text representation (Not binary codes here for simplicity, or use specific hex commands if needed)
            // Usually libraries like 'escpos' handle buffering. 
            // We'll return plain text with newlines which generic drivers often interpret ok, 
            // OR hex strings if our print service supports it.
            // For now: Plain text layout.
            let text = `NIMBUS PDV\nPDV: ${config.pdvNumber}\n${new Date(saleData.date).toLocaleString('pt-BR')}\n`;
            text += `--------------------------------\n`;
            saleData.items.forEach((item: any) => {
                const line = `${item.qtd}x ${item.name}`.padEnd(20).substring(0, 20) + ` R$ ${(item.price * item.qtd).toFixed(2)}\n`;
                text += line;
            });
            text += `--------------------------------\n`;
            text += `TOTAL: R$ ${saleData.total.toFixed(2)}\n\n\n\n`; // Feed
            return text;
        } else {
            // Plain Text
            return `NIMBUS PDV\nTotal: ${saleData.total}\nItems: ${saleData.items.length}\n\n`;
        }
    }
};
