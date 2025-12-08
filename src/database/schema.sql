-- Tabela de Produtos (Atualizada para Reforma Tributária)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    tax_code VARCHAR(20), -- NCM
    
    -- Impostos Legado
    icms_rate DECIMAL(5,2) DEFAULT 0,
    pis_rate DECIMAL(5,2) DEFAULT 0,
    cofins_rate DECIMAL(5,2) DEFAULT 0,

    -- Reforma Tributária (IVA Dual - Transição 2026)
    ibs_rate DECIMAL(5,2) DEFAULT 0,
    cbs_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    payment_method VARCHAR(50),
    
    -- Totais de Impostos (Snapshot)
    total_icms DECIMAL(10, 2) DEFAULT 0,
    total_ibs DECIMAL(10, 2) DEFAULT 0,
    total_cbs DECIMAL(10, 2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Venda
CREATE TABLE IF NOT EXISTS venda_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id),
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,

    -- Detalhamento de Impostos por Item
    icms_value DECIMAL(10, 2) DEFAULT 0,
    ibs_value DECIMAL(10, 2) DEFAULT 0,
    cbs_value DECIMAL(10, 2) DEFAULT 0
);

-- Tabela de Fila de Sincronização (Sync Queue) - Especificação 1.2
CREATE TABLE IF NOT EXISTS vendas_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id),
    xml_assinado TEXT NOT NULL, -- O XML gerado offline
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, SYNCED, ERROR
    tentativas INT DEFAULT 0,
    mensagem_erro TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_sincronizacao TIMESTAMP WITH TIME ZONE
);

-- Índice para busca rápida do worker
CREATE INDEX IF NOT EXISTS idx_sync_status ON vendas_sync_queue(status) WHERE status != 'SYNCED';

-- =====================================================
-- GESTÃO DE CAIXA
-- =====================================================

-- Tabela de Caixa (sessões de caixa)
CREATE TABLE IF NOT EXISTS caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(20) NOT NULL DEFAULT '001',
    operador VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ABERTO', -- ABERTO, FECHADO
    valor_inicial DECIMAL(10,2) DEFAULT 0,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Movimentos de Caixa (sangrias, suprimentos, vendas)
CREATE TABLE IF NOT EXISTS caixa_movimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caixa_id UUID REFERENCES caixa(id),
    tipo VARCHAR(20) NOT NULL, -- SANGRIA, SUPRIMENTO, VENDA
    valor DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fechamentos de Caixa (histórico)
CREATE TABLE IF NOT EXISTS caixa_fechamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caixa_id UUID NOT NULL REFERENCES caixa(id),
    valor_inicial DECIMAL(10,2) NOT NULL,
    total_vendas DECIMAL(10,2) DEFAULT 0,
    total_sangrias DECIMAL(10,2) DEFAULT 0,
    total_suprimentos DECIMAL(10,2) DEFAULT 0,
    valor_esperado DECIMAL(10,2) NOT NULL,
    valor_contado DECIMAL(10,2),
    diferenca DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Gestão de Caixa
CREATE INDEX IF NOT EXISTS idx_caixa_status ON caixa(status);
CREATE INDEX IF NOT EXISTS idx_caixa_movimentos_caixa ON caixa_movimentos(caixa_id);
CREATE INDEX IF NOT EXISTS idx_caixa_movimentos_tipo ON caixa_movimentos(tipo);
