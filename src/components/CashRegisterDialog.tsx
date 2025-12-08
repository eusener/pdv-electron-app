import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, User, CheckCircle2 } from 'lucide-react';
import { Button, Card } from './Core';

interface CashRegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (caixa: any) => void;
}

export const CashRegisterDialog: React.FC<CashRegisterDialogProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [operador, setOperador] = useState('');
    const [valorInicial, setValorInicial] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await window.api.abrirCaixa({
                operador: operador || undefined,
                valorInicial: parseFloat(valorInicial.replace(',', '.')) || 0
            });

            if (response.success && response.caixa) {
                onSuccess(response.caixa);
                onClose();
                // Reset form
                setOperador('');
                setValorInicial('');
            } else {
                setError(response.error || 'Erro ao abrir caixa');
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
            setError(null);
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
                                maxWidth: 450,
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
                                    Abertura de Caixa
                                </h2>
                                <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>
                                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                        <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Operador */}
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    <User size={16} /> Nome do Operador (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={operador}
                                    onChange={(e) => setOperador(e.target.value)}
                                    placeholder="Ex: João Silva"
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
                                        transition: 'border-color 0.2s',
                                    }}
                                />
                            </div>

                            {/* Valor Inicial */}
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    <DollarSign size={16} /> Valor Inicial em Caixa (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={valorInicial}
                                    onChange={(e) => setValorInicial(e.target.value)}
                                    placeholder="0,00"
                                    disabled={isLoading}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        fontSize: 28,
                                        fontWeight: 500,
                                        borderRadius: 'var(--shape-corner-medium)',
                                        border: '1px solid var(--md-outline)',
                                        background: 'var(--md-surface-container)',
                                        color: 'var(--md-on-surface)',
                                        outline: 'none',
                                        textAlign: 'center',
                                        transition: 'border-color 0.2s',
                                    }}
                                />
                            </div>

                            {/* Info Card */}
                            <Card variant="outlined" style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', lineHeight: 1.5 }}>
                                    O valor inicial representa o troco disponível para início das operações.
                                    Este valor será considerado no fechamento do caixa.
                                </div>
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
                                    disabled={isLoading}
                                >
                                    <CheckCircle2 size={18} style={{ marginRight: 8 }} />
                                    {isLoading ? 'Abrindo...' : 'Abrir Caixa (F9)'}
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
