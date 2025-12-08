import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Terminal, Printer, RefreshCw, FileText, Building2, Shield, Eye, EyeOff } from 'lucide-react';
import { Button, Card } from './Core';

export interface PrinterConfig {
    pdvNumber: string;
    printerName: string;
    type: 'html' | 'raw';
    rawProtocol: 'zpl' | 'escpos' | 'text';
    width: string;
}

export interface FiscalConfig {
    // Emitente
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    crt: '1' | '2' | '3'; // 1=Simples Nacional, 2=Simples Excesso, 3=Regime Normal
    cnae: string;
    // Endereço
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone: string;
    // NFe/NFCe
    serieNFe: string;
    serieNFCe: string;
    proximoNumeroNFe: string;
    proximoNumeroNFCe: string;
    cIdToken: string;
    csc: string;
    // Tecnospeed
    tecnospeedToken: string;
    tecnospeedAmbiente: 'homologacao' | 'producao';
    // Certificado
    certificadoPath: string;
    certificadoSenha: string;
}

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const defaultFiscalConfig: FiscalConfig = {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    crt: '1',
    cnae: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    codigoMunicipio: '',
    nomeMunicipio: '',
    uf: '',
    cep: '',
    telefone: '',
    serieNFe: '1',
    serieNFCe: '1',
    proximoNumeroNFe: '1',
    proximoNumeroNFCe: '1',
    cIdToken: '',
    csc: '',
    tecnospeedToken: '',
    tecnospeedAmbiente: 'homologacao',
    certificadoPath: '',
    certificadoSenha: '',
};

type TabType = 'printer' | 'fiscal' | 'tecnospeed';

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('printer');
    const [config, setConfig] = useState<PrinterConfig>({
        pdvNumber: '001',
        printerName: '',
        type: 'html',
        rawProtocol: 'escpos',
        width: '80mm'
    });
    const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig>(defaultFiscalConfig);
    const [printers, setPrinters] = useState<{ name: string; displayName: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showToken, setShowToken] = useState(false);
    const [showCertPassword, setShowCertPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [storedConfig, printerList, storedFiscalConfig] = await Promise.all([
                window.api.getPrinterConfig(),
                window.api.getPrinters(),
                window.api.getFiscalConfig?.() || Promise.resolve(null)
            ]);

            if (storedConfig) {
                setConfig(prev => ({ ...prev, ...storedConfig }));
            }
            if (storedFiscalConfig) {
                setFiscalConfig(prev => ({ ...prev, ...storedFiscalConfig }));
            }
            setPrinters(printerList.map((p: any) => ({ name: p.name, displayName: p.displayName || p.name })));
        } catch (e) {
            console.error(e);
            setMessage({ text: 'Erro ao carregar configurações', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const refreshPrinters = async () => {
        setRefreshing(true);
        try {
            const printerList = await window.api.getPrinters();
            setPrinters(printerList.map((p: any) => ({ name: p.name, displayName: p.displayName || p.name })));
            setMessage({ text: 'Lista de impressoras atualizada', type: 'success' });
        } catch (e) {
            setMessage({ text: 'Erro ao atualizar impressoras', type: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const [printerSuccess, fiscalSuccess] = await Promise.all([
                window.api.savePrinterConfig(config),
                window.api.saveFiscalConfig?.(fiscalConfig) || Promise.resolve(true)
            ]);

            if (printerSuccess && fiscalSuccess) {
                setMessage({ text: 'Configurações salvas com sucesso!', type: 'success' });
                setTimeout(() => onClose(), 1200);
            } else {
                setMessage({ text: 'Erro ao salvar configurações', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Erro ao salvar configurações', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatCNPJ = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    const formatCEP = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleTestPrint = async () => {
        if (!config.printerName) {
            setMessage({ text: 'Selecione uma impressora primeiro', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            let content: string;

            if (config.type === 'raw') {
                if (config.rawProtocol === 'zpl') {
                    content = '^XA^FO50,50^ADN,36,20^FDTESTE IMPRESSAO^FS^FO50,100^ADN,18,10^FDConfiguracao OK^FS^XZ';
                } else if (config.rawProtocol === 'escpos') {
                    // ESC/POS: Initialize + Center + Bold + Text + Cut
                    content = '\x1B\x40\x1B\x61\x01\x1B\x45\x01TESTE DE IMPRESSAO\x1B\x45\x00\n\nConfiguracao OK\n\n\n\x1D\x56\x00';
                } else {
                    content = '================================\n      TESTE DE IMPRESSAO\n================================\n\nConfiguracao OK\nData: ' + new Date().toLocaleString('pt-BR') + '\n\n\n\n';
                }
            } else {
                content = `
                    <div style="font-family: monospace; width: ${config.width}; padding: 10px;">
                        <h2 style="text-align: center; margin: 0;">TESTE DE IMPRESSÃO</h2>
                        <hr/>
                        <p style="text-align: center;">Configuração OK</p>
                        <p style="text-align: center; font-size: 12px;">${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                `;
            }

            const success = await window.api.printData({
                content,
                type: config.type,
                printerName: config.printerName
            });

            if (success) {
                setMessage({ text: 'Teste de impressão enviado!', type: 'success' });
            } else {
                setMessage({ text: 'Falha ao enviar teste de impressão', type: 'error' });
            }
        } catch (e) {
            console.error(e);
            setMessage({ text: 'Erro ao enviar teste de impressão', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        background: 'var(--md-surface-container)',
        border: '1px solid var(--md-outline)',
        borderRadius: 'var(--shape-corner-medium)',
        color: 'var(--md-on-surface)',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 8,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--md-on-surface-variant)'
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
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 400
                        }}
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 401,
                            pointerEvents: 'none',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                width: '90%',
                                maxWidth: 700,
                                height: '85vh',
                                minHeight: 500,
                                background: 'var(--md-surface)',
                                borderRadius: 'var(--shape-corner-extra-large)',
                                boxShadow: 'var(--elevation-3)',
                                display: 'flex',
                                flexDirection: 'column',
                                pointerEvents: 'auto',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '20px 24px 0',
                                borderBottom: '1px solid var(--md-outline-variant)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 'var(--shape-corner-medium)',
                                            background: 'var(--md-primary-container)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--md-on-primary-container)'
                                        }}>
                                            {activeTab === 'printer' ? <Printer size={20} /> :
                                                activeTab === 'fiscal' ? <Building2 size={20} /> :
                                                    <Shield size={20} />}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                                                Configurações
                                            </h2>
                                            <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                                {activeTab === 'printer' ? 'Impressora e PDV' :
                                                    activeTab === 'fiscal' ? 'Dados do Emitente' :
                                                        'Tecnospeed & NFe'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--md-on-surface)',
                                            padding: 8,
                                            borderRadius: '50%',
                                            display: 'flex',
                                        }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[
                                        { id: 'printer' as TabType, label: 'Impressora', icon: <Printer size={16} /> },
                                        { id: 'fiscal' as TabType, label: 'Emitente', icon: <Building2 size={16} /> },
                                        { id: 'tecnospeed' as TabType, label: 'NFe/NFCe', icon: <FileText size={16} /> },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '10px 16px',
                                                background: activeTab === tab.id ? 'var(--md-secondary-container)' : 'transparent',
                                                border: 'none',
                                                borderBottom: activeTab === tab.id ? '2px solid var(--md-primary)' : '2px solid transparent',
                                                cursor: 'pointer',
                                                color: activeTab === tab.id ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                                                fontWeight: activeTab === tab.id ? 600 : 400,
                                                fontSize: 13,
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* ============ PRINTER TAB ============ */}
                                {activeTab === 'printer' && (
                                    <>
                                        {/* PDV Number */}
                                        <div>
                                            <label style={labelStyle}>Número do PDV / Caixa</label>
                                            <input
                                                value={config.pdvNumber}
                                                onChange={e => setConfig({ ...config, pdvNumber: e.target.value })}
                                                placeholder="001"
                                                style={inputStyle}
                                            />
                                        </div>

                                        {/* Printer Selection */}
                                        <div>
                                            <label style={labelStyle}>Impressora</label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <select
                                                    value={config.printerName}
                                                    onChange={e => setConfig({ ...config, printerName: e.target.value })}
                                                    style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
                                                >
                                                    <option value="">Selecione uma impressora...</option>
                                                    {printers.map(p => (
                                                        <option key={p.name} value={p.name}>{p.displayName}</option>
                                                    ))}
                                                </select>
                                                <Button
                                                    variant="tonal"
                                                    onClick={refreshPrinters}
                                                    disabled={refreshing}
                                                    style={{ padding: '0 12px' }}
                                                >
                                                    <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                                                </Button>
                                            </div>
                                            {printers.length === 0 && !loading && (
                                                <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 6 }}>
                                                    Nenhuma impressora encontrada. Verifique se está conectada.
                                                </div>
                                            )}
                                        </div>

                                        {/* Print Mode */}
                                        <div>
                                            <label style={labelStyle}>Modo de Impressão</label>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <Card
                                                    variant={config.type === 'html' ? 'filled' : 'outlined'}
                                                    onClick={() => setConfig({ ...config, type: 'html' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 16px',
                                                        cursor: 'pointer',
                                                        background: config.type === 'html' ? 'var(--md-secondary-container)' : 'transparent',
                                                        borderColor: config.type === 'html' ? 'var(--md-secondary)' : undefined,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--md-on-surface)' }}>
                                                        Driver (HTML)
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                        Usa driver do sistema
                                                    </div>
                                                </Card>
                                                <Card
                                                    variant={config.type === 'raw' ? 'filled' : 'outlined'}
                                                    onClick={() => setConfig({ ...config, type: 'raw' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 16px',
                                                        cursor: 'pointer',
                                                        background: config.type === 'raw' ? 'var(--md-secondary-container)' : 'transparent',
                                                        borderColor: config.type === 'raw' ? 'var(--md-secondary)' : undefined,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--md-on-surface)' }}>
                                                        Raw (Direto)
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                        Impressoras térmicas
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Raw Protocol */}
                                        {config.type === 'raw' && (
                                            <div>
                                                <label style={labelStyle}>Protocolo</label>
                                                <select
                                                    value={config.rawProtocol}
                                                    onChange={e => setConfig({ ...config, rawProtocol: e.target.value as any })}
                                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                                >
                                                    <option value="escpos">ESC/POS (Epson, Bematech, Elgin)</option>
                                                    <option value="zpl">ZPL (Zebra)</option>
                                                    <option value="text">Texto Simples</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Paper Width */}
                                        {config.type === 'html' && (
                                            <div>
                                                <label style={labelStyle}>Largura do Papel</label>
                                                <select
                                                    value={config.width}
                                                    onChange={e => setConfig({ ...config, width: e.target.value })}
                                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                                >
                                                    <option value="58mm">58mm (Mini impressora)</option>
                                                    <option value="80mm">80mm (Padrão)</option>
                                                    <option value="A4">A4 (Impressora comum)</option>
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ============ FISCAL TAB ============ */}
                                {activeTab === 'fiscal' && (
                                    <>
                                        {/* Dados da Empresa */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginBottom: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)', marginBottom: 4 }}>
                                                DADOS DA EMPRESA
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                Informações do emitente para documentos fiscais
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>CNPJ</label>
                                                <input
                                                    value={formatCNPJ(fiscalConfig.cnpj)}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, cnpj: e.target.value.replace(/\D/g, '') })}
                                                    placeholder="00.000.000/0000-00"
                                                    maxLength={18}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Razão Social</label>
                                                <input
                                                    value={fiscalConfig.razaoSocial}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, razaoSocial: e.target.value })}
                                                    placeholder="Razão Social da Empresa LTDA"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Nome Fantasia</label>
                                                <input
                                                    value={fiscalConfig.nomeFantasia}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, nomeFantasia: e.target.value })}
                                                    placeholder="Nome Fantasia"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Inscrição Estadual</label>
                                                <input
                                                    value={fiscalConfig.inscricaoEstadual}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, inscricaoEstadual: e.target.value })}
                                                    placeholder="000.000.000.000"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Inscrição Municipal</label>
                                                <input
                                                    value={fiscalConfig.inscricaoMunicipal}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, inscricaoMunicipal: e.target.value })}
                                                    placeholder="000000"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>CRT (Regime Tributário)</label>
                                                <select
                                                    value={fiscalConfig.crt}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, crt: e.target.value as '1' | '2' | '3' })}
                                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                                >
                                                    <option value="1">1 - Simples Nacional</option>
                                                    <option value="2">2 - Simples Nacional - Excesso</option>
                                                    <option value="3">3 - Regime Normal</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>CNAE</label>
                                                <input
                                                    value={fiscalConfig.cnae}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, cnae: e.target.value })}
                                                    placeholder="0000-0/00"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        {/* Endereço */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginTop: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)' }}>
                                                ENDEREÇO
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Logradouro</label>
                                                <input
                                                    value={fiscalConfig.logradouro}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, logradouro: e.target.value })}
                                                    placeholder="Rua, Avenida, etc."
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Número</label>
                                                <input
                                                    value={fiscalConfig.numero}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, numero: e.target.value })}
                                                    placeholder="123"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Complemento</label>
                                                <input
                                                    value={fiscalConfig.complemento}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, complemento: e.target.value })}
                                                    placeholder="Sala 1"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Bairro</label>
                                                <input
                                                    value={fiscalConfig.bairro}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, bairro: e.target.value })}
                                                    placeholder="Centro"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>CEP</label>
                                                <input
                                                    value={formatCEP(fiscalConfig.cep)}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, cep: e.target.value.replace(/\D/g, '') })}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Cidade</label>
                                                <input
                                                    value={fiscalConfig.nomeMunicipio}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, nomeMunicipio: e.target.value })}
                                                    placeholder="São Paulo"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Código IBGE</label>
                                                <input
                                                    value={fiscalConfig.codigoMunicipio}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, codigoMunicipio: e.target.value })}
                                                    placeholder="3550308"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>UF</label>
                                                <select
                                                    value={fiscalConfig.uf}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, uf: e.target.value })}
                                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                                                        <option key={uf} value={uf}>{uf}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Telefone</label>
                                                <input
                                                    value={formatPhone(fiscalConfig.telefone)}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, telefone: e.target.value.replace(/\D/g, '') })}
                                                    placeholder="(00) 00000-0000"
                                                    maxLength={15}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ============ TECNOSPEED TAB ============ */}
                                {activeTab === 'tecnospeed' && (
                                    <>
                                        {/* Tecnospeed API */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginBottom: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)', marginBottom: 4 }}>
                                                TECNOSPEED API
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                Credenciais para emissão de NFe, NFCe e CTe
                                            </div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Token de Acesso</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showToken ? 'text' : 'password'}
                                                    value={fiscalConfig.tecnospeedToken}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, tecnospeedToken: e.target.value })}
                                                    placeholder="Token fornecido pela Tecnospeed"
                                                    style={{ ...inputStyle, paddingRight: 44 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowToken(!showToken)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 8,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--md-on-surface-variant)',
                                                        padding: 4,
                                                    }}
                                                >
                                                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Ambiente</label>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <Card
                                                    variant={fiscalConfig.tecnospeedAmbiente === 'homologacao' ? 'filled' : 'outlined'}
                                                    onClick={() => setFiscalConfig({ ...fiscalConfig, tecnospeedAmbiente: 'homologacao' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 16px',
                                                        cursor: 'pointer',
                                                        background: fiscalConfig.tecnospeedAmbiente === 'homologacao' ? 'var(--md-tertiary-container)' : 'transparent',
                                                        borderColor: fiscalConfig.tecnospeedAmbiente === 'homologacao' ? 'var(--md-tertiary)' : undefined,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--md-on-surface)' }}>
                                                        Homologação
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                        Ambiente de testes
                                                    </div>
                                                </Card>
                                                <Card
                                                    variant={fiscalConfig.tecnospeedAmbiente === 'producao' ? 'filled' : 'outlined'}
                                                    onClick={() => setFiscalConfig({ ...fiscalConfig, tecnospeedAmbiente: 'producao' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 16px',
                                                        cursor: 'pointer',
                                                        background: fiscalConfig.tecnospeedAmbiente === 'producao' ? 'var(--md-secondary-container)' : 'transparent',
                                                        borderColor: fiscalConfig.tecnospeedAmbiente === 'producao' ? 'var(--md-secondary)' : undefined,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--md-on-surface)' }}>
                                                        Produção
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                        Ambiente real
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Numeração */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginTop: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)' }}>
                                                NUMERAÇÃO
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div>
                                                <label style={labelStyle}>Série NF-e</label>
                                                <input
                                                    value={fiscalConfig.serieNFe}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, serieNFe: e.target.value })}
                                                    placeholder="1"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Próximo Nº NF-e</label>
                                                <input
                                                    value={fiscalConfig.proximoNumeroNFe}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, proximoNumeroNFe: e.target.value })}
                                                    placeholder="1"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Série NFC-e</label>
                                                <input
                                                    value={fiscalConfig.serieNFCe}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, serieNFCe: e.target.value })}
                                                    placeholder="1"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Próximo Nº NFC-e</label>
                                                <input
                                                    value={fiscalConfig.proximoNumeroNFCe}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, proximoNumeroNFCe: e.target.value })}
                                                    placeholder="1"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        {/* NFCe - CSC/Token */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginTop: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)', marginBottom: 4 }}>
                                                NFC-e (CÓDIGO DE SEGURANÇA)
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                Necessário para emissão de NFC-e
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div>
                                                <label style={labelStyle}>ID do Token (cIdToken)</label>
                                                <input
                                                    value={fiscalConfig.cIdToken}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, cIdToken: e.target.value })}
                                                    placeholder="000001"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>CSC (Código)</label>
                                                <input
                                                    value={fiscalConfig.csc}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, csc: e.target.value })}
                                                    placeholder="Código fornecido pela SEFAZ"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        {/* Certificado Digital */}
                                        <div style={{
                                            padding: '12px 16px',
                                            background: 'var(--md-surface-container)',
                                            borderRadius: 8,
                                            marginTop: 8
                                        }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--md-primary)', marginBottom: 4 }}>
                                                CERTIFICADO DIGITAL
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--md-on-surface-variant)' }}>
                                                Certificado A1 (.pfx ou .p12)
                                            </div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Caminho do Certificado</label>
                                            <input
                                                value={fiscalConfig.certificadoPath}
                                                onChange={e => setFiscalConfig({ ...fiscalConfig, certificadoPath: e.target.value })}
                                                placeholder="/caminho/para/certificado.pfx"
                                                style={inputStyle}
                                            />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Senha do Certificado</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showCertPassword ? 'text' : 'password'}
                                                    value={fiscalConfig.certificadoSenha}
                                                    onChange={e => setFiscalConfig({ ...fiscalConfig, certificadoSenha: e.target.value })}
                                                    placeholder="Senha do certificado"
                                                    style={{ ...inputStyle, paddingRight: 44 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCertPassword(!showCertPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 8,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--md-on-surface-variant)',
                                                        padding: 4,
                                                    }}
                                                >
                                                    {showCertPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Message */}
                                {message && (
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: 'var(--shape-corner-medium)',
                                        fontSize: 14,
                                        background: message.type === 'success' ? 'var(--md-primary-container)' : 'var(--md-error-container)',
                                        color: message.type === 'success' ? 'var(--md-on-primary-container)' : 'var(--md-on-error-container)'
                                    }}>
                                        {message.text}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--md-outline-variant)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 12
                            }}>
                                {activeTab === 'printer' && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleTestPrint}
                                        disabled={!config.printerName || loading}
                                    >
                                        <Terminal size={16} style={{ marginRight: 8 }} />
                                        Testar Impressão
                                    </Button>
                                )}
                                <Button
                                    variant="filled"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    <Save size={16} style={{ marginRight: 8 }} />
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
