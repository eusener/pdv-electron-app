import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    Building2,
    User,
    Package,
    Calculator,
    Truck,
    MessageSquare,
    Send,
    Save,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ChevronRight,
    Search,
    Plus,
    Trash2,
    Edit3
} from 'lucide-react';
import { Button } from './Core';

// Types
interface NFeEmitente {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    inscricaoMunicipal?: string;
    cnae?: string;
    crt: '1' | '2' | '3'; // 1=Simples, 2=Simples Excesso, 3=Normal
    endereco: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
        codigoMunicipio: string;
    };
}

interface NFeDestinatario {
    tipo: 'cpf' | 'cnpj' | 'estrangeiro';
    documento: string;
    nome: string;
    email?: string;
    telefone?: string;
    inscricaoEstadual?: string;
    endereco?: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
        codigoMunicipio: string;
    };
}

interface NFeItem {
    id: number;
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    // Impostos
    icmsOrigem: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
    icmsCST: string;
    icmsBase?: number;
    icmsAliquota?: number;
    icmsValor?: number;
    pisCST: string;
    pisBase?: number;
    pisAliquota?: number;
    pisValor?: number;
    cofinsCST: string;
    cofinsBase?: number;
    cofinsAliquota?: number;
    cofinsValor?: number;
}

interface NFeTransporte {
    modalidade: '0' | '1' | '2' | '9'; // 0=Emitente, 1=Destinatário, 2=Terceiros, 9=Sem Frete
    transportadora?: {
        cnpj?: string;
        nome?: string;
        inscricaoEstadual?: string;
        endereco?: string;
        cidade?: string;
        uf?: string;
    };
    veiculo?: {
        placa?: string;
        uf?: string;
        rntc?: string;
    };
    volumes?: {
        quantidade?: number;
        especie?: string;
        marca?: string;
        numeracao?: string;
        pesoLiquido?: number;
        pesoBruto?: number;
    };
}

interface NFeData {
    naturezaOperacao: string;
    tipoOperacao: '0' | '1'; // 0=Entrada, 1=Saída
    finalidade: '1' | '2' | '3' | '4'; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    consumidorFinal: '0' | '1';
    presenca: '0' | '1' | '2' | '3' | '4' | '5' | '9';
    emitente: NFeEmitente;
    destinatario?: NFeDestinatario;
    items: NFeItem[];
    transporte: NFeTransporte;
    informacoesAdicionais?: string;
    informacoesFisco?: string;
}

interface NFeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialItems?: Array<{
        id: number;
        name: string;
        price: number;
        qtd: number;
    }>;
    onEmit?: (nfeData: NFeData) => Promise<void>;
}

type TabId = 'emitente' | 'destinatario' | 'produtos' | 'totais' | 'transporte' | 'info';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'emitente', label: 'Emitente', icon: <Building2 size={18} /> },
    { id: 'destinatario', label: 'Destinatário', icon: <User size={18} /> },
    { id: 'produtos', label: 'Produtos', icon: <Package size={18} /> },
    { id: 'totais', label: 'Totais', icon: <Calculator size={18} /> },
    { id: 'transporte', label: 'Transporte', icon: <Truck size={18} /> },
    { id: 'info', label: 'Informações', icon: <MessageSquare size={18} /> },
];

const UF_OPTIONS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
];

const CFOP_OPTIONS = [
    { value: '5102', label: '5102 - Venda de mercadoria' },
    { value: '5405', label: '5405 - Venda ST dentro do estado' },
    { value: '5949', label: '5949 - Outra saída não especificada' },
    { value: '6102', label: '6102 - Venda interestadual' },
];

const ICMS_CST_OPTIONS = [
    { value: '00', label: '00 - Tributada integralmente' },
    { value: '10', label: '10 - Tributada com cobrança de ICMS ST' },
    { value: '20', label: '20 - Com redução de base de cálculo' },
    { value: '40', label: '40 - Isenta' },
    { value: '41', label: '41 - Não tributada' },
    { value: '60', label: '60 - ICMS cobrado anteriormente por ST' },
    { value: '90', label: '90 - Outros' },
];

const ICMS_CSOSN_OPTIONS = [
    { value: '101', label: '101 - Tributada com permissão de crédito' },
    { value: '102', label: '102 - Tributada sem permissão de crédito' },
    { value: '103', label: '103 - Isenção de ICMS para faixa de receita bruta' },
    { value: '201', label: '201 - Tributada com permissão de crédito e ST' },
    { value: '202', label: '202 - Tributada sem permissão de crédito e ST' },
    { value: '300', label: '300 - Imune' },
    { value: '400', label: '400 - Não tributada' },
    { value: '500', label: '500 - ICMS cobrado anteriormente por ST' },
    { value: '900', label: '900 - Outros' },
];

const PIS_COFINS_CST_OPTIONS = [
    { value: '01', label: '01 - Operação tributável (alíquota básica)' },
    { value: '02', label: '02 - Operação tributável (alíquota diferenciada)' },
    { value: '04', label: '04 - Operação tributável (ST)' },
    { value: '06', label: '06 - Operação tributável (alíquota zero)' },
    { value: '07', label: '07 - Operação isenta' },
    { value: '08', label: '08 - Operação sem incidência' },
    { value: '09', label: '09 - Operação com suspensão' },
    { value: '49', label: '49 - Outras operações de saída' },
    { value: '99', label: '99 - Outras operações' },
];

// Default emitente (would come from settings in production)
const DEFAULT_EMITENTE: NFeEmitente = {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    crt: '1',
    endereco: {
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: 'SP',
        cep: '',
        codigoMunicipio: '',
    }
};

export const NFeDialog = ({ isOpen, onClose, initialItems = [], onEmit }: NFeDialogProps) => {
    const [activeTab, setActiveTab] = useState<TabId>('emitente');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Form state
    const [emitente, setEmitente] = useState<NFeEmitente>(DEFAULT_EMITENTE);
    const [destinatario, setDestinatario] = useState<NFeDestinatario | null>(null);
    const [hasDestinatario, setHasDestinatario] = useState(false);
    const [items, setItems] = useState<NFeItem[]>(() =>
        initialItems.map((item, index) => ({
            id: item.id,
            codigo: String(item.id).padStart(6, '0'),
            descricao: item.name,
            ncm: '00000000',
            cfop: '5102',
            unidade: 'UN',
            quantidade: item.qtd,
            valorUnitario: item.price,
            valorTotal: item.price * item.qtd,
            icmsOrigem: '0',
            icmsCST: '102',
            pisCST: '49',
            cofinsCST: '49',
        }))
    );
    const [transporte, setTransporte] = useState<NFeTransporte>({ modalidade: '9' });
    const [naturezaOperacao, setNaturezaOperacao] = useState('VENDA DE MERCADORIA');
    const [infoAdicionais, setInfoAdicionais] = useState('');
    const [infoFisco, setInfoFisco] = useState('');

    // Edit item modal
    const [editingItem, setEditingItem] = useState<NFeItem | null>(null);

    // Calculations
    const totals = useMemo(() => {
        const produtos = items.reduce((acc, item) => acc + item.valorTotal, 0);
        const icms = items.reduce((acc, item) => acc + (item.icmsValor || 0), 0);
        const pis = items.reduce((acc, item) => acc + (item.pisValor || 0), 0);
        const cofins = items.reduce((acc, item) => acc + (item.cofinsValor || 0), 0);
        const total = produtos;
        return { produtos, icms, pis, cofins, total };
    }, [items]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            // Validation
            if (!emitente.cnpj || !emitente.razaoSocial) {
                throw new Error('Dados do emitente incompletos');
            }
            if (items.length === 0) {
                throw new Error('Adicione pelo menos um produto');
            }

            const nfeData: NFeData = {
                naturezaOperacao,
                tipoOperacao: '1',
                finalidade: '1',
                consumidorFinal: '1',
                presenca: '1',
                emitente,
                destinatario: hasDestinatario ? destinatario! : undefined,
                items,
                transporte,
                informacoesAdicionais: infoAdicionais || undefined,
                informacoesFisco: infoFisco || undefined,
            };

            if (onEmit) {
                await onEmit(nfeData);
            }

            setSubmitStatus('success');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            setSubmitStatus('error');
            setErrorMessage(error.message || 'Erro ao emitir NFe');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateItem = (id: number, updates: Partial<NFeItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            // Recalculate total
            updated.valorTotal = updated.quantidade * updated.valorUnitario;
            return updated;
        }));
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'emitente':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SectionTitle>Dados do Emitente</SectionTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormField
                                label="CNPJ *"
                                value={emitente.cnpj}
                                onChange={(v) => setEmitente({ ...emitente, cnpj: v })}
                                placeholder="00.000.000/0000-00"
                            />
                            <FormField
                                label="Inscrição Estadual *"
                                value={emitente.inscricaoEstadual}
                                onChange={(v) => setEmitente({ ...emitente, inscricaoEstadual: v })}
                                placeholder="000.000.000.000"
                            />
                        </div>

                        <FormField
                            label="Razão Social *"
                            value={emitente.razaoSocial}
                            onChange={(v) => setEmitente({ ...emitente, razaoSocial: v })}
                            placeholder="Nome empresarial completo"
                        />

                        <FormField
                            label="Nome Fantasia"
                            value={emitente.nomeFantasia}
                            onChange={(v) => setEmitente({ ...emitente, nomeFantasia: v })}
                            placeholder="Nome fantasia"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Inscrição Municipal"
                                value={emitente.inscricaoMunicipal || ''}
                                onChange={(v) => setEmitente({ ...emitente, inscricaoMunicipal: v })}
                            />
                            <FormSelect
                                label="CRT *"
                                value={emitente.crt}
                                onChange={(v) => setEmitente({ ...emitente, crt: v as '1' | '2' | '3' })}
                                options={[
                                    { value: '1', label: '1 - Simples Nacional' },
                                    { value: '2', label: '2 - Simples Nacional (Excesso)' },
                                    { value: '3', label: '3 - Regime Normal' },
                                ]}
                            />
                        </div>

                        <SectionTitle>Endereço</SectionTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 12 }}>
                            <FormField
                                label="Logradouro *"
                                value={emitente.endereco.logradouro}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, logradouro: v }
                                })}
                            />
                            <FormField
                                label="Número *"
                                value={emitente.endereco.numero}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, numero: v }
                                })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Complemento"
                                value={emitente.endereco.complemento || ''}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, complemento: v }
                                })}
                            />
                            <FormField
                                label="Bairro *"
                                value={emitente.endereco.bairro}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, bairro: v }
                                })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Cidade *"
                                value={emitente.endereco.cidade}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, cidade: v }
                                })}
                            />
                            <FormSelect
                                label="UF *"
                                value={emitente.endereco.uf}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, uf: v }
                                })}
                                options={UF_OPTIONS.map(uf => ({ value: uf, label: uf }))}
                            />
                            <FormField
                                label="CEP *"
                                value={emitente.endereco.cep}
                                onChange={(v) => setEmitente({
                                    ...emitente,
                                    endereco: { ...emitente.endereco, cep: v }
                                })}
                                placeholder="00000-000"
                            />
                        </div>

                        <FormField
                            label="Código do Município (IBGE)"
                            value={emitente.endereco.codigoMunicipio}
                            onChange={(v) => setEmitente({
                                ...emitente,
                                endereco: { ...emitente.endereco, codigoMunicipio: v }
                            })}
                            placeholder="7 dígitos"
                        />
                    </div>
                );

            case 'destinatario':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: 'var(--md-surface-container)',
                            borderRadius: 'var(--shape-corner-medium)',
                        }}>
                            <span style={{ fontSize: 14 }}>Incluir destinatário na nota?</span>
                            <ToggleSwitch
                                checked={hasDestinatario}
                                onChange={setHasDestinatario}
                            />
                        </div>

                        {hasDestinatario && (
                            <>
                                <SectionTitle>Dados do Destinatário</SectionTitle>

                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    {(['cpf', 'cnpj', 'estrangeiro'] as const).map(tipo => (
                                        <motion.button
                                            key={tipo}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setDestinatario(prev => ({
                                                ...prev!,
                                                tipo,
                                                documento: '',
                                                nome: prev?.nome || '',
                                            }))}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 20,
                                                border: 'none',
                                                background: destinatario?.tipo === tipo
                                                    ? 'var(--md-primary)'
                                                    : 'var(--md-surface-container-high)',
                                                color: destinatario?.tipo === tipo
                                                    ? 'var(--md-on-primary)'
                                                    : 'var(--md-on-surface)',
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {tipo === 'cpf' ? 'CPF' : tipo === 'cnpj' ? 'CNPJ' : 'Estrangeiro'}
                                        </motion.button>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label={destinatario?.tipo === 'cpf' ? 'CPF *' : destinatario?.tipo === 'cnpj' ? 'CNPJ *' : 'ID Estrangeiro'}
                                        value={destinatario?.documento || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            documento: v
                                        }))}
                                        placeholder={destinatario?.tipo === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                                    />
                                    {destinatario?.tipo === 'cnpj' && (
                                        <FormField
                                            label="Inscrição Estadual"
                                            value={destinatario?.inscricaoEstadual || ''}
                                            onChange={(v) => setDestinatario(prev => ({
                                                ...prev!,
                                                inscricaoEstadual: v
                                            }))}
                                        />
                                    )}
                                </div>

                                <FormField
                                    label="Nome/Razão Social *"
                                    value={destinatario?.nome || ''}
                                    onChange={(v) => setDestinatario(prev => ({
                                        ...prev!,
                                        nome: v
                                    }))}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="E-mail"
                                        value={destinatario?.email || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            email: v
                                        }))}
                                        placeholder="email@exemplo.com"
                                    />
                                    <FormField
                                        label="Telefone"
                                        value={destinatario?.telefone || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            telefone: v
                                        }))}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <SectionTitle>Endereço do Destinatário</SectionTitle>

                                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="Logradouro"
                                        value={destinatario?.endereco?.logradouro || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            endereco: { ...prev?.endereco!, logradouro: v }
                                        }))}
                                    />
                                    <FormField
                                        label="Número"
                                        value={destinatario?.endereco?.numero || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            endereco: { ...prev?.endereco!, numero: v }
                                        }))}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="Bairro"
                                        value={destinatario?.endereco?.bairro || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            endereco: { ...prev?.endereco!, bairro: v }
                                        }))}
                                    />
                                    <FormField
                                        label="Cidade"
                                        value={destinatario?.endereco?.cidade || ''}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            endereco: { ...prev?.endereco!, cidade: v }
                                        }))}
                                    />
                                    <FormSelect
                                        label="UF"
                                        value={destinatario?.endereco?.uf || 'SP'}
                                        onChange={(v) => setDestinatario(prev => ({
                                            ...prev!,
                                            endereco: { ...prev?.endereco!, uf: v }
                                        }))}
                                        options={UF_OPTIONS.map(uf => ({ value: uf, label: uf }))}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'produtos':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <SectionTitle>Produtos/Serviços ({items.length})</SectionTitle>
                            <Button
                                variant="tonal"
                                onClick={() => {
                                    const newId = Math.max(0, ...items.map(i => i.id)) + 1;
                                    setItems([...items, {
                                        id: newId,
                                        codigo: String(newId).padStart(6, '0'),
                                        descricao: 'Novo Produto',
                                        ncm: '00000000',
                                        cfop: '5102',
                                        unidade: 'UN',
                                        quantidade: 1,
                                        valorUnitario: 0,
                                        valorTotal: 0,
                                        icmsOrigem: '0',
                                        icmsCST: '102',
                                        pisCST: '49',
                                        cofinsCST: '49',
                                    }]);
                                }}
                                style={{ padding: '8px 12px' }}
                            >
                                <Plus size={16} style={{ marginRight: 6 }} /> Adicionar
                            </Button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            maxHeight: 400,
                            overflowY: 'auto',
                        }}>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 12,
                                        background: 'var(--md-surface-container)',
                                        borderRadius: 'var(--shape-corner-medium)',
                                        border: '1px solid var(--md-outline-variant)',
                                    }}
                                >
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: 'var(--md-primary-container)',
                                        color: 'var(--md-on-primary-container)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}>
                                        {index + 1}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 500,
                                            fontSize: 14,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {item.descricao}
                                        </div>
                                        <div style={{
                                            fontSize: 12,
                                            color: 'var(--md-on-surface-variant)',
                                            display: 'flex',
                                            gap: 8,
                                        }}>
                                            <span>NCM: {item.ncm}</span>
                                            <span>CFOP: {item.cfop}</span>
                                            <span>CST: {item.icmsCST}</span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                                        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                            {item.quantidade} x R$ {item.valorUnitario.toFixed(2)}
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--md-primary)' }}>
                                            R$ {item.valorTotal.toFixed(2)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setEditingItem(item)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                border: 'none',
                                                background: 'var(--md-surface-container-high)',
                                                color: 'var(--md-on-surface)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Edit3 size={14} />
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => removeItem(item.id)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                border: 'none',
                                                background: 'var(--md-error-container)',
                                                color: 'var(--md-on-error-container)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {items.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: 40,
                                color: 'var(--md-on-surface-variant)',
                            }}>
                                <Package size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>Nenhum produto adicionado</p>
                            </div>
                        )}
                    </div>
                );

            case 'totais':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SectionTitle>Totais da Nota</SectionTitle>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 12,
                        }}>
                            <TotalCard label="Total Produtos" value={totals.produtos} />
                            <TotalCard label="Total ICMS" value={totals.icms} />
                            <TotalCard label="Total PIS" value={totals.pis} />
                            <TotalCard label="Total COFINS" value={totals.cofins} />
                        </div>

                        <div style={{
                            padding: 20,
                            background: 'var(--md-primary-container)',
                            borderRadius: 'var(--shape-corner-large)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{
                                fontSize: 18,
                                fontWeight: 500,
                                color: 'var(--md-on-primary-container)',
                            }}>
                                Total da Nota
                            </span>
                            <span style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: 'var(--md-on-primary-container)',
                            }}>
                                R$ {totals.total.toFixed(2)}
                            </span>
                        </div>

                        <SectionTitle>Configurações da Nota</SectionTitle>

                        <FormField
                            label="Natureza da Operação"
                            value={naturezaOperacao}
                            onChange={setNaturezaOperacao}
                            placeholder="Ex: VENDA DE MERCADORIA"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormSelect
                                label="Finalidade"
                                value="1"
                                onChange={() => { }}
                                options={[
                                    { value: '1', label: '1 - NF-e Normal' },
                                    { value: '2', label: '2 - NF-e Complementar' },
                                    { value: '3', label: '3 - NF-e de Ajuste' },
                                    { value: '4', label: '4 - Devolução/Retorno' },
                                ]}
                            />
                            <FormSelect
                                label="Presença do Comprador"
                                value="1"
                                onChange={() => { }}
                                options={[
                                    { value: '0', label: '0 - Não se aplica' },
                                    { value: '1', label: '1 - Presencial' },
                                    { value: '2', label: '2 - Internet' },
                                    { value: '3', label: '3 - Telemarketing' },
                                    { value: '4', label: '4 - NFC-e entrega domicílio' },
                                    { value: '5', label: '5 - Presencial fora estabelecimento' },
                                    { value: '9', label: '9 - Outros' },
                                ]}
                            />
                        </div>
                    </div>
                );

            case 'transporte':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SectionTitle>Modalidade do Frete</SectionTitle>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {[
                                { value: '0', label: 'Por conta do Emitente' },
                                { value: '1', label: 'Por conta do Destinatário' },
                                { value: '2', label: 'Por conta de Terceiros' },
                                { value: '9', label: 'Sem Frete' },
                            ].map(opt => (
                                <motion.button
                                    key={opt.value}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setTransporte({ ...transporte, modalidade: opt.value as any })}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: 20,
                                        border: 'none',
                                        background: transporte.modalidade === opt.value
                                            ? 'var(--md-primary)'
                                            : 'var(--md-surface-container-high)',
                                        color: transporte.modalidade === opt.value
                                            ? 'var(--md-on-primary)'
                                            : 'var(--md-on-surface)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                    }}
                                >
                                    {opt.label}
                                </motion.button>
                            ))}
                        </div>

                        {transporte.modalidade !== '9' && (
                            <>
                                <SectionTitle>Dados da Transportadora</SectionTitle>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="CNPJ"
                                        value={transporte.transportadora?.cnpj || ''}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            transportadora: { ...transporte.transportadora, cnpj: v }
                                        })}
                                    />
                                    <FormField
                                        label="Inscrição Estadual"
                                        value={transporte.transportadora?.inscricaoEstadual || ''}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            transportadora: { ...transporte.transportadora, inscricaoEstadual: v }
                                        })}
                                    />
                                </div>

                                <FormField
                                    label="Nome/Razão Social"
                                    value={transporte.transportadora?.nome || ''}
                                    onChange={(v) => setTransporte({
                                        ...transporte,
                                        transportadora: { ...transporte.transportadora, nome: v }
                                    })}
                                />

                                <SectionTitle>Veículo</SectionTitle>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="Placa"
                                        value={transporte.veiculo?.placa || ''}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            veiculo: { ...transporte.veiculo, placa: v }
                                        })}
                                        placeholder="AAA-0000"
                                    />
                                    <FormSelect
                                        label="UF"
                                        value={transporte.veiculo?.uf || 'SP'}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            veiculo: { ...transporte.veiculo, uf: v }
                                        })}
                                        options={UF_OPTIONS.map(uf => ({ value: uf, label: uf }))}
                                    />
                                    <FormField
                                        label="RNTC"
                                        value={transporte.veiculo?.rntc || ''}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            veiculo: { ...transporte.veiculo, rntc: v }
                                        })}
                                    />
                                </div>

                                <SectionTitle>Volumes</SectionTitle>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <FormField
                                        label="Quantidade"
                                        value={String(transporte.volumes?.quantidade || '')}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            volumes: { ...transporte.volumes, quantidade: parseInt(v) || 0 }
                                        })}
                                        type="number"
                                    />
                                    <FormField
                                        label="Espécie"
                                        value={transporte.volumes?.especie || ''}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            volumes: { ...transporte.volumes, especie: v }
                                        })}
                                        placeholder="Ex: CAIXA"
                                    />
                                    <FormField
                                        label="Peso Bruto (kg)"
                                        value={String(transporte.volumes?.pesoBruto || '')}
                                        onChange={(v) => setTransporte({
                                            ...transporte,
                                            volumes: { ...transporte.volumes, pesoBruto: parseFloat(v) || 0 }
                                        })}
                                        type="number"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'info':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SectionTitle>Informações Complementares</SectionTitle>

                        <FormTextArea
                            label="Informações Adicionais de Interesse do Contribuinte"
                            value={infoAdicionais}
                            onChange={setInfoAdicionais}
                            placeholder="Informações que serão impressas no DANFE..."
                            rows={4}
                        />

                        <FormTextArea
                            label="Informações Adicionais de Interesse do Fisco"
                            value={infoFisco}
                            onChange={setInfoFisco}
                            placeholder="Informações para o fisco (não aparecem no DANFE)..."
                            rows={4}
                        />

                        <div style={{
                            padding: 16,
                            background: 'var(--md-surface-container)',
                            borderRadius: 'var(--shape-corner-medium)',
                            fontSize: 13,
                            color: 'var(--md-on-surface-variant)',
                        }}>
                            <strong>Dica:</strong> Use as informações adicionais para incluir dados como
                            número do pedido, observações de entrega, ou referências de documentos fiscais.
                        </div>
                    </div>
                );

            default:
                return null;
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
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 500,
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
                            maxWidth: 900,
                            height: 'fit-content',
                            maxHeight: '90vh',
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-5)',
                            zIndex: 501,
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
                                    background: 'var(--md-primary)',
                                    color: 'var(--md-on-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>
                                        Emissão de NF-e
                                    </h2>
                                    <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
                                        Nota Fiscal Eletrônica - Modelo 55
                                    </span>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                style={{
                                    background: 'var(--md-surface-container-high)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--md-on-surface)',
                                }}
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            gap: 4,
                            padding: '12px 24px',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            overflowX: 'auto',
                        }}>
                            {TABS.map(tab => (
                                <motion.button
                                    key={tab.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 16px',
                                        borderRadius: 'var(--shape-corner-full)',
                                        border: 'none',
                                        background: activeTab === tab.id
                                            ? 'var(--md-primary-container)'
                                            : 'transparent',
                                        color: activeTab === tab.id
                                            ? 'var(--md-on-primary-container)'
                                            : 'var(--md-on-surface-variant)',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 24,
                        }}>
                            {renderTabContent()}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--md-surface-container-low)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {submitStatus === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: 'var(--accent-success)',
                                            fontSize: 14,
                                        }}
                                    >
                                        <CheckCircle2 size={18} />
                                        NF-e emitida com sucesso!
                                    </motion.div>
                                )}
                                {submitStatus === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: 'var(--md-error)',
                                            fontSize: 14,
                                        }}
                                    >
                                        <AlertTriangle size={18} />
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <Button variant="text" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="tonal"
                                    onClick={() => {
                                        // Save draft logic
                                        console.log('Saving draft...');
                                    }}
                                >
                                    <Save size={18} style={{ marginRight: 8 }} />
                                    Salvar Rascunho
                                </Button>
                                <Button
                                    variant="filled"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
                                            Emitindo...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} style={{ marginRight: 8 }} />
                                            Emitir NF-e
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Item Edit Modal */}
                    <ItemEditModal
                        item={editingItem}
                        onClose={() => setEditingItem(null)}
                        onSave={(updated) => {
                            updateItem(updated.id, updated);
                            setEditingItem(null);
                        }}
                        isSimples={emitente.crt === '1' || emitente.crt === '2'}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

// Helper Components
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 style={{
        margin: '8px 0',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--md-primary)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }}>
        {children}
    </h3>
);

const FormField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--md-outline-variant)',
                background: disabled ? 'var(--md-surface-container)' : 'var(--md-surface-container-highest)',
                color: 'var(--md-on-surface)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
            }}
        />
    </div>
);

const FormSelect = ({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container-highest)',
                color: 'var(--md-on-surface)',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const FormTextArea = ({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>
            {label}
        </label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--md-outline-variant)',
                background: 'var(--md-surface-container-highest)',
                color: 'var(--md-on-surface)',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
            }}
        />
    </div>
);

const ToggleSwitch = ({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <motion.button
        onClick={() => onChange(!checked)}
        style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            padding: 2,
            border: 'none',
            background: checked ? 'var(--md-primary)' : 'var(--md-surface-container-highest)',
            cursor: 'pointer',
            position: 'relative',
        }}
    >
        <motion.div
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: checked ? 'var(--md-on-primary)' : 'var(--md-outline)',
            }}
        />
    </motion.button>
);

const TotalCard = ({ label, value }: { label: string; value: number }) => (
    <div style={{
        padding: 16,
        background: 'var(--md-surface-container)',
        borderRadius: 'var(--shape-corner-medium)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }}>
        <span style={{ fontSize: 14, color: 'var(--md-on-surface-variant)' }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--md-on-surface)' }}>
            R$ {value.toFixed(2)}
        </span>
    </div>
);

// Item Edit Modal
const ItemEditModal = ({
    item,
    onClose,
    onSave,
    isSimples,
}: {
    item: NFeItem | null;
    onClose: () => void;
    onSave: (item: NFeItem) => void;
    isSimples: boolean;
}) => {
    const [editedItem, setEditedItem] = useState<NFeItem | null>(null);

    React.useEffect(() => {
        setEditedItem(item);
    }, [item]);

    if (!item || !editedItem) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 600,
                }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 600,
                    maxHeight: '80vh',
                    background: 'var(--md-surface)',
                    borderRadius: 'var(--shape-corner-large)',
                    boxShadow: 'var(--elevation-4)',
                    zIndex: 601,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--md-outline-variant)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Editar Produto</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--md-on-surface)',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <FormField
                            label="Descrição do Produto"
                            value={editedItem.descricao}
                            onChange={(v) => setEditedItem({ ...editedItem, descricao: v })}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Código"
                                value={editedItem.codigo}
                                onChange={(v) => setEditedItem({ ...editedItem, codigo: v })}
                            />
                            <FormField
                                label="NCM"
                                value={editedItem.ncm}
                                onChange={(v) => setEditedItem({ ...editedItem, ncm: v })}
                                placeholder="8 dígitos"
                            />
                            <FormSelect
                                label="CFOP"
                                value={editedItem.cfop}
                                onChange={(v) => setEditedItem({ ...editedItem, cfop: v })}
                                options={CFOP_OPTIONS}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Unidade"
                                value={editedItem.unidade}
                                onChange={(v) => setEditedItem({ ...editedItem, unidade: v })}
                            />
                            <FormField
                                label="Quantidade"
                                value={String(editedItem.quantidade)}
                                onChange={(v) => setEditedItem({
                                    ...editedItem,
                                    quantidade: parseFloat(v) || 0,
                                    valorTotal: (parseFloat(v) || 0) * editedItem.valorUnitario
                                })}
                                type="number"
                            />
                            <FormField
                                label="Valor Unitário"
                                value={String(editedItem.valorUnitario)}
                                onChange={(v) => setEditedItem({
                                    ...editedItem,
                                    valorUnitario: parseFloat(v) || 0,
                                    valorTotal: editedItem.quantidade * (parseFloat(v) || 0)
                                })}
                                type="number"
                            />
                        </div>

                        <SectionTitle>Tributação ICMS</SectionTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormSelect
                                label="Origem"
                                value={editedItem.icmsOrigem}
                                onChange={(v) => setEditedItem({ ...editedItem, icmsOrigem: v as any })}
                                options={[
                                    { value: '0', label: '0 - Nacional' },
                                    { value: '1', label: '1 - Estrangeira (importação direta)' },
                                    { value: '2', label: '2 - Estrangeira (mercado interno)' },
                                    { value: '3', label: '3 - Nacional (> 40% conteúdo estrangeiro)' },
                                    { value: '4', label: '4 - Nacional (PPB)' },
                                    { value: '5', label: '5 - Nacional (< 40% conteúdo estrangeiro)' },
                                    { value: '6', label: '6 - Estrangeira (sem similar nacional)' },
                                    { value: '7', label: '7 - Estrangeira (mercado interno, sem similar)' },
                                    { value: '8', label: '8 - Nacional (> 70% conteúdo nacional)' },
                                ]}
                            />
                            <FormSelect
                                label={isSimples ? "CSOSN" : "CST"}
                                value={editedItem.icmsCST}
                                onChange={(v) => setEditedItem({ ...editedItem, icmsCST: v })}
                                options={isSimples ? ICMS_CSOSN_OPTIONS : ICMS_CST_OPTIONS}
                            />
                        </div>

                        <SectionTitle>Tributação PIS/COFINS</SectionTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <FormSelect
                                label="CST PIS"
                                value={editedItem.pisCST}
                                onChange={(v) => setEditedItem({ ...editedItem, pisCST: v })}
                                options={PIS_COFINS_CST_OPTIONS}
                            />
                            <FormSelect
                                label="CST COFINS"
                                value={editedItem.cofinsCST}
                                onChange={(v) => setEditedItem({ ...editedItem, cofinsCST: v })}
                                options={PIS_COFINS_CST_OPTIONS}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--md-outline-variant)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                }}>
                    <Button variant="text" onClick={onClose}>Cancelar</Button>
                    <Button variant="filled" onClick={() => onSave(editedItem)}>Salvar</Button>
                </div>
            </motion.div>
        </>
    );
};

export default NFeDialog;
