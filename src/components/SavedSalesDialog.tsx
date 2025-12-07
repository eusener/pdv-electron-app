import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Save, Trash2, ArrowRight } from 'lucide-react';
import { Button, StatusBadge } from './Core';

// Reusing types from App.tsx roughly, but defining local interface
export interface SavedSale {
    id: string;
    type: 'presale' | 'quote';
    date: string; // ISO string
    items: any[];
    total: number;
    clientName?: string;
}

interface SavedSalesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sales: SavedSale[];
    onLoad: (sale: SavedSale) => void;
    onDelete: (id: string) => void;
}

export const SavedSalesDialog = ({ isOpen, onClose, sales, onLoad, onDelete }: SavedSalesDialogProps) => {
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
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 400
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        style={{
                            position: 'fixed',
                            top: '50%', left: '50%',
                            width: '90%', maxWidth: 600,
                            maxHeight: '80vh',
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-4)',
                            zIndex: 401,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--md-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Vendas Salvas</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-on-surface)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {sales.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--md-on-surface-variant)', padding: 40 }}>
                                    <h3 style={{ fontWeight: 400 }}>Nenhuma venda salva</h3>
                                    <p>Suas pré-vendas e orçamentos aparecerão aqui.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {sales.map(sale => (
                                        <div key={sale.id} style={{
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 'var(--shape-corner-large)',
                                            padding: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: '1px solid var(--md-outline-variant)'
                                        }}>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <div style={{
                                                    width: 40, height: 40,
                                                    borderRadius: '50%',
                                                    background: sale.type === 'presale' ? 'var(--md-primary-container)' : 'var(--md-secondary-container)',
                                                    color: sale.type === 'presale' ? 'var(--md-on-primary-container)' : 'var(--md-on-secondary-container)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {sale.type === 'presale' ? <Save size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {sale.type === 'presale' ? 'Pré-venda' : 'Orçamento'}
                                                        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--md-on-surface-variant)' }}>
                                                            #{sale.id.slice(0, 4)}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                                        {new Date(sale.date).toLocaleString()} • {sale.items.reduce((a, b) => a + b.qtd, 0)} itens
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--md-primary)' }}>
                                                    R$ {sale.total.toFixed(2)}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Button variant="tonal" onClick={() => onDelete(sale.id)} style={{ padding: 8, minWidth: 0, background: 'var(--md-error-container)', color: 'var(--md-on-error-container)' }}>
                                                        <Trash2 size={18} />
                                                    </Button>
                                                    <Button variant="filled" onClick={() => onLoad(sale)} style={{ padding: '8px 16px' }}>
                                                        Abrir <ArrowRight size={18} style={{ marginLeft: 8 }} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
