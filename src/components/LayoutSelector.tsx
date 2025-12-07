import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutConfig, getAllLayouts } from '../layouts/config';

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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 100,
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                            borderRadius: 'var(--radius-xl)',
                            padding: 'var(--space-xl)',
                            width: '90%',
                            maxWidth: '600px',
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            zIndex: 101,
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-lg)',
                        }}>
                            <div>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                }}>
                                    Escolha o Modelo
                                </h2>
                                <p style={{
                                    margin: '4px 0 0',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.875rem',
                                }}>
                                    Selecione o tipo de negócio para personalizar a interface
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    width: 36,
                                    height: 36,
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ✕
                            </button>
                        </div>

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
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onSelect(layout);
                                            onClose();
                                        }}
                                        style={{
                                            background: isSelected
                                                ? `linear-gradient(135deg, ${layout.theme.accentPrimary}20, ${layout.theme.accentPrimary}10)`
                                                : 'var(--bg-elevated)',
                                            border: isSelected
                                                ? `2px solid ${layout.theme.accentPrimary}`
                                                : '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: 'var(--space-lg)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'var(--transition-normal)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="selected-indicator"
                                                style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 10,
                                                    background: layout.theme.accentPrimary,
                                                    borderRadius: '50%',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: '#fff',
                                                }}
                                            >
                                                ✓
                                            </motion.div>
                                        )}

                                        <div style={{
                                            fontSize: '2.5rem',
                                            marginBottom: 'var(--space-sm)',
                                        }}>
                                            {layout.icon}
                                        </div>

                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: isSelected ? layout.theme.accentPrimary : 'var(--text-primary)',
                                        }}>
                                            {layout.name}
                                        </h3>

                                        <p style={{
                                            margin: '4px 0 0',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                        }}>
                                            {layout.description}
                                        </p>

                                        {/* Color Preview */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '6px',
                                            marginTop: 'var(--space-md)',
                                        }}>
                                            <div style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                background: layout.theme.accentPrimary,
                                            }} />
                                            <div style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                background: layout.theme.accentSecondary,
                                            }} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Compact button to open the selector
interface LayoutToggleProps {
    layout: LayoutConfig;
    onClick: () => void;
}

export const LayoutToggle = ({ layout, onClick }: LayoutToggleProps) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 500,
            }}
        >
            <span>{layout.icon}</span>
            <span>{layout.name}</span>
            <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>▼</span>
        </motion.button>
    );
};
