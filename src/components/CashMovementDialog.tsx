import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownCircle, ArrowUpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button, Card } from './Core';

interface CashMovementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    caixaId: string;
    onSuccess: () => void;
}

type MovementType = 'SANGRIA' | 'SUPRIMENTO';

const MOTIVOS_SANGRIA = [
    { id: 'deposito', label: 'Depósito Bancário' },
    { id: 'pagamento', label: 'Pagamento de Fornecedor' },
    { id: 'retirada', label: 'Retirada do Proprietário' },
    { id: 'outro', label: 'Outro' },
];

const MOTIVOS_SUPRIMENTO = [
    { id: 'troco', label: 'Reforço de Troco' },
    { id: 'abertura', label: 'Suprimento Inicial' },
    { id: 'devolucao', label: 'Devolução' },
    { id: 'outro', label: 'Outro' },
];

export const CashMovementDialog: React.FC<CashMovementDialogProps> = ({
    isOpen,
    onClose,
    caixaId,
    onSuccess
}) => {
    const [tipo, setTipo] = useState<MovementType>('SANGRIA');
    const [valor, setValor] = useState('');
    const [motivo, setMotivo] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saldoAtual, setSaldoAtual] = useState<number>(0);

    // Fetch current balance when dialog opens
    useEffect(() => {
        if (isOpen && caixaId) {
            window.api.getResumoCaixa(caixaId).then(res => {
                if (res.success && res.resumo) {
                    setSaldoAtual(res.resumo.valorEsperado);
                }
            });
        }
    }, [isOpen, caixaId]);

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setTipo('SANGRIA');
            setValor('');
            setMotivo('');
            setObservacoes('');
            setError(null);
        }
    }, [isOpen]);

    const motivos = tipo === 'SANGRIA' ? MOTIVOS_SANGRIA : MOTIVOS_SUPRIMENTO;
    const valorNum = parseFloat(valor.replace(',', '.')) || 0;
    const saldoApos = tipo === 'SANGRIA' ? saldoAtual - valorNum : saldoAtual + valorNum;
    const saldoInsuficiente = tipo === 'SANGRIA' && valorNum > saldoAtual;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (valorNum <= 0) {
            setError('Informe um valor válido');
            return;
        }

        if (saldoInsuficiente) {
            setError('Saldo insuficiente para esta sangria');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await window.api.registrarMovimento({
                caixaId,
                tipo,
                valor: valorNum,
                motivo: motivo || undefined,
                observacoes: observacoes || undefined
            });

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.error || 'Erro ao registrar movimento');
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
                                maxWidth: 480,
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
                                    Movimento de Caixa
                                </h2>
                                <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
                                    Saldo atual: R$ {saldoAtual.toFixed(2)}
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
                        <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
                            {/* Type Selection */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12
                            }}>
                                <TypeButton
                                    active={tipo === 'SANGRIA'}
                                    onClick={() => setTipo('SANGRIA')}
                                    icon={<ArrowDownCircle size={20} />}
                                    label="Sangria"
                                    sublabel="Retirada"
                                    color="var(--md-error)"
                                />
                                <TypeButton
                                    active={tipo === 'SUPRIMENTO'}
                                    onClick={() => setTipo('SUPRIMENTO')}
                                    icon={<ArrowUpCircle size={20} />}
                                    label="Suprimento"
                                    sublabel="Entrada"
                                    color="var(--accent-success)"
                                />
                            </div>

                            {/* Valor */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    Valor (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="0,00"
                                    disabled={isLoading}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        fontSize: 28,
                                        fontWeight: 500,
                                        borderRadius: 'var(--shape-corner-medium)',
                                        border: `1px solid ${saldoInsuficiente ? 'var(--md-error)' : 'var(--md-outline)'}`,
                                        background: 'var(--md-surface-container)',
                                        color: 'var(--md-on-surface)',
                                        outline: 'none',
                                        textAlign: 'center',
                                    }}
                                />
                            </div>

                            {/* Motivo */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    Motivo
                                </label>
                                <select
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        fontSize: 16,
                                        borderRadius: 'var(--shape-corner-medium)',
                                        border: '1px solid var(--md-outline)',
                                        background: 'var(--md-surface-container)',
                                        color: 'var(--md-on-surface)',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Selecione um motivo...</option>
                                    {motivos.map(m => (
                                        <option key={m.id} value={m.label}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Observações */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    Observações (opcional)
                                </label>
                                <textarea
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    placeholder="Detalhes adicionais..."
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

                            {/* Balance Preview */}
                            <Card variant="outlined" style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>
                                        Saldo após movimento:
                                    </span>
                                    <span style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: saldoInsuficiente ? 'var(--md-error)' : 'var(--md-primary)'
                                    }}>
                                        R$ {saldoApos.toFixed(2)}
                                    </span>
                                </div>
                                {saldoInsuficiente && (
                                    <div style={{
                                        marginTop: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: 'var(--md-error)',
                                        fontSize: 13
                                    }}>
                                        <AlertTriangle size={14} />
                                        Saldo insuficiente para esta operação
                                    </div>
                                )}
                            </Card>

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
                                marginTop: 'auto',
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
                                    disabled={isLoading || valorNum <= 0 || saldoInsuficiente}
                                >
                                    <CheckCircle2 size={18} style={{ marginRight: 8 }} />
                                    {isLoading ? 'Salvando...' : `Confirmar ${tipo === 'SANGRIA' ? 'Sangria' : 'Suprimento'}`}
                                </Button>
                            </div>
                        </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

interface TypeButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    color: string;
}

const TypeButton: React.FC<TypeButtonProps> = ({ active, onClick, icon, label, sublabel, color }) => (
    <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '16px 12px',
            background: active ? 'var(--md-secondary-container)' : 'transparent',
            border: active ? 'none' : '1px solid var(--md-outline)',
            color: active ? color : 'var(--md-on-surface)',
            borderRadius: 'var(--shape-corner-large)',
            cursor: 'pointer',
        }}
    >
        {icon}
        <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, opacity: 0.7 }}>{sublabel}</span>
    </motion.button>
);
