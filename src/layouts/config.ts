import { ReactNode } from 'react';

export interface LayoutConfig {
    id: string;
    name: string;
    icon: string;
    description: string;

    // Visual Theme
    theme: {
        accentPrimary: string;
        accentSecondary: string;
        accentGlow: string;
    };

    // Layout Options
    productCardStyle: 'grid' | 'list' | 'compact';
    showCategories: boolean;
    cartPosition: 'left' | 'right';

    // Terminology
    labels: {
        cart: string;
        checkout: string;
        products: string;
        total: string;
    };

    // Sample Categories & Products
    categories: { id: string; name: string; icon: string }[];
    sampleProducts: {
        id: number;
        name: string;
        price: number;
        emoji: string;
        category: string;
    }[];
}

export const LAYOUTS: Record<string, LayoutConfig> = {
    retail: {
        id: 'retail',
        name: 'Varejo',
        icon: '🏪',
        description: 'Loja de conveniência e varejo geral',
        theme: {
            accentPrimary: '#14B8A6',
            accentSecondary: '#FBBF24',
            accentGlow: 'rgba(20, 184, 166, 0.4)',
        },
        productCardStyle: 'grid',
        showCategories: true,
        cartPosition: 'left',
        labels: {
            cart: 'Carrinho',
            checkout: 'Finalizar Venda',
            products: 'Produtos',
            total: 'Total',
        },
        categories: [
            { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
            { id: 'lanches', name: 'Lanches', icon: '🍔' },
            { id: 'doces', name: 'Doces', icon: '🍫' },
            { id: 'outros', name: 'Outros', icon: '📦' },
        ],
        sampleProducts: [
            { id: 1, name: 'Refrigerante Cola 350ml', price: 5.50, emoji: '🥤', category: 'bebidas' },
            { id: 2, name: 'Salgado Coxinha', price: 7.00, emoji: '🍗', category: 'lanches' },
            { id: 3, name: 'Suco Natural Laranja', price: 9.00, emoji: '🍊', category: 'bebidas' },
            { id: 4, name: 'Chocolate Barra', price: 4.50, emoji: '🍫', category: 'doces' },
            { id: 5, name: 'Café Expresso', price: 6.00, emoji: '☕', category: 'bebidas' },
            { id: 6, name: 'Água Mineral 500ml', price: 3.50, emoji: '💧', category: 'bebidas' },
        ],
    },

    restaurant: {
        id: 'restaurant',
        name: 'Restaurante',
        icon: '🍽️',
        description: 'Restaurantes e lanchonetes',
        theme: {
            accentPrimary: '#F97316', // Orange
            accentSecondary: '#EF4444',
            accentGlow: 'rgba(249, 115, 22, 0.4)',
        },
        productCardStyle: 'list',
        showCategories: true,
        cartPosition: 'right',
        labels: {
            cart: 'Comanda',
            checkout: 'Fechar Conta',
            products: 'Cardápio',
            total: 'Total da Mesa',
        },
        categories: [
            { id: 'entradas', name: 'Entradas', icon: '🥗' },
            { id: 'pratos', name: 'Pratos Principais', icon: '🍛' },
            { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
            { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
        ],
        sampleProducts: [
            { id: 1, name: 'Salada Caesar', price: 28.00, emoji: '🥗', category: 'entradas' },
            { id: 2, name: 'Bruschetta Italiana', price: 22.00, emoji: '🍞', category: 'entradas' },
            { id: 3, name: 'Filé Mignon ao Molho', price: 65.00, emoji: '🥩', category: 'pratos' },
            { id: 4, name: 'Risoto de Camarão', price: 58.00, emoji: '🦐', category: 'pratos' },
            { id: 5, name: 'Salmão Grelhado', price: 72.00, emoji: '🐟', category: 'pratos' },
            { id: 6, name: 'Cerveja Artesanal', price: 18.00, emoji: '🍺', category: 'bebidas' },
            { id: 7, name: 'Vinho Tinto Taça', price: 25.00, emoji: '🍷', category: 'bebidas' },
            { id: 8, name: 'Petit Gateau', price: 32.00, emoji: '🍫', category: 'sobremesas' },
            { id: 9, name: 'Cheesecake', price: 28.00, emoji: '🍰', category: 'sobremesas' },
        ],
    },

    petshop: {
        id: 'petshop',
        name: 'Pet Shop',
        icon: '🐾',
        description: 'Lojas de produtos para pets',
        theme: {
            accentPrimary: '#8B5CF6', // Violet
            accentSecondary: '#EC4899',
            accentGlow: 'rgba(139, 92, 246, 0.4)',
        },
        productCardStyle: 'grid',
        showCategories: true,
        cartPosition: 'left',
        labels: {
            cart: 'Sacola',
            checkout: 'Finalizar Compra',
            products: 'Produtos Pet',
            total: 'Total',
        },
        categories: [
            { id: 'racao', name: 'Ração', icon: '🍖' },
            { id: 'brinquedos', name: 'Brinquedos', icon: '🎾' },
            { id: 'higiene', name: 'Higiene', icon: '🧴' },
            { id: 'acessorios', name: 'Acessórios', icon: '🎀' },
        ],
        sampleProducts: [
            { id: 1, name: 'Ração Premium Cães 15kg', price: 189.00, emoji: '🐕', category: 'racao' },
            { id: 2, name: 'Ração Gatos Castrados 10kg', price: 165.00, emoji: '🐱', category: 'racao' },
            { id: 3, name: 'Bolinha com Guizo', price: 15.00, emoji: '🎾', category: 'brinquedos' },
            { id: 4, name: 'Mordedor de Corda', price: 25.00, emoji: '🧶', category: 'brinquedos' },
            { id: 5, name: 'Shampoo Antipulgas', price: 45.00, emoji: '🧴', category: 'higiene' },
            { id: 6, name: 'Coleira Antipulgas', price: 85.00, emoji: '📿', category: 'acessorios' },
            { id: 7, name: 'Cama Pet Grande', price: 220.00, emoji: '🛏️', category: 'acessorios' },
            { id: 8, name: 'Petisco Dental', price: 35.00, emoji: '🦴', category: 'racao' },
        ],
    },

    decor: {
        id: 'decor',
        name: 'Decoração',
        icon: '🏠',
        description: 'Lojas de decoração e design de interiores',
        theme: {
            accentPrimary: '#D4A574', // Gold/Bronze
            accentSecondary: '#B8860B',
            accentGlow: 'rgba(212, 165, 116, 0.4)',
        },
        productCardStyle: 'grid',
        showCategories: true,
        cartPosition: 'left',
        labels: {
            cart: 'Lista de Itens',
            checkout: 'Finalizar Orçamento',
            products: 'Catálogo',
            total: 'Valor Total',
        },
        categories: [
            { id: 'iluminacao', name: 'Iluminação', icon: '💡' },
            { id: 'moveis', name: 'Móveis', icon: '🛋️' },
            { id: 'decorativos', name: 'Decorativos', icon: '🖼️' },
            { id: 'texteis', name: 'Têxteis', icon: '🧵' },
        ],
        sampleProducts: [
            { id: 1, name: 'Luminária Pendente Nordic', price: 320.00, emoji: '💡', category: 'iluminacao' },
            { id: 2, name: 'Abajur de Mesa Minimal', price: 180.00, emoji: '🔦', category: 'iluminacao' },
            { id: 3, name: 'Poltrona Eames Réplica', price: 890.00, emoji: '🪑', category: 'moveis' },
            { id: 4, name: 'Mesa de Centro Rústica', price: 650.00, emoji: '🪵', category: 'moveis' },
            { id: 5, name: 'Quadro Abstrato 60x80', price: 280.00, emoji: '🖼️', category: 'decorativos' },
            { id: 6, name: 'Vaso Cerâmica Artesanal', price: 150.00, emoji: '🏺', category: 'decorativos' },
            { id: 7, name: 'Almofada Veludo 50x50', price: 95.00, emoji: '🛋️', category: 'texteis' },
            { id: 8, name: 'Tapete Shaggy 2x3m', price: 480.00, emoji: '🧶', category: 'texteis' },
        ],
    },
};

export const getLayoutById = (id: string): LayoutConfig => {
    return LAYOUTS[id] || LAYOUTS.retail;
};

export const getAllLayouts = (): LayoutConfig[] => {
    return Object.values(LAYOUTS);
};
