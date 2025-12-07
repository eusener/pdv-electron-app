import React from 'react';
import {
    Store,
    UtensilsCrossed,
    PawPrint,
    Armchair,
    CupSoda,
    Sandwich,
    Candy,
    Package,
    Beef,
    Soup,
    Beer,
    CakeSlice,
    Bone,
    Circle, // Ball
    Scissors,
    Grid,
    Lamp,
    Sofa,
    Image,
    Shirt,
    ShoppingBag,
    Pizza,
    Coffee,
    Wine,
    Utensils,
    Dog,
    Cat,
    ShoppingBasket
} from 'lucide-react';
import refrigeranteImg from '../assets/refrigerante.png';

export interface LayoutConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;

    // Visual Theme (using CSS var references or hex from DS.md)
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
    categories: { id: string; name: string; icon: React.ReactNode }[];
    sampleProducts: {
        id: number;
        name: string;
        price: number;
        icon: React.ReactNode;
        category: string;
        barcode?: string;
    }[];
}

// DS.md Palette
const THEME_COLORS = {
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    glow: 'rgba(208, 188, 255, 0.4)',
};

export const LAYOUTS: Record<string, LayoutConfig> = {
    retail: {
        id: 'retail',
        name: 'Varejo',
        icon: <Store size={24} />,
        description: 'Loja de conveniência e varejo geral',
        theme: {
            accentPrimary: THEME_COLORS.primary,
            accentSecondary: THEME_COLORS.secondary,
            accentGlow: THEME_COLORS.glow,
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
            { id: 'bebidas', name: 'Bebidas', icon: <CupSoda size={18} /> },
            { id: 'lanches', name: 'Lanches', icon: <Sandwich size={18} /> },
            { id: 'doces', name: 'Doces', icon: <Candy size={18} /> },
            { id: 'outros', name: 'Outros', icon: <Package size={18} /> },
        ],
        sampleProducts: [
            { id: 1, name: 'Refrigerante Cola 350ml', price: 5.50, icon: <CupSoda />, category: 'bebidas', barcode: '789001' },
            { id: 2, name: 'Salgado Coxinha', price: 7.00, icon: <Pizza />, category: 'lanches', barcode: '789002' },
            { id: 3, name: 'Suco Natural Laranja', price: 9.00, icon: <CupSoda />, category: 'bebidas', barcode: '789003' },
            { id: 4, name: 'Chocolate Barra', price: 4.50, icon: <Candy />, category: 'doces', barcode: '789004' },
            { id: 5, name: 'Café Expresso', price: 6.00, icon: <Coffee />, category: 'bebidas', barcode: '789005' },
            { id: 6, name: 'Água Mineral 500ml', price: 3.50, icon: <CupSoda />, category: 'bebidas', barcode: '789006' },
        ],
    },

    restaurant: {
        id: 'restaurant',
        name: 'Restaurante',
        icon: <UtensilsCrossed size={24} />,
        description: 'Restaurantes e lanchonetes',
        theme: {
            accentPrimary: THEME_COLORS.primary,
            accentSecondary: THEME_COLORS.secondary,
            accentGlow: THEME_COLORS.glow,
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
            { id: 'entradas', name: 'Entradas', icon: <Soup size={18} /> },
            { id: 'pratos', name: 'Pratos Principais', icon: <Utensils size={18} /> },
            { id: 'bebidas', name: 'Bebidas', icon: <Beer size={18} /> },
            { id: 'sobremesas', name: 'Sobremesas', icon: <CakeSlice size={18} /> },
        ],
        sampleProducts: [
            { id: 1, name: 'Salada Caesar', price: 28.00, icon: <Soup />, category: 'entradas' },
            { id: 2, name: 'Bruschetta Italiana', price: 22.00, icon: <Utensils />, category: 'entradas' },
            { id: 3, name: 'Filé Mignon ao Molho', price: 65.00, icon: <Beef />, category: 'pratos' },
            { id: 4, name: 'Risoto de Camarão', price: 58.00, icon: <Utensils />, category: 'pratos' },
            { id: 5, name: 'Salmão Grelhado', price: 72.00, icon: <Utensils />, category: 'pratos' },
            { id: 6, name: 'Cerveja Artesanal', price: 18.00, icon: <Beer />, category: 'bebidas' },
            { id: 7, name: 'Vinho Tinto Taça', price: 25.00, icon: <Wine />, category: 'bebidas' },
            { id: 8, name: 'Petit Gateau', price: 32.00, icon: <CakeSlice />, category: 'sobremesas' },
            { id: 9, name: 'Cheesecake', price: 28.00, icon: <CakeSlice />, category: 'sobremesas' },
        ],
    },

    supermarket: {
        id: 'supermarket',
        name: 'Supermercado',
        icon: <ShoppingBasket size={24} />,
        description: 'Supermercados com foto do produto no scan',
        theme: {
            accentPrimary: THEME_COLORS.primary,
            accentSecondary: THEME_COLORS.secondary,
            accentGlow: THEME_COLORS.glow,
        },
        productCardStyle: 'grid',
        showCategories: true,
        cartPosition: 'left',
        labels: {
            cart: 'Carrinho',
            checkout: 'Finalizar',
            products: 'Produtos',
            total: 'Total',
        },
        categories: [
            { id: 'bebidas', name: 'Bebidas', icon: <CupSoda size={18} /> },
            { id: 'hortifruti', name: 'Hortifruti', icon: <Pizza size={18} /> }, // Mock icon
            { id: 'padaria', name: 'Padaria', icon: <Sandwich size={18} /> },
            { id: 'limpeza', name: 'Limpeza', icon: <Package size={18} /> },
            { id: 'acougue', name: 'Açougue', icon: <Beef size={18} /> },
        ],
        sampleProducts: [
            { id: 1, name: 'Refrigerante Cola 2L', price: 9.90, icon: <img src={refrigeranteImg} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />, category: 'bebidas', barcode: '789101' },
            { id: 2, name: 'Banana Prata kg', price: 6.50, icon: <Pizza />, category: 'hortifruti', barcode: '789102' }, // Pizza icon as placeholder
            { id: 3, name: 'Pão Francês kg', price: 12.90, icon: <Sandwich />, category: 'padaria', barcode: '789103' },
            { id: 4, name: 'Detergente Líquido', price: 2.89, icon: <Package />, category: 'limpeza', barcode: '789104' },
            { id: 5, name: 'Contra Filé kg', price: 49.90, icon: <Beef />, category: 'acougue', barcode: '789105' },
            { id: 6, name: 'Leite Integral 1L', price: 4.59, icon: <CupSoda />, category: 'bebidas', barcode: '789106' },
            { id: 7, name: 'Arroz 5kg', price: 28.90, icon: <Package />, category: 'limpeza', barcode: '789107' }, // Using 'limpeza' for general packed? Or add 'mercearia'
            { id: 8, name: 'Feijão 1kg', price: 8.90, icon: <Package />, category: 'limpeza', barcode: '789108' },
        ],
    },

    petshop: {
        id: 'petshop',
        name: 'Pet Shop',
        icon: <PawPrint size={24} />,
        description: 'Lojas de produtos para pets',
        theme: {
            accentPrimary: THEME_COLORS.primary,
            accentSecondary: THEME_COLORS.secondary,
            accentGlow: THEME_COLORS.glow,
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
            { id: 'racao', name: 'Ração', icon: <Bone size={18} /> },
            { id: 'brinquedos', name: 'Brinquedos', icon: <Circle size={18} /> },
            { id: 'higiene', name: 'Higiene', icon: <Scissors size={18} /> },
            { id: 'acessorios', name: 'Acessórios', icon: <ShoppingBag size={18} /> },
        ],
        sampleProducts: [
            { id: 1, name: 'Ração Premium Cães 15kg', price: 189.00, icon: <Dog />, category: 'racao', barcode: '789201' },
            { id: 2, name: 'Ração Gatos Castrados 10kg', price: 165.00, icon: <Cat />, category: 'racao', barcode: '789202' },
            { id: 3, name: 'Bolinha com Guizo', price: 15.00, icon: <Circle />, category: 'brinquedos', barcode: '789203' },
            { id: 4, name: 'Mordedor de Corda', price: 25.00, icon: <Bone />, category: 'brinquedos', barcode: '789204' },
            { id: 5, name: 'Shampoo Antipulgas', price: 45.00, icon: <Scissors />, category: 'higiene', barcode: '789205' },
            { id: 6, name: 'Coleira Antipulgas', price: 85.00, icon: <ShoppingBag />, category: 'acessorios', barcode: '789206' },
            { id: 7, name: 'Cama Pet Grande', price: 220.00, icon: <Grid />, category: 'acessorios', barcode: '789207' },
            { id: 8, name: 'Petisco Dental', price: 35.00, icon: <Bone />, category: 'racao', barcode: '789208' },
        ],
    },

    decor: {
        id: 'decor',
        name: 'Decoração',
        icon: <Armchair size={24} />,
        description: 'Lojas de decoração e design de interiores',
        theme: {
            accentPrimary: THEME_COLORS.primary,
            accentSecondary: THEME_COLORS.secondary,
            accentGlow: THEME_COLORS.glow,
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
            { id: 'iluminacao', name: 'Iluminação', icon: <Lamp size={18} /> },
            { id: 'moveis', name: 'Móveis', icon: <Sofa size={18} /> },
            { id: 'decorativos', name: 'Decorativos', icon: <Image size={18} /> },
            { id: 'texteis', name: 'Têxteis', icon: <Shirt size={18} /> },
        ],
        sampleProducts: [
            { id: 1, name: 'Luminária Pendente Nordic', price: 320.00, icon: <Lamp />, category: 'iluminacao' },
            { id: 2, name: 'Abajur de Mesa Minimal', price: 180.00, icon: <Lamp />, category: 'iluminacao' },
            { id: 3, name: 'Poltrona Eames Réplica', price: 890.00, icon: <Armchair />, category: 'moveis' },
            { id: 4, name: 'Mesa de Centro Rústica', price: 650.00, icon: <Grid />, category: 'moveis' },
            { id: 5, name: 'Quadro Abstrato 60x80', price: 280.00, icon: <Image />, category: 'decorativos' },
            { id: 6, name: 'Vaso Cerâmica Artesanal', price: 150.00, icon: <Image />, category: 'decorativos' },
            { id: 7, name: 'Almofada Veludo 50x50', price: 95.00, icon: <Sofa />, category: 'texteis' },
            { id: 8, name: 'Tapete Shaggy 2x3m', price: 480.00, icon: <Grid />, category: 'texteis' },
        ],
    },
};

export const getLayoutById = (id: string): LayoutConfig => {
    return LAYOUTS[id] || LAYOUTS.retail;
};

export const getAllLayouts = (): LayoutConfig[] => {
    return Object.values(LAYOUTS);
};
