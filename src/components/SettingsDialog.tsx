import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Save, CheckCircle2, AlertCircle, X, Terminal } from 'lucide-react';
import { Button } from './Core';

export interface PrinterConfig {
    pdvNumber: string;
    printerName: string;
    type: 'html' | 'raw';
    rawProtocol: 'zpl' | 'escpos' | 'text';
    width: string;
}

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
    const [config, setConfig] = useState<PrinterConfig>({
        pdvNumber: '001',
        printerName: '',
        type: 'html',
        rawProtocol: 'text',
        width: '80mm'
    });
    const [printers, setPrinters] = useState<{ name: string; displayName: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [storedConfig, printerList] = await Promise.all([
                window.api.getPrinterConfig(),
                window.api.getPrinters()
            ]);

            if (storedConfig) {
                setConfig(prev => ({ ...prev, ...storedConfig }));
            }
            // Electron.PrinterInfo has name and displayName
            setPrinters(printerList.map((p: any) => ({ name: p.name, displayName: p.displayName || p.name })));
        } catch (e) {
            console.error(e);
            setMessage({ text: 'Erro ao carregar configurações', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const success = await window.api.savePrinterConfig(config);
            if (success) {
                setMessage({ text: 'Configurações salvas!', type: 'success' });
                setTimeout(() => onClose(), 1000);
            } else {
                setMessage({ text: 'Erro ao salvar', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Erro ao salvar', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTestPrint = async () => {
        setLoading(true);
        try {
            const content = config.type === 'raw'
                ? (config.rawProtocol === 'zpl' ? '^XA^FO50,50^ADN,36,20^FDTESTE IMPRESSAO^FS^XZ' : 'TESTE DE IMPRESSAO\n----------------\n\n')
                : '<h1>Teste de Impressão</h1><p>Configuração de Impressora</p>';

            const success = await window.api.printData({
                content,
                type: config.type,
                printerName: config.printerName
            });

            if (success) {
                setMessage({ text: 'Teste enviado!', type: 'success' });
            } else {
                setMessage({ text: 'Falha no teste', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Erro no teste', type: 'error' });
        } finally {
            setLoading(false);
        }
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
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            top: '50%', left: '50%', x: '-50%', y: '-50%',
                            width: 500,
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-large)',
                            padding: 24,
                            zIndex: 401,
                            boxShadow: 'var(--elevation-3)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ margin: 0, fontSize: 20 }}>Configuração de Impressão</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* PDV NUMBER */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Número do PDV</label>
                                <input
                                    value={config.pdvNumber}
                                    onChange={e => setConfig({ ...config, pdvNumber: e.target.value })}
                                    style={{
                                        width: '100%', padding: '10px',
                                        background: 'var(--md-surface-container)',
                                        border: '1px solid var(--md-outline)',
                                        borderRadius: 4,
                                        color: 'var(--md-on-surface)'
                                    }}
                                />
                            </div>

                            {/* PRINTER SELECTION */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Impressora</label>
                                <select
                                    value={config.printerName}
                                    onChange={e => setConfig({ ...config, printerName: e.target.value })}
                                    style={{
                                        width: '100%', padding: '10px',
                                        background: 'var(--md-surface-container)',
                                        border: '1px solid var(--md-outline)',
                                        borderRadius: 4,
                                        color: 'var(--md-on-surface)'
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {printers.map(p => (
                                        <option key={p.name} value={p.name}>{p.displayName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* MODE SELECTION */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Modo de Impressão</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            checked={config.type === 'html'}
                                            onChange={() => setConfig({ ...config, type: 'html' })}
                                        />
                                        Driver (HTML)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            checked={config.type === 'raw'}
                                            onChange={() => setConfig({ ...config, type: 'raw' })}
                                        />
                                        Raw (Direto na Porta)
                                    </label>
                                </div>
                            </div>

                            {/* RAW PROTOCOL */}
                            {config.type === 'raw' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Protocolo Raw</label>
                                    <select
                                        value={config.rawProtocol}
                                        onChange={e => setConfig({ ...config, rawProtocol: e.target.value as any })}
                                        style={{
                                            width: '100%', padding: '10px',
                                            background: 'var(--md-surface-container)',
                                            border: '1px solid var(--md-outline)',
                                            borderRadius: 4,
                                            color: 'var(--md-on-surface)'
                                        }}
                                    >
                                        <option value="text">Texto Simples</option>
                                        <option value="escpos">ESC/POS (Epson/Bematech)</option>
                                        <option value="zpl">ZPL (Zebra)</option>
                                    </select>
                                </div>
                            )}

                        </div>

                        {message && (
                            <div style={{
                                marginTop: 16, padding: 8, borderRadius: 4, fontSize: 13,
                                background: message.type === 'success' ? 'var(--md-primary-container)' : 'var(--md-error-container)',
                                color: message.type === 'success' ? 'var(--md-on-primary-container)' : 'var(--md-on-error-container)'
                            }}>
                                {message.text}
                            </div>
                        )}

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button
                                variant="outlined"
                                onClick={handleTestPrint}
                                disabled={!config.printerName || loading}
                            >
                                <Terminal size={16} style={{ marginRight: 8 }} /> Testar
                            </Button>
                            <Button
                                variant="filled"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <Save size={16} style={{ marginRight: 8 }} /> Salvar
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
