import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Link, Star, Lightbulb } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    icon?: React.ReactNode;
    category?: string;
}

interface CartItem extends Product {
    qtd: number;
}

interface SmartRecommendationsProps {
    cart: CartItem[];
    allProducts: Product[];
    onAddToCart: (product: Product) => void;
    accentColor: string;
    layout?: 'horizontal' | 'vertical'; // Added layout prop
}

// Simple recommendation rules based on product relationships
const PRODUCT_RELATIONS: Record<string, string[]> = {
    // Drinks go with snacks
    'bebidas': ['lanches', 'doces'],
    'lanches': ['bebidas'],
    'doces': ['bebidas'],
    // Decoration
    'iluminacao': ['moveis', 'decorativos'],
    'moveis': ['texteis', 'decorativos', 'iluminacao'],
    'decorativos': ['iluminacao', 'texteis'],
    'texteis': ['moveis', 'decorativos'],
};

export const SmartRecommendations = ({
    cart,
    allProducts,
    onAddToCart,
    accentColor,
    layout = 'horizontal' // Default
}: SmartRecommendationsProps) => {
    // ... logic same ...
    // Get categories in cart
    const cartCategories = [...new Set(cart.map(item => item.category as string).filter(Boolean))];
    const cartProductIds = cart.map(item => item.id);

    // Find related categories
    const relatedCategories = new Set<string>();
    cartCategories.forEach(cat => {
        const related = PRODUCT_RELATIONS[cat] || [];
        related.forEach(r => relatedCategories.add(r));
    });

    // Get recommended products (not already in cart)
    const recommendations = allProducts
        .filter(p => !cartProductIds.includes(p.id))
        .filter(p => (p.category && relatedCategories.has(p.category)) || (cart.length === 0))
        .slice(0, 4);

    // Popular items (when cart is empty or no relations)
    const popularItems = allProducts
        .filter(p => !cartProductIds.includes(p.id))
        .slice(0, 4);

    const displayItems = recommendations.length > 0 ? recommendations : popularItems;

    // Choose title & icon based on state
    const title = cart.length === 0
        ? { text: 'Produtos Populares', icon: <Star size={14} /> }
        : { text: 'Combine com sua compra', icon: <Lightbulb size={14} /> };

    if (displayItems.length === 0) return null;

    if (layout === 'vertical') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-md)' }}>
                {displayItems.map((product, index) => (
                    <motion.button
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'var(--md-surface-container-high)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddToCart(product)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 12,
                            background: 'var(--md-surface)',
                            border: '1px solid var(--md-outline-variant)',
                            borderRadius: 'var(--shape-corner-medium)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            color: 'var(--md-on-surface)'
                        }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            color: 'var(--md-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32, height: 32,
                            background: 'var(--md-surface-container-high)',
                            borderRadius: '8px'
                        }}>
                            {product.icon}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 600 }}>
                                R$ {product.price.toFixed(2)}
                            </div>
                        </div>
                        <div style={{
                            background: 'var(--md-secondary-container)',
                            color: 'var(--md-on-secondary-container)',
                            borderRadius: '50%',
                            width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Plus size={14} />
                        </div>
                    </motion.button>
                ))}
            </div>
        );
    }

    // Default Horizontal
    return (
        <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--shape-corner-medium)',
            padding: 'var(--space-md)',
            marginTop: 'auto',
        }}>
            <h4 style={{
                margin: '0 0 var(--space-sm) 0',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}>
                {title.icon} {title.text}
            </h4>
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-xs)',
            }}>
                {displayItems.map((product, index) => (
                    <motion.button
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddToCart(product)}
                        style={{
                            minWidth: 100,
                            padding: 'var(--space-sm)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--md-outline-variant)',
                            borderRadius: 'var(--shape-corner-small)',
                            cursor: 'pointer',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            marginBottom: '4px',
                            color: 'var(--md-primary)',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            {product.icon}
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginBottom: '4px',
                        }}>
                            {product.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: accentColor,
                        }}>
                            R$ {product.price.toFixed(2)}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: accentColor,
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2
                        }}>
                            <Plus size={10} /> Adicionar
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// Frequently bought together
interface FrequentlyBoughtProps {
    currentProduct: Product | null;
    allProducts: Product[];
    onAddToCart: (product: Product) => void;
    accentColor: string;
}

export const FrequentlyBoughtTogether = ({
    currentProduct,
    allProducts,
    onAddToCart,
    accentColor,
}: FrequentlyBoughtProps) => {
    if (!currentProduct || !currentProduct.category) return null;

    const relatedCategories = PRODUCT_RELATIONS[currentProduct.category] || [];
    const suggestions = allProducts
        .filter(p => p.id !== currentProduct.id)
        .filter(p => p.category && relatedCategories.includes(p.category))
        .slice(0, 2);

    if (suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: 'var(--space-sm)',
                background: `${accentColor}10`,
                borderRadius: 'var(--shape-corner-small)',
                marginTop: 'var(--space-sm)',
            }}
        >
            <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
            }}>
                <Link size={12} /> Frequentemente comprados juntos:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {suggestions.map(product => (
                    <motion.button
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddToCart(product)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--md-outline-variant)',
                            borderRadius: 'var(--shape-corner-small)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                        }}
                    >
                        <span style={{ color: 'var(--md-primary)' }}>{product.icon}</span>
                        <span>+ R$ {product.price.toFixed(2)}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
