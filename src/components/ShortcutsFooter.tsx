import React from 'react';

const SHORTCUTS = [
    { key: 'F1', label: 'Cliente' },
    { key: 'F2', label: 'Pré-venda' },
    { key: 'F3', label: 'Orçamento' },
    { key: 'F4', label: 'Pagamento' },
    { key: 'F5', label: 'NF-e' },
    { key: 'F6', label: 'Recuperar' },
    { key: 'F7', label: 'Desconto' },
    { key: 'F8', label: 'Cancelar' },
    { key: 'F9', label: 'Abrir Caixa' },
    { key: 'F10', label: 'Sangria' },
    { key: 'F11', label: 'Fechar Caixa' },
    { key: 'ESC', label: 'Voltar' },
];

export const ShortcutsFooter = () => {
    return (
        <div style={{
            gridColumn: '1 / -1',
            order: 10,
            background: 'var(--md-surface-container-high)',
            borderTop: '1px solid var(--md-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // or 'flex-start' with padding
            gap: 24,
            padding: '8px 24px',
            fontSize: '12px',
            color: 'var(--md-on-surface-variant)',
            overflowX: 'auto'
        }}>
            {SHORTCUTS.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{
                        background: 'var(--md-surface-container-highest)',
                        color: 'var(--md-on-surface)',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--md-outline-variant)',
                        minWidth: 24,
                        textAlign: 'center'
                    }}>
                        {s.key}
                    </div>
                    <span>{s.label}</span>
                </div>
            ))}
        </div>
    );
};
