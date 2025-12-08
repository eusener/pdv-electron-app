import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    Send,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Printer,
    Mail,
    Download,
    Archive
} from 'lucide-react';
import { Button } from './Core';

interface SaleData {
    id: string;
    total: number;
    subtotal: number;
    items: Array<{
        id: number;
        name: string;
        price: number;
        qtd: number;
    }>;
    payments: Array<{
        method: string;
        amount: number;
    }>;
    client?: {
        id?: number;
        name: string;
        document?: string;
    };
}

interface EmissaoNFeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    saleData: SaleData | null;
    onEmitirAgora: (saleData: SaleData, options: EmissaoOptions) => Promise<void>;
    onSalvarParaLote: (saleData: SaleData) => void | Promise<void>;
    onPular: () => void;
}

interface EmissaoOptions {
    tipo: 'nfe' | 'nfce';
    imprimirDanfe: boolean;
    enviarEmail: boolean;
    emailDestinatario?: string;
}

export const EmissaoNFeDialog = ({
    isOpen,
    onClose,
    saleData,
    onEmitirAgora,
    onSalvarParaLote,
    onPular,
}: EmissaoNFeDialogProps) => {
    const [isEmitting, setIsEmitting] = useState(false);
    const [emitStatus, setEmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [emitResult, setEmitResult] = useState<{
        chaveAcesso?: string;
        numeroNota?: number;
        danfeUrl?: string;
    } | null>(null);

    // Options state
    const [tipoNota, setTipoNota] = useState<'nfe' | 'nfce'>('nfce');
    const [imprimirDanfe, setImprimirDanfe] = useState(true);
    const [enviarEmail, setEnviarEmail] = useState(false);
    const [emailDestinatario, setEmailDestinatario] = useState('');

    const handleEmitirAgora = async () => {
        if (!saleData) return;

        setIsEmitting(true);
        setEmitStatus('idle');
        setErrorMessage('');

        try {
            await onEmitirAgora(saleData, {
                tipo: tipoNota,
                imprimirDanfe,
                enviarEmail,
                emailDestinatario: enviarEmail ? emailDestinatario : undefined,
            });

            setEmitStatus('success');
            setEmitResult({
                chaveAcesso: '35241012345678000123550010000001231234567890',
                numeroNota: 123,
            });
        } catch (error: any) {
            setEmitStatus('error');
            setErrorMessage(error.message || 'Erro ao emitir nota fiscal');
        } finally {
            setIsEmitting(false);
        }
    };

    const handleSalvarLote = async () => {
        if (saleData) {
            try {
                await onSalvarParaLote(saleData);
            } catch (error) {
                console.error('Erro ao salvar para lote:', error);
            }
        }
        onClose();
    };

    const resetState = () => {
        setIsEmitting(false);
        setEmitStatus('idle');
        setErrorMessage('');
        setEmitResult(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    if (!saleData) return null;

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
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 600,
                        }}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            margin: 'auto',
                            width: '95%',
                            maxWidth: 500,
                            height: 'fit-content',
                            maxHeight: '90vh',
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-5)',
                            zIndex: 601,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: emitStatus === 'success'
                                        ? 'var(--accent-success)'
                                        : emitStatus === 'error'
                                            ? 'var(--md-error)'
                                            : 'var(--md-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {emitStatus === 'success' ? (
                                        <CheckCircle2 size={24} />
                                    ) : emitStatus === 'error' ? (
                                        <AlertTriangle size={24} />
                                    ) : (
                                        <FileText size={24} />
                                    )}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
                                        {emitStatus === 'success'
                                            ? 'Nota Emitida!'
                                            : emitStatus === 'error'
                                                ? 'Erro na Emissão'
                                                : 'Emissão de Nota Fiscal'}
                                    </h2>
                                    <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
                                        Venda #{saleData.id.slice(0, 8)} - R$ {saleData.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                style={{
                                    background: 'var(--md-surface-container-high)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--md-on-surface)',
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24, overflowY: 'auto' }}>
                            {emitStatus === 'idle' && !isEmitting && (
                                <>
                                    {/* Tipo de Nota */}
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'var(--md-on-surface-variant)',
                                            marginBottom: 8,
                                            display: 'block',
                                            textTransform: 'uppercase',
                                        }}>
                                            Tipo de Documento
                                        </label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <OptionButton
                                                selected={tipoNota === 'nfce'}
                                                onClick={() => setTipoNota('nfce')}
                                                label="NFC-e"
                                                description="Nota ao consumidor"
                                            />
                                            <OptionButton
                                                selected={tipoNota === 'nfe'}
                                                onClick={() => setTipoNota('nfe')}
                                                label="NF-e"
                                                description="Nota completa"
                                            />
                                        </div>
                                    </div>

                                    {/* Opções */}
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'var(--md-on-surface-variant)',
                                            marginBottom: 8,
                                            display: 'block',
                                            textTransform: 'uppercase',
                                        }}>
                                            Opções
                                        </label>

                                        <ToggleOption
                                            icon={<Printer size={18} />}
                                            label="Imprimir DANFE"
                                            description="Imprime automaticamente após emissão"
                                            checked={imprimirDanfe}
                                            onChange={setImprimirDanfe}
                                        />

                                        <ToggleOption
                                            icon={<Mail size={18} />}
                                            label="Enviar por e-mail"
                                            description="Envia XML e DANFE ao cliente"
                                            checked={enviarEmail}
                                            onChange={setEnviarEmail}
                                        />

                                        {enviarEmail && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                style={{ marginTop: 8, marginLeft: 44 }}
                                            >
                                                <input
                                                    type="email"
                                                    value={emailDestinatario}
                                                    onChange={(e) => setEmailDestinatario(e.target.value)}
                                                    placeholder="email@cliente.com"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        borderRadius: 8,
                                                        border: '1px solid var(--md-outline-variant)',
                                                        background: 'var(--md-surface-container-highest)',
                                                        color: 'var(--md-on-surface)',
                                                        fontSize: 14,
                                                        outline: 'none',
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Info do cliente */}
                                    {saleData.client && (
                                        <div style={{
                                            padding: 12,
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginBottom: 20,
                                        }}>
                                            <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
                                                Cliente
                                            </div>
                                            <div style={{ fontWeight: 500 }}>{saleData.client.name}</div>
                                            {saleData.client.document && (
                                                <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
                                                    {saleData.client.document}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {isEmitting && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 40,
                                }}>
                                    <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--md-primary)' }} />
                                    <p style={{ marginTop: 16, color: 'var(--md-on-surface-variant)' }}>
                                        Emitindo nota fiscal...
                                    </p>
                                </div>
                            )}

                            {emitStatus === 'success' && emitResult && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'var(--accent-success)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <CheckCircle2 size={40} />
                                    </div>

                                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
                                        Nota Fiscal Emitida
                                    </h3>

                                    <p style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 16px 0' }}>
                                        Número: {emitResult.numeroNota}
                                    </p>

                                    <div style={{
                                        width: '100%',
                                        padding: 12,
                                        background: 'var(--md-surface-container)',
                                        borderRadius: 8,
                                        marginBottom: 16,
                                    }}>
                                        <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>
                                            Chave de Acesso
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            fontFamily: 'monospace',
                                            wordBreak: 'break-all',
                                        }}>
                                            {emitResult.chaveAcesso}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                        <Button
                                            variant="tonal"
                                            onClick={() => {/* Download DANFE */ }}
                                            style={{ flex: 1 }}
                                        >
                                            <Download size={16} style={{ marginRight: 8 }} />
                                            DANFE
                                        </Button>
                                        <Button
                                            variant="tonal"
                                            onClick={() => {/* Download XML */ }}
                                            style={{ flex: 1 }}
                                        >
                                            <Download size={16} style={{ marginRight: 8 }} />
                                            XML
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {emitStatus === 'error' && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'var(--md-error-container)',
                                        color: 'var(--md-on-error-container)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                    }}>
                                        <AlertTriangle size={40} />
                                    </div>

                                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
                                        Erro na Emissão
                                    </h3>

                                    <p style={{ color: 'var(--md-error)', margin: '0 0 16px 0' }}>
                                        {errorMessage}
                                    </p>

                                    <Button
                                        variant="tonal"
                                        onClick={() => {
                                            setEmitStatus('idle');
                                            setErrorMessage('');
                                        }}
                                    >
                                        Tentar Novamente
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {emitStatus === 'idle' && !isEmitting && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--md-outline-variant)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}>
                                <Button
                                    variant="filled"
                                    onClick={handleEmitirAgora}
                                    style={{ width: '100%' }}
                                >
                                    <Send size={18} style={{ marginRight: 8 }} />
                                    Emitir Agora
                                </Button>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        variant="tonal"
                                        onClick={handleSalvarLote}
                                        style={{ flex: 1 }}
                                    >
                                        <Archive size={18} style={{ marginRight: 8 }} />
                                        Salvar p/ Lote
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => {
                                            onPular();
                                            handleClose();
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        <Clock size={18} style={{ marginRight: 8 }} />
                                        Pular
                                    </Button>
                                </div>
                            </div>
                        )}

                        {emitStatus === 'success' && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--md-outline-variant)',
                            }}>
                                <Button
                                    variant="filled"
                                    onClick={handleClose}
                                    style={{ width: '100%' }}
                                >
                                    Concluir
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Helper Components
const OptionButton = ({
    selected,
    onClick,
    label,
    description,
}: {
    selected: boolean;
    onClick: () => void;
    label: string;
    description: string;
}) => (
    <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: selected ? '2px solid var(--md-primary)' : '1px solid var(--md-outline-variant)',
            background: selected ? 'var(--md-primary-container)' : 'var(--md-surface-container)',
            color: selected ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
            cursor: 'pointer',
            textAlign: 'left',
        }}
    >
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{description}</div>
    </motion.button>
);

const ToggleOption = ({
    icon,
    label,
    description,
    checked,
    onChange,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <div
        onClick={() => onChange(!checked)}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            cursor: 'pointer',
            borderBottom: '1px solid var(--md-outline-variant)',
        }}
    >
        <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: checked ? 'var(--md-primary-container)' : 'var(--md-surface-container-high)',
            color: checked ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>{description}</div>
        </div>
        <motion.div
            animate={{ background: checked ? 'var(--md-primary)' : 'var(--md-surface-container-highest)' }}
            style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                padding: 2,
                cursor: 'pointer',
            }}
        >
            <motion.div
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: checked ? 'var(--md-on-primary)' : 'var(--md-outline)',
                }}
            />
        </motion.div>
    </div>
);

export default EmissaoNFeDialog;
