import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutConfig, getAllLayouts } from '../layouts/config';
import { Check, ChevronDown } from 'lucide-react';

interface LayoutSelectorProps {
    currentLayout: LayoutConfig;
    onSelect: (layout: LayoutConfig) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const LayoutSelector = ({
    currentLayout,
    onSelect,
    isOpen,
    onClose
}: LayoutSelectorProps) => {
    const layouts = getAllLayouts();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Scrim (backdrop) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.32)',
                            zIndex: 100,
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
                            maxWidth: 560,
                            boxShadow: 'var(--elevation-3)',
                            zIndex: 101,
                        }}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 400,
                                color: 'var(--md-on-surface)',
                            }}>
                                Escolha o Modelo
                            </h2>
                            <p style={{
                                margin: '8px 0 0',
                                fontSize: 14,
                                color: 'var(--md-on-surface-variant)',
                            }}>
                                Selecione o tipo de negócio para personalizar a interface
                            </p>
                        </div>

                        {/* Layout Options */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'var(--space-md)',
                        }}>
                            {layouts.map((layout) => {
                                const isSelected = layout.id === currentLayout.id;
                                return (
                                    <motion.button
                                        key={layout.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onSelect(layout);
                                            onClose();
                                        }}
                                        style={{
                                            background: isSelected
                                                ? 'var(--md-secondary-container)'
                                                : 'var(--md-surface-container)',
                                            border: isSelected
                                                ? 'none'
                                                : '1px solid var(--md-outline-variant)',
                                            borderRadius: 'var(--shape-corner-large)',
                                            padding: 'var(--space-md)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Selected Check */}
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                width: 24,
                                                height: 24,
                                                borderRadius: 'var(--shape-corner-full)',
                                                background: 'var(--md-primary)',
                                                color: 'var(--md-on-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Check size={14} />
                                            </div>
                                        )}

                                        {/* Icon */}
                                        <div style={{
                                            fontSize: 32,
                                            marginBottom: 'var(--space-sm)',
                                            color: isSelected ? 'var(--md-primary)' : 'var(--md-on-surface)',
                                        }}>
                                            {layout.icon}
                                        </div>

                                        {/* Name */}
                                        <div style={{
                                            fontSize: 16,
                                            fontWeight: 500,
                                            color: isSelected
                                                ? 'var(--md-on-secondary-container)'
                                                : 'var(--md-on-surface)',
                                            marginBottom: 4,
                                        }}>
                                            {layout.name}
                                        </div>

                                        {/* Description */}
                                        <div style={{
                                            fontSize: 12,
                                            color: isSelected
                                                ? 'var(--md-on-secondary-container)'
                                                : 'var(--md-on-surface-variant)',
                                        }}>
                                            {layout.description}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 'var(--space-lg)',
                        }}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                style={{
                                    height: 40,
                                    padding: '0 24px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 'var(--shape-corner-full)',
                                    color: 'var(--md-primary)',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Fechar
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Navigation Rail Item (Material You style)
interface LayoutToggleProps {
    layout: LayoutConfig;
    onClick: () => void;
}

export const LayoutToggle = ({ layout, onClick }: LayoutToggleProps) => {
    return (
        <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 40,
                padding: '0 16px 0 12px',
                background: 'var(--md-surface-container-highest)',
                border: 'none',
                borderRadius: 'var(--shape-corner-full)',
                cursor: 'pointer',
                color: 'var(--md-on-surface)',
                fontSize: 14,
                fontWeight: 500,
            }}
        >
            <span style={{ fontSize: 18, display: 'flex' }}>{layout.icon}</span>
            <span>{layout.name}</span>
            <span style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 12,
                marginLeft: 4,
                display: 'flex',
                alignItems: 'center'
            }}>
                <ChevronDown size={14} />
            </span>
        </motion.button>
    );
};
