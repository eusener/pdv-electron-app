/**
 * Tecnospeed API Integration Service
 * Suporta emissão de NFe, NFCe, CTe
 * Documentação: https://docs.tecnospeed.com.br/
 */

export interface TecnospeedConfig {
    cnpjEmitente: string;
    token: string;
    ambiente: 'homologacao' | 'producao';
    baseUrl?: string;
}

export interface TecnospeedEmitente {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    inscricaoEstadual: string;
    inscricaoMunicipal?: string;
    cnae?: string;
    crt: '1' | '2' | '3';
    endereco: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        codigoMunicipio: string;
        nomeMunicipio: string;
        uf: string;
        cep: string;
        pais?: string;
        codigoPais?: string;
        telefone?: string;
    };
}

export interface TecnospeedDestinatario {
    tipoPessoa: 'F' | 'J' | 'E'; // Física, Jurídica, Estrangeiro
    cpfCnpj?: string;
    idEstrangeiro?: string;
    nome: string;
    inscricaoEstadual?: string;
    email?: string;
    telefone?: string;
    endereco?: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        codigoMunicipio: string;
        nomeMunicipio: string;
        uf: string;
        cep: string;
        pais?: string;
        codigoPais?: string;
    };
    indicadorIE?: '1' | '2' | '9'; // 1=Contribuinte, 2=Isento, 9=Não contribuinte
}

export interface TecnospeedProduto {
    numeroItem: number;
    codigo: string;
    codigoBarras?: string;
    descricao: string;
    ncm: string;
    cest?: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    valorDesconto?: number;
    valorFrete?: number;
    valorSeguro?: number;
    valorOutros?: number;
    // ICMS
    icmsOrigem: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
    icmsCST?: string;
    icmsCSOSN?: string;
    icmsBaseCalculo?: number;
    icmsAliquota?: number;
    icmsValor?: number;
    icmsBaseCalculoST?: number;
    icmsAliquotaST?: number;
    icmsValorST?: number;
    // PIS
    pisCST: string;
    pisBaseCalculo?: number;
    pisAliquota?: number;
    pisValor?: number;
    // COFINS
    cofinsCST: string;
    cofinsBaseCalculo?: number;
    cofinsAliquota?: number;
    cofinsValor?: number;
    // IPI
    ipiCST?: string;
    ipiBaseCalculo?: number;
    ipiAliquota?: number;
    ipiValor?: number;
    // Informações adicionais
    informacoesAdicionais?: string;
}

export interface TecnospeedTransporte {
    modalidadeFrete: '0' | '1' | '2' | '3' | '4' | '9';
    transportadora?: {
        cnpjCpf?: string;
        nome?: string;
        inscricaoEstadual?: string;
        endereco?: string;
        nomeMunicipio?: string;
        uf?: string;
    };
    veiculo?: {
        placa?: string;
        uf?: string;
        rntc?: string;
    };
    volumes?: Array<{
        quantidade?: number;
        especie?: string;
        marca?: string;
        numeracao?: string;
        pesoLiquido?: number;
        pesoBruto?: number;
    }>;
}

export interface TecnospeedPagamento {
    indicadorFormaPagamento: '0' | '1'; // 0=À vista, 1=A prazo
    pagamentos: Array<{
        formaPagamento: string; // 01=Dinheiro, 02=Cheque, 03=Cartão Crédito, etc.
        valor: number;
        tipoIntegracao?: '1' | '2'; // 1=Integrado, 2=Não integrado
        cnpjCredenciadora?: string;
        bandeira?: string;
        autorizacao?: string;
    }>;
    troco?: number;
}

export interface TecnospeedNFeRequest {
    idIntegracao: string; // ID único da sua aplicação
    modelo: '55' | '65'; // 55=NFe, 65=NFCe
    serie: string;
    naturezaOperacao: string;
    tipoOperacao: '0' | '1'; // 0=Entrada, 1=Saída
    finalidade: '1' | '2' | '3' | '4';
    consumidorFinal: '0' | '1';
    presencaComprador: '0' | '1' | '2' | '3' | '4' | '5' | '9';
    emitente: TecnospeedEmitente;
    destinatario?: TecnospeedDestinatario;
    produtos: TecnospeedProduto[];
    transporte: TecnospeedTransporte;
    pagamento: TecnospeedPagamento;
    informacoesAdicionais?: {
        contribuinte?: string;
        fisco?: string;
    };
    // NFCe específicos
    cIdToken?: string;
    csc?: string;
}

export interface TecnospeedNFeResponse {
    sucesso: boolean;
    mensagem?: string;
    protocolo?: string;
    chaveAcesso?: string;
    numeroNota?: number;
    serie?: string;
    dataEmissao?: string;
    xml?: string;
    danfe?: string; // URL ou Base64 do PDF
    erros?: Array<{
        codigo: string;
        mensagem: string;
        correcao?: string;
    }>;
}

export interface TecnospeedCTeRequest {
    idIntegracao: string;
    modelo: '57' | '67'; // 57=CTe, 67=CTeOS
    serie: string;
    naturezaOperacao: string;
    tipoServico: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
    emitente: TecnospeedEmitente;
    remetente: TecnospeedDestinatario;
    destinatario: TecnospeedDestinatario;
    tomadorServico: '0' | '1' | '2' | '3' | '4';
    // ... outros campos específicos do CTe
}

export interface NotaFiscalPendente {
    id: string;
    tipo: 'nfe' | 'nfce' | 'cte';
    status: 'pendente' | 'processando' | 'emitida' | 'erro' | 'cancelada';
    dataCriacao: string;
    dataEmissao?: string;
    vendaId?: string;
    clienteNome?: string;
    valorTotal: number;
    dados: TecnospeedNFeRequest | TecnospeedCTeRequest;
    resposta?: TecnospeedNFeResponse;
    tentativas: number;
    ultimoErro?: string;
}

// Códigos de forma de pagamento da NFe
export const FORMAS_PAGAMENTO = {
    '01': 'Dinheiro',
    '02': 'Cheque',
    '03': 'Cartão de Crédito',
    '04': 'Cartão de Débito',
    '05': 'Crédito Loja',
    '10': 'Vale Alimentação',
    '11': 'Vale Refeição',
    '12': 'Vale Presente',
    '13': 'Vale Combustível',
    '14': 'Duplicata Mercantil',
    '15': 'Boleto Bancário',
    '16': 'Depósito Bancário',
    '17': 'PIX',
    '18': 'Transferência bancária',
    '19': 'Programa de fidelidade',
    '90': 'Sem pagamento',
    '99': 'Outros',
};

// Bandeiras de cartão
export const BANDEIRAS_CARTAO = {
    '01': 'Visa',
    '02': 'Mastercard',
    '03': 'American Express',
    '04': 'Sorocred',
    '05': 'Diners Club',
    '06': 'Elo',
    '07': 'Hipercard',
    '08': 'Aura',
    '09': 'Cabal',
    '99': 'Outros',
};

class TecnospeedService {
    private config: TecnospeedConfig | null = null;
    private baseUrls = {
        homologacao: 'https://managersaashom.tecnospeed.com.br:8081',
        producao: 'https://managersaas.tecnospeed.com.br:8081',
    };

    /**
     * Configura o serviço com as credenciais da Tecnospeed
     */
    configure(config: TecnospeedConfig) {
        this.config = config;
    }

    /**
     * Retorna a URL base baseada no ambiente configurado
     */
    private getBaseUrl(): string {
        if (!this.config) throw new Error('Tecnospeed não configurado');
        return this.config.baseUrl || this.baseUrls[this.config.ambiente];
    }

    /**
     * Headers padrão para requisições
     */
    private getHeaders(): Record<string, string> {
        if (!this.config) throw new Error('Tecnospeed não configurado');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.token}`,
            'cnpj-emitente': this.config.cnpjEmitente,
        };
    }

    /**
     * Emite uma NFe/NFCe
     */
    async emitirNFe(request: TecnospeedNFeRequest): Promise<TecnospeedNFeResponse> {
        try {
            const baseUrl = this.getBaseUrl();
            const endpoint = request.modelo === '65' ? '/nfce' : '/nfe';

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(this.formatNFeRequest(request)),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    sucesso: false,
                    mensagem: data.mensagem || 'Erro ao emitir nota fiscal',
                    erros: data.erros || [{ codigo: String(response.status), mensagem: data.mensagem }],
                };
            }

            return {
                sucesso: true,
                protocolo: data.protocolo,
                chaveAcesso: data.chaveAcesso,
                numeroNota: data.numeroNota,
                serie: data.serie,
                dataEmissao: data.dataEmissao,
                xml: data.xml,
                danfe: data.danfe,
            };
        } catch (error: any) {
            return {
                sucesso: false,
                mensagem: error.message || 'Erro de conexão com a Tecnospeed',
                erros: [{ codigo: 'CONN_ERROR', mensagem: error.message }],
            };
        }
    }

    /**
     * Consulta o status de uma NFe pela chave de acesso
     */
    async consultarNFe(chaveAcesso: string): Promise<TecnospeedNFeResponse> {
        try {
            const baseUrl = this.getBaseUrl();
            const response = await fetch(`${baseUrl}/nfe/${chaveAcesso}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const data = await response.json();

            return {
                sucesso: response.ok,
                ...data,
            };
        } catch (error: any) {
            return {
                sucesso: false,
                mensagem: error.message,
            };
        }
    }

    /**
     * Cancela uma NFe
     */
    async cancelarNFe(chaveAcesso: string, justificativa: string): Promise<TecnospeedNFeResponse> {
        try {
            const baseUrl = this.getBaseUrl();
            const response = await fetch(`${baseUrl}/nfe/${chaveAcesso}/cancelar`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ justificativa }),
            });

            const data = await response.json();

            return {
                sucesso: response.ok,
                ...data,
            };
        } catch (error: any) {
            return {
                sucesso: false,
                mensagem: error.message,
            };
        }
    }

    /**
     * Inutiliza numeração de NFe
     */
    async inutilizarNumeracao(
        serie: string,
        numeroInicial: number,
        numeroFinal: number,
        justificativa: string
    ): Promise<TecnospeedNFeResponse> {
        try {
            const baseUrl = this.getBaseUrl();
            const response = await fetch(`${baseUrl}/nfe/inutilizar`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    serie,
                    numeroInicial,
                    numeroFinal,
                    justificativa,
                }),
            });

            const data = await response.json();

            return {
                sucesso: response.ok,
                ...data,
            };
        } catch (error: any) {
            return {
                sucesso: false,
                mensagem: error.message,
            };
        }
    }

    /**
     * Download do DANFE em PDF
     */
    async downloadDanfe(chaveAcesso: string): Promise<{ sucesso: boolean; pdf?: string; mensagem?: string }> {
        try {
            const baseUrl = this.getBaseUrl();
            const response = await fetch(`${baseUrl}/nfe/${chaveAcesso}/danfe`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return { sucesso: false, mensagem: 'Erro ao baixar DANFE' };
            }

            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);

            return { sucesso: true, pdf: base64 };
        } catch (error: any) {
            return { sucesso: false, mensagem: error.message };
        }
    }

    /**
     * Download do XML da NFe
     */
    async downloadXml(chaveAcesso: string): Promise<{ sucesso: boolean; xml?: string; mensagem?: string }> {
        try {
            const baseUrl = this.getBaseUrl();
            const response = await fetch(`${baseUrl}/nfe/${chaveAcesso}/xml`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return { sucesso: false, mensagem: 'Erro ao baixar XML' };
            }

            const xml = await response.text();
            return { sucesso: true, xml };
        } catch (error: any) {
            return { sucesso: false, mensagem: error.message };
        }
    }

    /**
     * Emissão em lote de NFe
     */
    async emitirLote(notas: TecnospeedNFeRequest[]): Promise<Array<{ id: string; response: TecnospeedNFeResponse }>> {
        const results: Array<{ id: string; response: TecnospeedNFeResponse }> = [];

        for (const nota of notas) {
            const response = await this.emitirNFe(nota);
            results.push({ id: nota.idIntegracao, response });

            // Delay entre emissões para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
    }

    /**
     * Formata a requisição para o padrão da Tecnospeed
     */
    private formatNFeRequest(request: TecnospeedNFeRequest): Record<string, any> {
        // Aqui seria feita a conversão do nosso formato para o formato específico da Tecnospeed
        // A estrutura exata depende da versão da API sendo utilizada
        return {
            idIntegracao: request.idIntegracao,
            presencaComprador: request.presencaComprador,
            naturezaOperacao: request.naturezaOperacao,
            tipoOperacao: request.tipoOperacao,
            finalidade: request.finalidade,
            consumidorFinal: request.consumidorFinal,
            emitente: request.emitente,
            destinatario: request.destinatario,
            itens: request.produtos.map(p => ({
                numeroItem: p.numeroItem,
                codigo: p.codigo,
                descricao: p.descricao,
                ncm: p.ncm,
                cfop: p.cfop,
                unidade: p.unidade,
                quantidade: p.quantidade,
                valorUnitario: p.valorUnitario,
                valorTotal: p.valorTotal,
                tributos: {
                    icms: {
                        origem: p.icmsOrigem,
                        cst: p.icmsCST,
                        csosn: p.icmsCSOSN,
                        baseCalculo: p.icmsBaseCalculo,
                        aliquota: p.icmsAliquota,
                        valor: p.icmsValor,
                    },
                    pis: {
                        cst: p.pisCST,
                        baseCalculo: p.pisBaseCalculo,
                        aliquota: p.pisAliquota,
                        valor: p.pisValor,
                    },
                    cofins: {
                        cst: p.cofinsCST,
                        baseCalculo: p.cofinsBaseCalculo,
                        aliquota: p.cofinsAliquota,
                        valor: p.cofinsValor,
                    },
                },
            })),
            transporte: request.transporte,
            pagamento: request.pagamento,
            informacoesAdicionais: request.informacoesAdicionais,
        };
    }

    /**
     * Converte Blob para Base64
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Verifica se o serviço está configurado
     */
    isConfigured(): boolean {
        return this.config !== null;
    }

    /**
     * Retorna a configuração atual (sem o token)
     */
    getConfig(): Omit<TecnospeedConfig, 'token'> | null {
        if (!this.config) return null;
        const { token, ...rest } = this.config;
        return rest;
    }
}

// Singleton instance
export const tecnospeedService = new TecnospeedService();

/**
 * Converte o método de pagamento do PDV para o código da NFe
 */
export function mapPaymentMethodToNFe(method: string): string {
    const mapping: Record<string, string> = {
        'dinheiro': '01',
        'money': '01',
        'cheque': '02',
        'credito': '03',
        'credit': '03',
        'debito': '04',
        'debit': '04',
        'pix': '17',
        'transferencia': '18',
        'transfer': '18',
        'vale': '10',
        'voucher': '10',
    };

    return mapping[method.toLowerCase()] || '99';
}

/**
 * Gera um ID de integração único
 */
export function generateIntegrationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
}

export default tecnospeedService;
