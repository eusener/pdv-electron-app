interface CashReportData {
    caixa?: {
        id: string;
        numero: string;
        operador: string | null;
        data_abertura: string;
        data_fechamento?: string;
    };
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalSuprimentos: number;
    valorEsperado: number;
    valorContado?: number;
    diferenca?: number;
    observacoes?: string;
    movimentos?: Array<{
        tipo: string;
        valor: number;
        motivo?: string;
        created_at: string;
    }>;
}

interface PrinterConfig {
    pdvNumber?: string;
    type?: 'html' | 'raw';
    rawProtocol?: 'escpos' | 'zpl' | 'text';
    width?: number;
}

export function generateCashReport(data: CashReportData, config?: PrinterConfig): string {
    const type = config?.type || 'html';
    const pdvNumber = config?.pdvNumber || '001';

    if (type === 'html') {
        return generateHTMLReport(data, pdvNumber);
    } else {
        const protocol = config?.rawProtocol || 'escpos';
        switch (protocol) {
            case 'zpl':
                return generateZPLReport(data, pdvNumber);
            case 'escpos':
            case 'text':
            default:
                return generateTextReport(data, pdvNumber);
        }
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr: string): string {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

function formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2)}`;
}

// =====================================================
// HTML Report
// =====================================================
function generateHTMLReport(data: CashReportData, pdvNumber: string): string {
    const now = new Date();
    const isFechamento = data.valorContado !== undefined;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 5mm;
            color: #000;
        }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .header h1 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .header p { font-size: 11px; }
        .section { margin: 10px 0; }
        .section-title { font-weight: bold; font-size: 13px; margin-bottom: 5px; border-bottom: 1px solid #ccc; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .row.total { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; }
        .row.highlight { background: #f0f0f0; padding: 5px; margin: 5px -5px; }
        .diferenca-falta { color: #c00; }
        .diferenca-sobra { color: #0a0; }
        .movimentos { font-size: 11px; }
        .movimento-item { padding: 3px 0; border-bottom: 1px dotted #ccc; }
        .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${isFechamento ? 'FECHAMENTO DE CAIXA' : 'RESUMO DE CAIXA'}</h1>
        <p>PDV: ${pdvNumber}</p>
        <p>${formatDateTime(now.toISOString())}</p>
        ${data.caixa?.operador ? `<p>Operador: ${data.caixa.operador}</p>` : ''}
    </div>

    ${data.caixa ? `
    <div class="section">
        <div class="section-title">PERIODO</div>
        <div class="row">
            <span>Abertura:</span>
            <span>${formatDateTime(data.caixa.data_abertura)}</span>
        </div>
        ${data.caixa.data_fechamento ? `
        <div class="row">
            <span>Fechamento:</span>
            <span>${formatDateTime(data.caixa.data_fechamento)}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">MOVIMENTACAO</div>
        <div class="row">
            <span>Valor Inicial:</span>
            <span>${formatCurrency(data.valorInicial)}</span>
        </div>
        <div class="row">
            <span>(+) Vendas:</span>
            <span>${formatCurrency(data.totalVendas)}</span>
        </div>
        <div class="row">
            <span>(+) Suprimentos:</span>
            <span>${formatCurrency(data.totalSuprimentos)}</span>
        </div>
        <div class="row">
            <span>(-) Sangrias:</span>
            <span>${formatCurrency(data.totalSangrias)}</span>
        </div>
        <div class="row total">
            <span>VALOR ESPERADO:</span>
            <span>${formatCurrency(data.valorEsperado)}</span>
        </div>
    </div>

    ${isFechamento ? `
    <div class="section">
        <div class="section-title">CONFERENCIA</div>
        <div class="row highlight">
            <span>Valor Contado:</span>
            <span>${formatCurrency(data.valorContado!)}</span>
        </div>
        ${data.diferenca !== 0 ? `
        <div class="row ${data.diferenca! < 0 ? 'diferenca-falta' : 'diferenca-sobra'}">
            <span>${data.diferenca! < 0 ? 'FALTA:' : 'SOBRA:'}</span>
            <span>${formatCurrency(Math.abs(data.diferenca!))}</span>
        </div>
        ` : `
        <div class="row">
            <span>Diferenca:</span>
            <span>R$ 0,00 (OK)</span>
        </div>
        `}
    </div>
    ` : ''}

    ${data.observacoes ? `
    <div class="section">
        <div class="section-title">OBSERVACOES</div>
        <p style="font-size: 11px; line-height: 1.4;">${data.observacoes}</p>
    </div>
    ` : ''}

    ${data.movimentos && data.movimentos.length > 0 ? `
    <div class="section movimentos">
        <div class="section-title">DETALHAMENTO</div>
        ${data.movimentos.map(m => `
        <div class="movimento-item">
            <div class="row">
                <span>${m.tipo}</span>
                <span>${formatCurrency(m.valor)}</span>
            </div>
            <div style="font-size: 10px; color: #666;">
                ${formatTime(m.created_at)}${m.motivo ? ` - ${m.motivo}` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <p>*** DOCUMENTO NAO FISCAL ***</p>
        <p>Impresso em ${formatDateTime(now.toISOString())}</p>
    </div>
</body>
</html>
    `.trim();
}

// =====================================================
// ESC/POS Text Report
// =====================================================
function generateTextReport(data: CashReportData, pdvNumber: string): string {
    const now = new Date();
    const isFechamento = data.valorContado !== undefined;
    const width = 48;

    const center = (text: string) => {
        const pad = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(pad) + text;
    };

    const line = (left: string, right: string) => {
        const space = width - left.length - right.length;
        return left + ' '.repeat(Math.max(1, space)) + right;
    };

    const separator = '-'.repeat(width);
    const doubleSeparator = '='.repeat(width);

    let report = '';

    // Header
    report += center(isFechamento ? 'FECHAMENTO DE CAIXA' : 'RESUMO DE CAIXA') + '\n';
    report += center(`PDV: ${pdvNumber}`) + '\n';
    report += center(formatDateTime(now.toISOString())) + '\n';
    if (data.caixa?.operador) {
        report += center(`Operador: ${data.caixa.operador}`) + '\n';
    }
    report += separator + '\n';

    // Period
    if (data.caixa) {
        report += 'PERIODO\n';
        report += line('Abertura:', formatDateTime(data.caixa.data_abertura)) + '\n';
        if (data.caixa.data_fechamento) {
            report += line('Fechamento:', formatDateTime(data.caixa.data_fechamento)) + '\n';
        }
        report += separator + '\n';
    }

    // Movement
    report += 'MOVIMENTACAO\n';
    report += line('Valor Inicial:', formatCurrency(data.valorInicial)) + '\n';
    report += line('(+) Vendas:', formatCurrency(data.totalVendas)) + '\n';
    report += line('(+) Suprimentos:', formatCurrency(data.totalSuprimentos)) + '\n';
    report += line('(-) Sangrias:', formatCurrency(data.totalSangrias)) + '\n';
    report += doubleSeparator + '\n';
    report += line('VALOR ESPERADO:', formatCurrency(data.valorEsperado)) + '\n';
    report += separator + '\n';

    // Closing
    if (isFechamento) {
        report += 'CONFERENCIA\n';
        report += line('Valor Contado:', formatCurrency(data.valorContado!)) + '\n';
        if (data.diferenca !== 0) {
            const label = data.diferenca! < 0 ? 'FALTA:' : 'SOBRA:';
            report += line(label, formatCurrency(Math.abs(data.diferenca!))) + '\n';
        } else {
            report += line('Diferenca:', 'R$ 0,00 (OK)') + '\n';
        }
        report += separator + '\n';
    }

    // Observations
    if (data.observacoes) {
        report += 'OBSERVACOES\n';
        report += data.observacoes + '\n';
        report += separator + '\n';
    }

    // Footer
    report += '\n';
    report += center('*** DOCUMENTO NAO FISCAL ***') + '\n';
    report += center(`Impresso em ${formatDateTime(now.toISOString())}`) + '\n';
    report += '\n\n\n';

    return report;
}

// =====================================================
// ZPL Report (Zebra)
// =====================================================
function generateZPLReport(data: CashReportData, pdvNumber: string): string {
    const now = new Date();
    const isFechamento = data.valorContado !== undefined;

    let y = 50;
    const lineHeight = 30;
    let zpl = '^XA\n';

    const addLine = (text: string, x = 50, fontSize = 25) => {
        zpl += `^FO${x},${y}^A0N,${fontSize},${fontSize}^FD${text}^FS\n`;
        y += lineHeight;
    };

    const addCenteredLine = (text: string, fontSize = 25) => {
        zpl += `^FO50,${y}^A0N,${fontSize},${fontSize}^FB350,1,0,C^FD${text}^FS\n`;
        y += lineHeight;
    };

    // Header
    addCenteredLine(isFechamento ? 'FECHAMENTO DE CAIXA' : 'RESUMO DE CAIXA', 30);
    addCenteredLine(`PDV: ${pdvNumber}`);
    addCenteredLine(formatDateTime(now.toISOString()));
    if (data.caixa?.operador) {
        addCenteredLine(`Operador: ${data.caixa.operador}`);
    }

    y += 10;
    zpl += `^FO50,${y}^GB350,1,1^FS\n`;
    y += 20;

    // Movement
    addLine('MOVIMENTACAO', 50, 22);
    addLine(`Valor Inicial: ${formatCurrency(data.valorInicial)}`);
    addLine(`(+) Vendas: ${formatCurrency(data.totalVendas)}`);
    addLine(`(+) Suprimentos: ${formatCurrency(data.totalSuprimentos)}`);
    addLine(`(-) Sangrias: ${formatCurrency(data.totalSangrias)}`);

    y += 10;
    zpl += `^FO50,${y}^GB350,2,2^FS\n`;
    y += 20;

    addLine(`ESPERADO: ${formatCurrency(data.valorEsperado)}`, 50, 28);

    // Closing
    if (isFechamento) {
        y += 10;
        zpl += `^FO50,${y}^GB350,1,1^FS\n`;
        y += 20;

        addLine('CONFERENCIA', 50, 22);
        addLine(`Contado: ${formatCurrency(data.valorContado!)}`);
        if (data.diferenca !== 0) {
            const label = data.diferenca! < 0 ? 'FALTA' : 'SOBRA';
            addLine(`${label}: ${formatCurrency(Math.abs(data.diferenca!))}`);
        }
    }

    // Footer
    y += 20;
    addCenteredLine('*** NAO FISCAL ***', 20);

    zpl += '^XZ\n';
    return zpl;
}

// =====================================================
// HTML for PDF Export (better formatted)
// =====================================================
export function generatePDFHTML(data: CashReportData, pdvNumber: string = '001'): string {
    const now = new Date();
    const isFechamento = data.valorContado !== undefined;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12pt;
            color: #333;
            padding: 20mm;
            max-width: 210mm;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
        }
        .header p { font-size: 10pt; color: #666; margin: 3px 0; }
        .section {
            margin: 15px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .section-title {
            font-weight: bold;
            font-size: 11pt;
            color: #555;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .row:last-child { border-bottom: none; }
        .row.total {
            font-weight: bold;
            font-size: 14pt;
            background: #e8e8e8;
            margin: 10px -15px -15px;
            padding: 15px;
            border-radius: 0 0 5px 5px;
        }
        .row.highlight {
            background: #fff3cd;
            margin: 0 -15px;
            padding: 12px 15px;
        }
        .diferenca-falta { color: #dc3545; }
        .diferenca-sobra { color: #28a745; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            color: #999;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${isFechamento ? 'RELATÓRIO DE FECHAMENTO DE CAIXA' : 'RELATÓRIO DE CAIXA'}</h1>
        <p>PDV: ${pdvNumber} | Data: ${formatDateTime(now.toISOString())}</p>
        ${data.caixa?.operador ? `<p>Operador: ${data.caixa.operador}</p>` : ''}
    </div>

    ${data.caixa ? `
    <div class="section">
        <div class="section-title">Período</div>
        <div class="row">
            <span>Abertura:</span>
            <span>${formatDateTime(data.caixa.data_abertura)}</span>
        </div>
        ${data.caixa.data_fechamento ? `
        <div class="row">
            <span>Fechamento:</span>
            <span>${formatDateTime(data.caixa.data_fechamento)}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Movimentação Financeira</div>
        <div class="row">
            <span>Valor Inicial:</span>
            <span>${formatCurrency(data.valorInicial)}</span>
        </div>
        <div class="row">
            <span>(+) Total de Vendas:</span>
            <span style="color: #28a745;">${formatCurrency(data.totalVendas)}</span>
        </div>
        <div class="row">
            <span>(+) Total de Suprimentos:</span>
            <span style="color: #007bff;">${formatCurrency(data.totalSuprimentos)}</span>
        </div>
        <div class="row">
            <span>(-) Total de Sangrias:</span>
            <span style="color: #dc3545;">${formatCurrency(data.totalSangrias)}</span>
        </div>
        <div class="row total">
            <span>VALOR ESPERADO EM CAIXA:</span>
            <span>${formatCurrency(data.valorEsperado)}</span>
        </div>
    </div>

    ${isFechamento ? `
    <div class="section">
        <div class="section-title">Conferência de Fechamento</div>
        <div class="row highlight">
            <span><strong>Valor Contado:</strong></span>
            <span><strong>${formatCurrency(data.valorContado!)}</strong></span>
        </div>
        <div class="row ${data.diferenca! < 0 ? 'diferenca-falta' : data.diferenca! > 0 ? 'diferenca-sobra' : ''}">
            <span><strong>Diferença:</strong></span>
            <span><strong>${data.diferenca === 0 ? 'R$ 0,00 (Conferido)' : `${data.diferenca! < 0 ? 'FALTA' : 'SOBRA'} ${formatCurrency(Math.abs(data.diferenca!))}`}</strong></span>
        </div>
    </div>
    ` : ''}

    ${data.observacoes ? `
    <div class="section">
        <div class="section-title">Observações</div>
        <p style="line-height: 1.6;">${data.observacoes}</p>
    </div>
    ` : ''}

    ${data.movimentos && data.movimentos.length > 0 ? `
    <div class="section">
        <div class="section-title">Detalhamento de Movimentos</div>
        <table>
            <thead>
                <tr>
                    <th>Horário</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th style="text-align: right;">Valor</th>
                </tr>
            </thead>
            <tbody>
                ${data.movimentos.map(m => `
                <tr>
                    <td>${formatTime(m.created_at)}</td>
                    <td>${m.tipo}</td>
                    <td>${m.motivo || '-'}</td>
                    <td style="text-align: right;">${formatCurrency(m.valor)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="footer">
        <p>Documento gerado automaticamente pelo sistema PDV</p>
        <p>Este documento não possui valor fiscal</p>
        <p>Gerado em: ${formatDateTime(now.toISOString())}</p>
    </div>
</body>
</html>
    `.trim();
}
