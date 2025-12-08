import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Printer, Download, Calendar, User, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Button, Card } from './Core';
import { generateCashReport, generatePDFHTML } from '../services/cashReportGenerator';

interface CaixaFechamento {
    id: string;
    caixa_id: string;
    valor_inicial: number;
    total_vendas: number;
    total_sangrias: number;
    total_suprimentos: number;
    valor_esperado: number;
    valor_contado: number;
    diferenca: number;
    observacoes: string | null;
    created_at: string;
    operador?: string;
    numero?: string;
}

interface CashReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CashReportDialog: React.FC<CashReportDialogProps> = ({
    isOpen,
    onClose
}) => {
    const [historico, setHistorico] = useState<CaixaFechamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<CaixaFechamento | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Load history when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setSelectedReport(null);
            window.api.getHistoricoCaixa().then(res => {
                if (res.success && res.historico) {
                    setHistorico(res.historico);
                }
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2)}`;
    };

    const handlePrint = async (report: CaixaFechamento) => {
        setIsPrinting(true);
        try {
            const config = await window.api.getPrinterConfig();
            const reportData = {
                valorInicial: report.valor_inicial,
                totalVendas: report.total_vendas,
                totalSangrias: report.total_sangrias,
                totalSuprimentos: report.total_suprimentos,
                valorEsperado: report.valor_esperado,
                valorContado: report.valor_contado,
                diferenca: report.diferenca,
                observacoes: report.observacoes || undefined,
                caixa: {
                    id: report.caixa_id,
                    numero: report.numero || '001',
                    operador: report.operador || null,
                    data_abertura: report.created_at,
                    data_fechamento: report.created_at
                }
            };

            const content = generateCashReport(reportData, config);

            if (config && config.printerName) {
                await window.api.printData({
                    content,
                    type: config.type,
                    printerName: config.printerName
                });
            } else {
                // If no printer configured, print via browser
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.print();
                }
            }
        } catch (e) {
            console.error('Print error:', e);
        } finally {
            setIsPrinting(false);
        }
    };

    const handleExportPDF = async (report: CaixaFechamento) => {
        setIsExporting(true);
        try {
            const reportData = {
                valorInicial: report.valor_inicial,
                totalVendas: report.total_vendas,
                totalSangrias: report.total_sangrias,
                totalSuprimentos: report.total_suprimentos,
                valorEsperado: report.valor_esperado,
                valorContado: report.valor_contado,
                diferenca: report.diferenca,
                observacoes: report.observacoes || undefined,
                caixa: {
                    id: report.caixa_id,
                    numero: report.numero || '001',
                    operador: report.operador || null,
                    data_abertura: report.created_at,
                    data_fechamento: report.created_at
                }
            };

            const html = generatePDFHTML(reportData, report.numero || '001');
            const timestamp = new Date(report.created_at).toISOString().slice(0, 10);
            const filename = `fechamento-caixa-${timestamp}.pdf`;

            await window.api.generatePDF({ html, filename });
        } catch (e) {
            console.error('Export error:', e);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 400,
                        }}
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 401,
                            pointerEvents: 'none',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                width: '90%',
                                maxWidth: 700,
                                background: 'var(--md-surface)',
                                borderRadius: 'var(--shape-corner-extra-large)',
                                boxShadow: 'var(--elevation-3)',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '85vh',
                                pointerEvents: 'auto',
                            }}
                        >
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, color: 'var(--md-on-surface)' }}>
                                    Relatórios de Caixa
                                </h2>
                                <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
                                    Histórico de fechamentos
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--md-on-surface)',
                                    padding: 8,
                                    borderRadius: '50%',
                                    display: 'flex'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--md-on-surface-variant)' }}>
                                    Carregando histórico...
                                </div>
                            ) : historico.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <FileText size={48} style={{ color: 'var(--md-outline)', marginBottom: 16 }} />
                                    <div style={{ color: 'var(--md-on-surface-variant)' }}>
                                        Nenhum fechamento registrado ainda.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {historico.map(report => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            isSelected={selectedReport?.id === report.id}
                                            onSelect={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                                            onPrint={() => handlePrint(report)}
                                            onExport={() => handleExportPDF(report)}
                                            isPrinting={isPrinting}
                                            isExporting={isExporting}
                                            formatDate={formatDate}
                                            formatTime={formatTime}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Button variant="filled" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

interface ReportCardProps {
    report: CaixaFechamento;
    isSelected: boolean;
    onSelect: () => void;
    onPrint: () => void;
    onExport: () => void;
    isPrinting: boolean;
    isExporting: boolean;
    formatDate: (d: string) => string;
    formatTime: (d: string) => string;
    formatCurrency: (v: number) => string;
}

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    isSelected,
    onSelect,
    onPrint,
    onExport,
    isPrinting,
    isExporting,
    formatDate,
    formatTime,
    formatCurrency
}) => {
    const hasDiferenca = report.diferenca !== 0;

    return (
        <Card
            variant="outlined"
            style={{
                padding: 0,
                overflow: 'hidden',
                borderColor: isSelected ? 'var(--md-primary)' : undefined,
                transition: 'border-color 0.2s'
            }}
        >
            {/* Header */}
            <motion.div
                whileHover={{ backgroundColor: 'var(--md-surface-container-low)' }}
                onClick={onSelect}
                style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--shape-corner-medium)',
                        background: 'var(--md-primary-container)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--md-on-primary-container)'
                    }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                            {formatDate(report.created_at)}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{formatTime(report.created_at)}</span>
                            {report.operador && (
                                <>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <User size={12} /> {report.operador}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--md-primary)' }}>
                            {formatCurrency(report.valor_contado)}
                        </div>
                        {hasDiferenca && (
                            <div style={{
                                fontSize: 12,
                                color: report.diferenca < 0 ? 'var(--md-error)' : 'var(--accent-success)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                justifyContent: 'flex-end'
                            }}>
                                {report.diferenca < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                {report.diferenca < 0 ? 'Falta' : 'Sobra'} {formatCurrency(Math.abs(report.diferenca))}
                            </div>
                        )}
                    </div>
                    <Eye
                        size={20}
                        style={{
                            color: 'var(--md-on-surface-variant)',
                            transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }}
                    />
                </div>
            </motion.div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid var(--md-outline-variant)',
                            background: 'var(--md-surface-container-low)'
                        }}>
                            {/* Summary Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 12,
                                marginBottom: 16
                            }}>
                                <SummaryItem label="Valor Inicial" value={formatCurrency(report.valor_inicial)} />
                                <SummaryItem label="Total Vendas" value={formatCurrency(report.total_vendas)} color="var(--accent-success)" />
                                <SummaryItem label="Total Sangrias" value={formatCurrency(report.total_sangrias)} color="var(--md-error)" />
                                <SummaryItem label="Total Suprimentos" value={formatCurrency(report.total_suprimentos)} color="var(--md-primary)" />
                            </div>

                            <div style={{
                                padding: '12px',
                                background: 'var(--md-surface)',
                                borderRadius: 'var(--shape-corner-medium)',
                                marginBottom: 16
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--md-on-surface-variant)' }}>Valor Esperado:</span>
                                    <span style={{ fontWeight: 500 }}>{formatCurrency(report.valor_esperado)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--md-on-surface-variant)' }}>Valor Contado:</span>
                                    <span style={{ fontWeight: 500 }}>{formatCurrency(report.valor_contado)}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 8,
                                    borderTop: '1px solid var(--md-outline-variant)'
                                }}>
                                    <span style={{ fontWeight: 500 }}>Diferença:</span>
                                    <span style={{
                                        fontWeight: 600,
                                        color: report.diferenca === 0 ? 'var(--accent-success)' : report.diferenca < 0 ? 'var(--md-error)' : 'var(--accent-success)'
                                    }}>
                                        {report.diferenca === 0 ? 'R$ 0,00 (OK)' : `${report.diferenca < 0 ? '-' : '+'}${formatCurrency(Math.abs(report.diferenca))}`}
                                    </span>
                                </div>
                            </div>

                            {report.observacoes && (
                                <div style={{
                                    padding: '12px',
                                    background: 'var(--md-surface)',
                                    borderRadius: 'var(--shape-corner-medium)',
                                    marginBottom: 16,
                                    fontSize: 13,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    <strong>Observações:</strong> {report.observacoes}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="tonal"
                                    onClick={(e) => { e.stopPropagation(); onPrint(); }}
                                    disabled={isPrinting}
                                >
                                    <Printer size={16} style={{ marginRight: 8 }} />
                                    {isPrinting ? 'Imprimindo...' : 'Imprimir'}
                                </Button>
                                <Button
                                    variant="tonal"
                                    onClick={(e) => { e.stopPropagation(); onExport(); }}
                                    disabled={isExporting}
                                >
                                    <Download size={16} style={{ marginRight: 8 }} />
                                    {isExporting ? 'Exportando...' : 'Exportar PDF'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

interface SummaryItemProps {
    label: string;
    value: string;
    color?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, color }) => (
    <div style={{
        padding: '10px 12px',
        background: 'var(--md-surface)',
        borderRadius: 'var(--shape-corner-small)'
    }}>
        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginBottom: 2 }}>
            {label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: color || 'var(--md-on-surface)' }}>
            {value}
        </div>
    </div>
);
