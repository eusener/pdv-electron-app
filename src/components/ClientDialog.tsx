import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, UserPlus, Check } from 'lucide-react';
import { Button } from './Core';

export interface Client {
    id: string;
    name: string;
    document?: string; // CPF/CNPJ
    email?: string;
}

interface ClientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (client: Client | null) => void;
    currentClient: Client | null;
}

// Mock database
const MOCK_CLIENTS: Client[] = [
    { id: '1', name: 'João Silva', document: '123.456.789-00' },
    { id: '2', name: 'Maria Oliveira', document: '987.654.321-11', email: 'maria@email.com' },
    { id: '3', name: 'Empresa XYZ', document: '12.345.678/0001-90' },
];

export const ClientDialog = ({ isOpen, onClose, onSelect, currentClient }: ClientDialogProps) => {
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // New Client Form
    const [newName, setNewName] = useState('');
    const [newDoc, setNewDoc] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setIsCreating(false);
            setNewName('');
            setNewDoc('');
        }
    }, [isOpen]);

    const filteredClients = MOCK_CLIENTS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.document && c.document.includes(search))
    );

    const handleCreate = () => {
        if (!newName) return;
        const newClient: Client = {
            id: Math.random().toString(36).substr(2, 9),
            name: newName,
            document: newDoc
        };
        onSelect(newClient);
        onClose();
    };

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
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                        style={{
                            position: 'fixed',
                            top: '50%', left: '50%',
                            width: '90%', maxWidth: 500,
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-3)',
                            zIndex: 501,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '80vh'
                        }}
                    >
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--md-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 20 }}>{isCreating ? 'Novo Cliente' : 'Selecionar Cliente'}</h3>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-on-surface)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {!isCreating ? (
                            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        placeholder="Buscar por nome ou CPF..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            borderRadius: 'var(--shape-corner-medium)',
                                            border: '1px solid var(--md-outline)',
                                            background: 'var(--md-surface-container)',
                                            color: 'var(--md-on-surface)',
                                            fontSize: 16
                                        }}
                                        autoFocus
                                    />
                                    <Button onClick={() => setIsCreating(true)} variant="tonal">
                                        <UserPlus size={20} />
                                    </Button>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => { onSelect(client); onClose(); }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px',
                                                background: currentClient?.id === client.id ? 'var(--md-secondary-container)' : 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid var(--md-outline-variant)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                color: 'var(--md-on-surface)'
                                            }}
                                        >
                                            <div style={{
                                                width: 40, height: 40,
                                                borderRadius: '50%', background: 'var(--md-surface-container-high)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{client.name}</div>
                                                {client.document && <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{client.document}</div>}
                                            </div>
                                            {currentClient?.id === client.id && <Check size={20} style={{ marginLeft: 'auto', color: 'var(--md-primary)' }} />}
                                        </button>
                                    ))}
                                    {filteredClients.length === 0 && (
                                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--md-on-surface-variant)' }}>
                                            Nenhum cliente encontrado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Nome Completo</label>
                                    <input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            borderRadius: 'var(--shape-corner-medium)',
                                            border: '1px solid var(--md-outline)',
                                            background: 'var(--md-surface-container)',
                                            color: 'var(--md-on-surface)',
                                            fontSize: 16
                                        }}
                                        placeholder="Ex: Ana Maria"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>CPF / CNPJ (Opcional)</label>
                                    <input
                                        value={newDoc}
                                        onChange={e => setNewDoc(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            borderRadius: 'var(--shape-corner-medium)',
                                            border: '1px solid var(--md-outline)',
                                            background: 'var(--md-surface-container)',
                                            color: 'var(--md-on-surface)',
                                            fontSize: 16
                                        }}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                    <Button variant="text" onClick={() => setIsCreating(false)} style={{ flex: 1 }}>Voltar</Button>
                                    <Button variant="filled" onClick={handleCreate} disabled={!newName} style={{ flex: 1 }}>Criar Cliente</Button>
                                </div>
                            </div>
                        )}

                        {currentClient && !isCreating && (
                            <div style={{ padding: 16, borderTop: '1px solid var(--md-outline-variant)', background: 'var(--md-surface-container-low)' }}>
                                <Button
                                    variant="text"
                                    onClick={() => { onSelect(null); onClose(); }}
                                    style={{ width: '100%', color: 'var(--md-error)' }}
                                >
                                    Remover Cliente Selecionado
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
