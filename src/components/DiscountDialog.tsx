import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, DollarSign } from 'lucide-react';
import { Button } from './Core';

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (type: 'fixed' | 'percent', value: number) => void;
    currentTotal: number;
}

/**
 * Parses a discount expression like "10+10" or "10+5+15" and calculates
 * the cascading discount (each subsequent discount applies to the remaining value).
 * Returns the equivalent single percentage discount.
 *
 * Example: "10+10" on R$10.00:
 * - First 10%: R$10.00 - R$1.00 = R$9.00
 * - Second 10%: R$9.00 - R$0.90 = R$8.10
 * - Equivalent discount: 19% (not 20%)
 */
const parseCascadeDiscount = (input: string): { percentages: number[], equivalentPercent: number } | null => {
    // Remove spaces and replace comma with dot
    const cleaned = input.replace(/\s/g, '').replace(',', '.');

    // Check if it contains + (cascade discount)
    if (cleaned.includes('+')) {
        const parts = cleaned.split('+').filter(p => p.length > 0);
        const percentages = parts.map(p => parseFloat(p));

        // Check if all parts are valid numbers
        if (percentages.some(p => isNaN(p) || p < 0 || p > 100)) {
            return null;
        }

        // Calculate equivalent percentage using cascade formula
        // Each discount is applied to the remaining value
        // Final = Original * (1 - p1/100) * (1 - p2/100) * ...
        // Equivalent % = (1 - product of all (1 - pi/100)) * 100
        const multiplier = percentages.reduce((acc, p) => acc * (1 - p / 100), 1);
        const equivalentPercent = (1 - multiplier) * 100;

        return { percentages, equivalentPercent };
    }

    // Single number
    const num = parseFloat(cleaned);
    if (isNaN(num) || num < 0) return null;

    return { percentages: [num], equivalentPercent: num };
};

export const DiscountDialog = ({ isOpen, onClose, onApply, currentTotal }: DiscountDialogProps) => {
    const [type, setType] = useState<'fixed' | 'percent'>('percent');
    const [value, setValue] = useState('');

    // Parse the cascade discount for preview and validation
    const parsedDiscount = useMemo(() => {
        if (type === 'percent') {
            return parseCascadeDiscount(value);
        }
        const num = parseFloat(value.replace(',', '.'));
        return !isNaN(num) && num >= 0 ? { percentages: [num], equivalentPercent: num } : null;
    }, [type, value]);

    const isCascade = type === 'percent' && parsedDiscount && parsedDiscount.percentages.length > 1;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (type === 'percent' && parsedDiscount && parsedDiscount.equivalentPercent > 0) {
            // Apply the equivalent percentage (handles both single and cascade)
            onApply(type, parsedDiscount.equivalentPercent);
            onClose();
            setValue('');
        } else if (type === 'fixed') {
            const numValue = parseFloat(value.replace(',', '.'));
            if (!isNaN(numValue) && numValue > 0) {
                onApply(type, numValue);
                onClose();
                setValue('');
            }
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
                            background: 'rgba(0, 0, 0, 0.32)',
                            zIndex: 200,
                            backdropFilter: 'blur(2px)',
                        }}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            background: 'var(--md-surface-container-high)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            padding: 'var(--space-lg)',
                            width: '90%',
                            maxWidth: 400,
                            boxShadow: 'var(--elevation-3)',
                            zIndex: 201,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, color: 'var(--md-on-surface)' }}>
                                Aplicar Desconto
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--md-on-surface-variant)',
                                    cursor: 'pointer',
                                    padding: 4,
                                    borderRadius: '50%',
                                    display: 'flex',
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Type Selector */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                                marginBottom: 24,
                            }}>
                                <TypeButton
                                    active={type === 'percent'}
                                    onClick={() => setType('percent')}
                                    icon={<Percent size={20} />}
                                    label="Porcentagem"
                                />
                                <TypeButton
                                    active={type === 'fixed'}
                                    onClick={() => setType('fixed')}
                                    icon={<DollarSign size={20} />} // Using DollarSign as generic currency char
                                    label="Valor Fixo"
                                />
                            </div>

                            {/* Input */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    background: 'var(--md-surface-container-highest)',
                                    borderRadius: 'var(--shape-corner-small)',
                                    padding: '8px 16px',
                                    borderBottom: `2px solid ${parsedDiscount ? 'var(--md-primary)' : 'var(--md-error)'}`,
                                }}>
                                    <label style={{ fontSize: 12, color: parsedDiscount ? 'var(--md-primary)' : 'var(--md-error)' }}>
                                        {type === 'percent' ? 'Porcentagem (%)' : 'Valor (R$)'}
                                    </label>
                                    <input
                                        autoFocus
                                        type={type === 'percent' ? 'text' : 'number'}
                                        step={type === 'fixed' ? '0.01' : undefined}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={type === 'percent' ? 'Ex: 10 ou 10+10' : '0,00'}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            fontSize: 24,
                                            color: 'var(--md-on-surface)',
                                            width: '100%',
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                {/* Cascade discount hint */}
                                {type === 'percent' && !value && (
                                    <div style={{
                                        marginTop: 8,
                                        fontSize: 12,
                                        color: 'var(--md-on-surface-variant)',
                                        fontStyle: 'italic'
                                    }}>
                                        Dica: Use "10+10" para descontos em cascata
                                    </div>
                                )}

                                {/* Validation error */}
                                {value && !parsedDiscount && (
                                    <div style={{
                                        marginTop: 8,
                                        fontSize: 12,
                                        color: 'var(--md-error)',
                                    }}>
                                        Insira um número válido (ex: 10 ou 10+5)
                                    </div>
                                )}

                                {/* Cascade breakdown */}
                                {isCascade && parsedDiscount && (
                                    <div style={{
                                        marginTop: 12,
                                        padding: '12px',
                                        background: 'var(--md-surface-container)',
                                        borderRadius: 'var(--shape-corner-medium)',
                                        fontSize: 13,
                                    }}>
                                        <div style={{ marginBottom: 8, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                                            Cálculo em cascata:
                                        </div>
                                        {parsedDiscount.percentages.reduce((acc, percent, index) => {
                                            const previousValue = index === 0 ? currentTotal : acc.runningTotal;
                                            const discountAmount = previousValue * (percent / 100);
                                            const newValue = previousValue - discountAmount;
                                            acc.elements.push(
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    color: 'var(--md-on-surface-variant)',
                                                    marginBottom: 4,
                                                }}>
                                                    <span>{index + 1}º desconto ({percent}%)</span>
                                                    <span>R$ {previousValue.toFixed(2)} → R$ {newValue.toFixed(2)}</span>
                                                </div>
                                            );
                                            acc.runningTotal = newValue;
                                            return acc;
                                        }, { elements: [] as React.ReactNode[], runningTotal: currentTotal }).elements}
                                        <div style={{
                                            marginTop: 8,
                                            paddingTop: 8,
                                            borderTop: '1px solid var(--md-outline-variant)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontWeight: 600,
                                            color: 'var(--accent-success)',
                                        }}>
                                            <span>Desconto equivalente</span>
                                            <span>{parsedDiscount.equivalentPercent.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Preview */}
                                <div style={{
                                    marginTop: 8,
                                    textAlign: 'right',
                                    fontSize: 14,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    Novo total: R$ {(() => {
                                        if (!parsedDiscount) return currentTotal.toFixed(2);
                                        let disc = 0;
                                        if (type === 'percent') {
                                            disc = currentTotal * (parsedDiscount.equivalentPercent / 100);
                                        } else {
                                            disc = parsedDiscount.equivalentPercent;
                                        }
                                        return Math.max(0, currentTotal - disc).toFixed(2);
                                    })()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <Button
                                    type="button"
                                    variant="text"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="filled"
                                    disabled={!parsedDiscount || parsedDiscount.equivalentPercent <= 0}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const TypeButton = ({ active, onClick, icon, label }: any) => (
    <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 12,
            background: active ? 'var(--md-secondary-container)' : 'transparent',
            border: active ? 'none' : '1px solid var(--md-outline)',
            color: active ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)',
            borderRadius: 'var(--shape-corner-medium)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
        }}
    >
        {icon}
        {label}
    </motion.button>
);
