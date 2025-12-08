import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LockOpen, Lock, ArrowDownCircle, ArrowUpCircle, FileText, ChevronDown } from 'lucide-react';

interface Caixa {
    id: string;
    numero: string;
    operador: string | null;
    status: 'ABERTO' | 'FECHADO';
    valor_inicial: number;
    data_abertura: string;
}

interface CashStatusIndicatorProps {
    caixa: Caixa | null;
    onOpenCaixa: () => void;
    onCloseCaixa: () => void;
    onMovimento: () => void;
    onRelatorios: () => void;
}

export const CashStatusIndicator: React.FC<CashStatusIndicatorProps> = ({
    caixa,
    onOpenCaixa,
    onCloseCaixa,
    onMovimento,
    onRelatorios
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOpen = caixa?.status === 'ABERTO';

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            {/* Indicator Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: isOpen ? 'var(--md-primary-container)' : 'var(--md-surface-container-high)',
                    color: isOpen ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                    border: `1px solid ${isOpen ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
                    borderRadius: 'var(--shape-corner-full)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
            >
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isOpen ? 'var(--accent-success)' : 'var(--md-outline)'
                }} />
                <Wallet size={16} />
                <span>{isOpen ? 'Caixa Aberto' : 'Caixa Fechado'}</span>
                <ChevronDown size={14} style={{
                    transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            minWidth: 220,
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-large)',
                            boxShadow: 'var(--elevation-3)',
                            border: '1px solid var(--md-outline-variant)',
                            overflow: 'hidden',
                            zIndex: 100
                        }}
                    >
                        {/* Header Info */}
                        {isOpen && caixa && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--md-surface-container-low)',
                                borderBottom: '1px solid var(--md-outline-variant)'
                            }}>
                                <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                    Aberto desde {formatTime(caixa.data_abertura)}
                                </div>
                                {caixa.operador && (
                                    <div style={{ fontSize: 13, color: 'var(--md-on-surface)', marginTop: 2 }}>
                                        {caixa.operador}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Menu Items */}
                        <div style={{ padding: 8 }}>
                            {!isOpen ? (
                                <MenuItem
                                    icon={<LockOpen size={18} />}
                                    label="Abrir Caixa"
                                    shortcut="F9"
                                    onClick={() => { onOpenCaixa(); setIsMenuOpen(false); }}
                                />
                            ) : (
                                <>
                                    <MenuItem
                                        icon={<ArrowDownCircle size={18} />}
                                        label="Sangria / Suprimento"
                                        shortcut="F10"
                                        onClick={() => { onMovimento(); setIsMenuOpen(false); }}
                                    />
                                    <MenuItem
                                        icon={<Lock size={18} />}
                                        label="Fechar Caixa"
                                        shortcut="F11"
                                        onClick={() => { onCloseCaixa(); setIsMenuOpen(false); }}
                                    />
                                </>
                            )}

                            <div style={{
                                height: 1,
                                background: 'var(--md-outline-variant)',
                                margin: '8px 0'
                            }} />

                            <MenuItem
                                icon={<FileText size={18} />}
                                label="Relatórios"
                                onClick={() => { onRelatorios(); setIsMenuOpen(false); }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, shortcut, onClick }) => (
    <motion.button
        whileHover={{ backgroundColor: 'var(--md-surface-container-high)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--shape-corner-medium)',
            cursor: 'pointer',
            color: 'var(--md-on-surface)',
            fontSize: 14,
            textAlign: 'left'
        }}
    >
        <span style={{ color: 'var(--md-primary)' }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {shortcut && (
            <span style={{
                fontSize: 11,
                color: 'var(--md-on-surface-variant)',
                background: 'var(--md-surface-container)',
                padding: '2px 6px',
                borderRadius: 4
            }}>
                {shortcut}
            </span>
        )}
    </motion.button>
);
