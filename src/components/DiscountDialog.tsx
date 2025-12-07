import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, DollarSign } from 'lucide-react';
import { Button } from './Core';

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (type: 'fixed' | 'percent', value: number) => void;
    currentTotal: number;
}

export const DiscountDialog = ({ isOpen, onClose, onApply, currentTotal }: DiscountDialogProps) => {
    const [type, setType] = useState<'fixed' | 'percent'>('percent');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseFloat(value.replace(',', '.'));
        if (!isNaN(numValue) && numValue > 0) {
            onApply(type, numValue);
            onClose();
            setValue('');
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
                                    borderBottom: '2px solid var(--md-primary)',
                                }}>
                                    <label style={{ fontSize: 12, color: 'var(--md-primary)' }}>
                                        {type === 'percent' ? 'Porcentagem (%)' : 'Valor (R$)'}
                                    </label>
                                    <input
                                        autoFocus
                                        type="number"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder="0,00"
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
                                {/* Preview */}
                                <div style={{
                                    marginTop: 8,
                                    textAlign: 'right',
                                    fontSize: 14,
                                    color: 'var(--md-on-surface-variant)'
                                }}>
                                    Novo total: R$ {(() => {
                                        const val = parseFloat(value) || 0;
                                        let disc = 0;
                                        if (type === 'percent') disc = currentTotal * (val / 100);
                                        else disc = val;
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
                                    disabled={!value}
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
