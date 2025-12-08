import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertTriangle, CheckCircle2, Printer, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button, Card } from './Core';

interface ResumoCaixa {
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalSuprimentos: number;
    valorEsperado: number;
}

interface CashCloseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    caixaId: string;
    onSuccess: (resumo: any) => void;
    onPrint: (resumo: any) => void;
    onExportPDF: (resumo: any) => void;
}

export const CashCloseDialog: React.FC<CashCloseDialogProps> = ({
    isOpen,
    onClose,
    caixaId,
    onSuccess,
    onPrint,
    onExportPDF
}) => {
    const [resumo, setResumo] = useState<ResumoCaixa | null>(null);
    const [valorContado, setValorContado] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fechamentoConcluido, setFechamentoConcluido] = useState(false);
    const [resumoFinal, setResumoFinal] = useState<any>(null);

    // Fetch summary when dialog opens
    useEffect(() => {
        if (isOpen && caixaId) {
            setIsFetching(true);
            setFechamentoConcluido(false);
            setResumoFinal(null);
            setValorContado('');
            setObservacoes('');
            setError(null);

            window.api.getResumoCaixa(caixaId).then(res => {
                if (res.success && res.resumo) {
                    setResumo({
                        valorInicial: res.resumo.valorInicial,
                        totalVendas: res.resumo.totalVendas,
                        totalSangrias: res.resumo.totalSangrias,
                        totalSuprimentos: res.resumo.totalSuprimentos,
                        valorEsperado: res.resumo.valorEsperado
                    });
                    setValorContado(res.resumo.valorEsperado.toFixed(2));
                } else {
                    setError(res.error || 'Erro ao carregar resumo');
                }
                setIsFetching(false);
            }).catch(err => {
                setError('Erro ao comunicar com o sistema');
                setIsFetching(false);
            });
        }
    }, [isOpen, caixaId]);

    const valorContadoNum = parseFloat(valorContado.replace(',', '.')) || 0;
    const diferenca = resumo ? valorContadoNum - resumo.valorEsperado : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resumo) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await window.api.fecharCaixa({
                caixaId,
                valorContado: valorContadoNum,
                observacoes: observacoes || undefined
            });

            if (response.success && response.resumo) {
                setResumoFinal(response.resumo);
                setFechamentoConcluido(true);
                onSuccess(response.resumo);
            } else {
                setError(response.error || 'Erro ao fechar caixa');
            }
        } catch (err) {
            setError('Erro ao comunicar com o sistema');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
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
                        onClick={handleClose}
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
                                maxWidth: 600,
                                background: 'var(--md-surface)',
                                borderRadius: 'var(--shape-corner-extra-large)',
                                boxShadow: 'var(--elevation-3)',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '90vh',
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
                                    {fechamentoConcluido ? 'Caixa Fechado' : 'Fechamento de Caixa'}
                                </h2>
                                <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
                                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    color: 'var(--md-on-surface)',
                                    padding: 8,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                            {isFetching ? (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--md-on-surface-variant)' }}>
                                    Carregando resumo...
                                </div>
                            ) : fechamentoConcluido && resumoFinal ? (
                                /* Success State */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            background: 'var(--accent-success)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            <CheckCircle2 size={32} color="white" />
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: 20, color: 'var(--md-on-surface)' }}>
                                            Fechamento Concluído!
                                        </h3>
                                    </div>

                                    <SummaryCard resumo={resumoFinal} />

                                    {/* Export Buttons */}
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                        <Button variant="tonal" onClick={() => onPrint(resumoFinal)}>
                                            <Printer size={18} style={{ marginRight: 8 }} />
                                            Imprimir
                                        </Button>
                                        <Button variant="tonal" onClick={() => onExportPDF(resumoFinal)}>
                                            <FileText size={18} style={{ marginRight: 8 }} />
                                            Exportar PDF
                                        </Button>
                                    </div>
                                </div>
                            ) : resumo ? (
                                /* Form State */
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {/* Summary */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 12
                                    }}>
                                        <SummaryItem
                                            icon={<DollarSign size={18} />}
                                            label="Valor Inicial"
                                            value={resumo.valorInicial}
                                            color="var(--md-on-surface)"
                                        />
                                        <SummaryItem
                                            icon={<TrendingUp size={18} />}
                                            label="Total Vendas"
                                            value={resumo.totalVendas}
                                            color="var(--accent-success)"
                                        />
                                        <SummaryItem
                                            icon={<TrendingDown size={18} />}
                                            label="Total Sangrias"
                                            value={resumo.totalSangrias}
                                            color="var(--md-error)"
                                            negative
                                        />
                                        <SummaryItem
                                            icon={<TrendingUp size={18} />}
                                            label="Total Suprimentos"
                                            value={resumo.totalSuprimentos}
                                            color="var(--md-primary)"
                                        />
                                    </div>

                                    {/* Expected Total */}
                                    <Card variant="filled" style={{
                                        padding: '16px 20px',
                                        background: 'var(--md-primary-container)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--md-on-primary-container)' }}>
                                                Valor Esperado em Caixa
                                            </span>
                                            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--md-on-primary-container)' }}>
                                                R$ {resumo.valorEsperado.toFixed(2)}
                                            </span>
                                        </div>
                                    </Card>

                                    {/* Counted Amount Input */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: 8,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: 'var(--md-on-surface-variant)'
                                        }}>
                                            Valor Contado em Caixa (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={valorContado}
                                            onChange={(e) => setValorContado(e.target.value)}
                                            placeholder="0,00"
                                            disabled={isLoading}
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                fontSize: 28,
                                                fontWeight: 500,
                                                borderRadius: 'var(--shape-corner-medium)',
                                                border: `1px solid ${diferenca !== 0 ? 'var(--md-error)' : 'var(--md-outline)'}`,
                                                background: 'var(--md-surface-container)',
                                                color: 'var(--md-on-surface)',
                                                outline: 'none',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </div>

                                    {/* Difference Alert */}
                                    {diferenca !== 0 && (
                                        <Card variant="outlined" style={{
                                            padding: '12px 16px',
                                            borderColor: diferenca < 0 ? 'var(--md-error)' : 'var(--accent-success)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                color: diferenca < 0 ? 'var(--md-error)' : 'var(--accent-success)'
                                            }}>
                                                <AlertTriangle size={20} />
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                                                        {diferenca < 0 ? 'FALTA' : 'SOBRA'} no caixa
                                                    </div>
                                                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                                                        R$ {Math.abs(diferenca).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Observations */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: 8,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: 'var(--md-on-surface-variant)'
                                        }}>
                                            Observações {diferenca !== 0 && '(explique a diferença)'}
                                        </label>
                                        <textarea
                                            value={observacoes}
                                            onChange={(e) => setObservacoes(e.target.value)}
                                            placeholder="Motivo da diferença ou outras observações..."
                                            disabled={isLoading}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                fontSize: 14,
                                                borderRadius: 'var(--shape-corner-medium)',
                                                border: '1px solid var(--md-outline)',
                                                background: 'var(--md-surface-container)',
                                                color: 'var(--md-on-surface)',
                                                outline: 'none',
                                                resize: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-error-container)',
                                            color: 'var(--md-on-error-container)',
                                            borderRadius: 'var(--shape-corner-medium)',
                                            fontSize: 14
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 12,
                                        paddingTop: 8
                                    }}>
                                        <Button
                                            type="button"
                                            variant="text"
                                            onClick={handleClose}
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="filled"
                                            disabled={isLoading}
                                        >
                                            <Lock size={18} style={{ marginRight: 8 }} />
                                            {isLoading ? 'Fechando...' : 'Fechar Caixa (F11)'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--md-error)' }}>
                                    {error || 'Erro ao carregar dados do caixa'}
                                </div>
                            )}
                        </div>

                        {/* Footer for success state */}
                        {fechamentoConcluido && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--md-outline-variant)',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <Button variant="filled" onClick={handleClose}>
                                    Concluir
                                </Button>
                            </div>
                        )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

interface SummaryItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    negative?: boolean;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ icon, label, value, color, negative }) => (
    <Card variant="outlined" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color }}>{icon}</span>
            <span style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{label}</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>
            {negative && value > 0 ? '-' : ''}R$ {value.toFixed(2)}
        </div>
    </Card>
);

interface SummaryCardProps {
    resumo: {
        valorInicial: number;
        totalVendas: number;
        totalSangrias: number;
        totalSuprimentos: number;
        valorEsperado: number;
        valorContado: number;
        diferenca: number;
    };
}

const SummaryCard: React.FC<SummaryCardProps> = ({ resumo }) => (
    <Card variant="outlined" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--md-outline-variant)' }}>
            <h4 style={{ margin: 0, fontSize: 14, color: 'var(--md-on-surface-variant)' }}>
                Resumo do Fechamento
            </h4>
        </div>
        <div style={{ padding: '12px 16px' }}>
            <SummaryRow label="Valor Inicial" value={resumo.valorInicial} />
            <SummaryRow label="(+) Vendas" value={resumo.totalVendas} color="var(--accent-success)" />
            <SummaryRow label="(+) Suprimentos" value={resumo.totalSuprimentos} color="var(--md-primary)" />
            <SummaryRow label="(-) Sangrias" value={resumo.totalSangrias} color="var(--md-error)" negative />
            <div style={{ height: 1, background: 'var(--md-outline-variant)', margin: '8px 0' }} />
            <SummaryRow label="Valor Esperado" value={resumo.valorEsperado} bold />
            <SummaryRow label="Valor Contado" value={resumo.valorContado} bold />
            {resumo.diferenca !== 0 && (
                <SummaryRow
                    label={resumo.diferenca < 0 ? 'Diferença (Falta)' : 'Diferença (Sobra)'}
                    value={Math.abs(resumo.diferenca)}
                    color={resumo.diferenca < 0 ? 'var(--md-error)' : 'var(--accent-success)'}
                    bold
                />
            )}
        </div>
    </Card>
);

interface SummaryRowProps {
    label: string;
    value: number;
    color?: string;
    negative?: boolean;
    bold?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, color, negative, bold }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: bold ? 15 : 14,
        fontWeight: bold ? 600 : 400
    }}>
        <span style={{ color: 'var(--md-on-surface-variant)' }}>{label}</span>
        <span style={{ color: color || 'var(--md-on-surface)' }}>
            {negative && value > 0 ? '-' : ''}R$ {value.toFixed(2)}
        </span>
    </div>
);
