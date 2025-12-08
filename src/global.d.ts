export { };

// Tipos para Gestão de Caixa
interface Caixa {
    id: string;
    numero: string;
    operador: string | null;
    status: 'ABERTO' | 'FECHADO';
    valor_inicial: number;
    data_abertura: string;
    data_fechamento: string | null;
    created_at: string;
}

interface CaixaMovimento {
    id: string;
    caixa_id: string;
    tipo: 'SANGRIA' | 'SUPRIMENTO' | 'VENDA';
    valor: number;
    motivo: string | null;
    observacoes: string | null;
    created_at: string;
}

interface CaixaFechamento {
    id: string;
    caixa_id: string;
    valor_inicial: number;
    total_vendas: number;
    total_sangrias: number;
    total_suprimentos: number;
    valor_esperado: number;
    valor_contado: number;
    diferenca: number;
    observacoes: string | null;
    created_at: string;
    operador?: string;
    numero?: string;
}

interface ResumoCaixa {
    caixa: Caixa;
    valorInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalSuprimentos: number;
    valorEsperado: number;
}

declare global {
    interface Window {
        api: {
            saveSale: (saleData: any) => Promise<{ success: boolean; saleId?: string; error?: string }>;
            getPrinters: () => Promise<Electron.PrinterInfo[]>;
            printData: (options: { content: string; type?: 'html' | 'raw'; printerName?: string; copies?: number }) => Promise<boolean>;
            getPrinterConfig: () => Promise<any>;
            savePrinterConfig: (config: any) => Promise<boolean>;

            // Gestão de Caixa
            getCaixaAtual: () => Promise<{ success: boolean; caixa: Caixa | null; error?: string }>;
            abrirCaixa: (data: { operador?: string; valorInicial: number }) => Promise<{ success: boolean; caixa?: Caixa; error?: string }>;
            registrarMovimento: (data: {
                caixaId: string;
                tipo: 'SANGRIA' | 'SUPRIMENTO';
                valor: number;
                motivo?: string;
                observacoes?: string;
            }) => Promise<{ success: boolean; movimento?: CaixaMovimento; error?: string }>;
            getResumoCaixa: (caixaId: string) => Promise<{ success: boolean; resumo?: ResumoCaixa; error?: string }>;
            fecharCaixa: (data: {
                caixaId: string;
                valorContado: number;
                observacoes?: string;
            }) => Promise<{
                success: boolean;
                fechamento?: CaixaFechamento;
                resumo?: {
                    valorInicial: number;
                    totalVendas: number;
                    totalSangrias: number;
                    totalSuprimentos: number;
                    valorEsperado: number;
                    valorContado: number;
                    diferenca: number;
                };
                error?: string;
            }>;
            getHistoricoCaixa: () => Promise<{ success: boolean; historico?: CaixaFechamento[]; error?: string }>;
            getMovimentosCaixa: (caixaId: string) => Promise<{ success: boolean; movimentos?: CaixaMovimento[]; error?: string }>;

            // PDF Generation
            generatePDF: (options: { html: string; filename?: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;

            // Fiscal Configuration
            getFiscalConfig: () => Promise<FiscalConfig | null>;
            saveFiscalConfig: (config: FiscalConfig) => Promise<boolean>;

            // Notas Fiscais Pendentes
            getNotasPendentes: () => Promise<{ success: boolean; notas?: NotaFiscalPendente[]; error?: string }>;
            salvarNotaPendente: (nota: NotaFiscalPendente) => Promise<{ success: boolean; error?: string }>;
            removerNotaPendente: (id: string) => Promise<{ success: boolean; error?: string }>;
            emitirNotasPendentes: (ids: string[]) => Promise<{ success: boolean; resultados?: Array<{ id: string; sucesso: boolean; mensagem?: string }>; error?: string }>;
        };
    }
}

// Fiscal Configuration Types
interface FiscalConfig {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    crt: '1' | '2' | '3';
    cnae: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    codigoMunicipio: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone: string;
    serieNFe: string;
    serieNFCe: string;
    proximoNumeroNFe: string;
    proximoNumeroNFCe: string;
    cIdToken: string;
    csc: string;
    tecnospeedToken: string;
    tecnospeedAmbiente: 'homologacao' | 'producao';
    certificadoPath: string;
    certificadoSenha: string;
}

// Nota Fiscal Pendente Types
interface NotaFiscalPendente {
    id: string;
    tipo: 'nfe' | 'nfce' | 'cte';
    status: 'pendente' | 'processando' | 'emitida' | 'erro' | 'cancelada';
    dataCriacao: string;
    dataEmissao?: string;
    vendaId?: string;
    clienteNome?: string;
    valorTotal: number;
    tentativas: number;
    ultimoErro?: string;
    chaveAcesso?: string;
    numeroNota?: number;
}
