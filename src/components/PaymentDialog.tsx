import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Landmark, Wallet, CheckCircle2, ChevronRight, Calculator } from 'lucide-react';
import { Button } from './Core';
import { useShortcuts } from '../hooks/useShortcuts';

interface ValidPayment {
    id: string;
    method: 'credit' | 'debit' | 'money' | 'pix' | 'check';
    amount: number;
    installments?: number;
}

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onFinish: (payments: ValidPayment[]) => void;
}

const METHODS = [
    { id: 'money', label: 'Dinheiro', icon: <Banknote size={24} />, color: '#85bb65', shortcut: 'F1' },
    { id: 'pix', label: 'PIX', icon: <Landmark size={24} />, color: '#32bcad', shortcut: 'F2' },
    { id: 'debit', label: 'Débito', icon: <CreditCard size={24} />, color: '#3b82f6', shortcut: 'F3' },
    { id: 'credit', label: 'Crédito', icon: <CreditCard size={24} />, color: '#8b5cf6', shortcut: 'F4' },
    { id: 'check', label: 'Cheque', icon: <Wallet size={24} />, color: '#f59e0b', shortcut: 'F5' },
] as const;

export const PaymentDialog = ({ isOpen, onClose, total, onFinish }: PaymentDialogProps) => {
    const [payments, setPayments] = useState<ValidPayment[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<typeof METHODS[number]['id']>('money');
    const [amount, setAmount] = useState<string>(''); // Current input amount
    const [installments, setInstallments] = useState<number>(1);

    // Calculate remaining
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total); // Troco

    // Auto-fill amount with remaining when opening or changing method (if empty)
    useEffect(() => {
        if (isOpen) {
            setPayments([]);
            setAmount(total.toFixed(2));
            setSelectedMethod('money');
        }
    }, [isOpen, total]);

    // When remaining changes, allow quick fill? 
    // Actually standard POS behavior: keep inputting until satisfied.

    const handleAddPayment = () => {
        const val = parseFloat(amount.replace(',', '.'));
        if (isNaN(val) || val <= 0) return;

        const newPayment: ValidPayment = {
            id: Math.random().toString(36).substr(2, 9),
            method: selectedMethod,
            amount: val,
            installments: selectedMethod === 'credit' ? installments : undefined
        };

        setPayments([...payments, newPayment]);

        // Auto-update next amount to remaining
        const newTotalPaid = totalPaid + val;
        const newRemaining = Math.max(0, total - newTotalPaid);
        setAmount(newRemaining > 0 ? newRemaining.toFixed(2) : '');
        setInstallments(1);
    };

    const handleRemovePayment = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const isComplete = totalPaid >= total - 0.01; // tolerance

    useShortcuts({
        onF1: () => isOpen && setSelectedMethod('money'),
        onF2: () => isOpen && setSelectedMethod('pix'),
        onF3: () => isOpen && setSelectedMethod('debit'),
        onF4: () => isOpen && setSelectedMethod('credit'),
        onF5: () => isOpen && setSelectedMethod('check'),
        onF12: () => isOpen && isComplete && onFinish(payments),
        onEnter: () => isOpen && handleAddPayment(),
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            position: 'fixed',
                            top: '5%', bottom: '5%', left: '50%', x: '-50%',
                            width: '90%', maxWidth: 1000,
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 301
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--md-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Pagamento</h2>
                                <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>
                                    Total a Pagar: <strong style={{ fontSize: 18, color: 'var(--md-primary)' }}>R$ {total.toFixed(2)}</strong>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-on-surface)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* LEFT: Method Selection & Input */}
                            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, borderRight: '1px solid var(--md-outline-variant)' }}>

                                {/* Methods Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
                                    {METHODS.map(m => (
                                        <motion.button
                                            key={m.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedMethod(m.id as any)}
                                            style={{
                                                background: selectedMethod === m.id ? 'var(--md-secondary-container)' : 'var(--md-surface-container)',
                                                border: selectedMethod === m.id ? '2px solid var(--md-primary)' : '1px solid var(--md-outline-variant)',
                                                borderRadius: 'var(--shape-corner-medium)',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                color: selectedMethod === m.id ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
                                            }}
                                        >
                                            <div style={{ color: m.color }}>{m.icon}</div>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</span>
                                            <span style={{ fontSize: 10, opacity: 0.6, marginTop: -4 }}>{m.shortcut}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Installments (Credit Only) */}
                                {selectedMethod === 'credit' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--md-on-surface-variant)' }}>Parcelamento</label>
                                        <select
                                            value={installments}
                                            onChange={(e) => setInstallments(Number(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                                borderRadius: 'var(--shape-corner-medium)',
                                                border: '1px solid var(--md-outline)',
                                                background: 'var(--md-surface-container)',
                                                color: 'var(--md-on-surface)',
                                                fontSize: 16
                                            }}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                                                <option key={i} value={i}>{i}x {i === 1 ? 'à vista' : 'sem juros'}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Amount Input */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--md-on-surface-variant)' }}>Valor a Pagar</label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: 16,
                                                fontSize: 24,
                                                borderRadius: 'var(--shape-corner-medium)',
                                                border: '1px solid var(--md-outline)',
                                                background: 'var(--md-surface-container)',
                                                color: 'var(--md-on-surface)',
                                            }}
                                            placeholder="0.00"
                                        />
                                        <Button
                                            variant="filled"
                                            onClick={handleAddPayment}
                                            style={{ height: 'auto', padding: '0 32px' }}
                                            disabled={!amount || parseFloat(amount) <= 0 || isComplete}
                                        >
                                            <ChevronRight size={24} />
                                        </Button>
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 14, color: 'var(--md-on-surface-variant)' }}>
                                        Restante: <span style={{ color: 'var(--md-error)' }}>R$ {remaining.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Summary */}
                            <div style={{ width: 350, background: 'var(--md-surface-container-low)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginTop: 0, fontSize: 18 }}>Extrato de Pagamentos</h3>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {payments.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--md-on-surface-variant)', marginTop: 40 }}>
                                            Nenhum pagamento adicionado
                                        </div>
                                    ) : (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {payments.map(p => (
                                                <li key={p.id} style={{
                                                    padding: '12px',
                                                    background: 'var(--md-surface)',
                                                    marginBottom: 8,
                                                    borderRadius: 'var(--shape-corner-medium)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>
                                                            {METHODS.find(m => m.id === p.method)?.label}
                                                            {p.installments && p.installments > 1 && ` (${p.installments}x)`}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                                            {new Date().toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span style={{ fontWeight: 700 }}>R$ {p.amount.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => handleRemovePayment(p.id)}
                                                            style={{
                                                                background: 'var(--md-error-container)',
                                                                color: 'var(--md-on-error-container)',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: 24, height: 24,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Summary Footer */}
                                <div style={{ borderTop: '1px solid var(--md-outline-variant)', paddingTop: 16, marginTop: 16 }}>

                                    {change > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 18, color: 'var(--md-primary)' }}>
                                            <span>Troco</span>
                                            <strong>R$ {change.toFixed(2)}</strong>
                                        </div>
                                    )}

                                    <Button
                                        variant="filled"
                                        style={{ width: '100%', height: 56, fontSize: 18 }}
                                        disabled={!isComplete}
                                        onClick={() => onFinish(payments)}
                                    >
                                        <CheckCircle2 size={24} style={{ marginRight: 8 }} /> Concluir Venda (F12)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
