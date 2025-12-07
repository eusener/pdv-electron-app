import React, { useState } from 'react';
import { Button, Card, StatusBadge } from './components/Core';
import { Input } from './components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/theme.css';

// Mock Data - More products for better grid demo
const PRODUCTS = [
    { id: 1, name: 'Refrigerante Cola 350ml', price: 5.50, emoji: '🥤' },
    { id: 2, name: 'Salgado Coxinha', price: 7.00, emoji: '🍗' },
    { id: 3, name: 'Suco Natural Laranja', price: 9.00, emoji: '🍊' },
    { id: 4, name: 'Chocolate Barra', price: 4.50, emoji: '🍫' },
    { id: 5, name: 'Café Expresso', price: 6.00, emoji: '☕' },
    { id: 6, name: 'Água Mineral 500ml', price: 3.50, emoji: '💧' },
];

interface CartItem {
    id: number;
    name: string;
    price: number;
    qtd: number;
    emoji?: string;
}

export const App = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const addToCart = (product: typeof PRODUCTS[0]) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p =>
                    p.id === product.id ? { ...p, qtd: p.qtd + 1 } : p
                );
            }
            return [...prev, { ...product, qtd: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(p => p.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qtd), 0);

    const handleFinish = async () => {
        setIsProcessing(true);
        try {
            const saleData = {
                total,
                paymentMethod: 'credit',
                items: cart,
                isOffline: !isOnline,
                totalTax: {
                    icms: total * 0.18,
                    ibs: total * 0.01,
                    cbs: total * 0.09
                }
            };

            const response = await window.api.saveSale(saleData);

            if (response.success) {
                setCart([]);
                // Could show a nice toast here instead of alert
            }
        } catch (e: unknown) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'grid',
            gridTemplateColumns: '380px 1fr',
            gap: 'var(--space-lg)',
            padding: 'var(--space-lg)',
        }}>
            {/* LEFT PANEL: Cart */}
            <Card
                glass
                glow
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - var(--space-lg) * 2)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-lg)',
                    paddingBottom: 'var(--space-md)',
                    borderBottom: '1px solid var(--glass-border)',
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-info) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Caixa 01
                        </h2>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            display: 'block',
                        }}>
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    </div>
                    <StatusBadge status={isOnline ? 'online' : 'offline'} />
                </div>

                {/* Cart Items */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: 'var(--space-md)',
                }}>
                    {cart.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                marginTop: 'var(--space-2xl)',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', opacity: 0.5 }}>🛒</div>
                            <p style={{ margin: 0 }}>Carrinho vazio</p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Clique em um produto para adicionar</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        marginBottom: 'var(--space-sm)',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--glass-border)',
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--bg-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                    }}>
                                        {item.emoji || '📦'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}>
                                            <span>{item.qtd}x</span>
                                            <span>R$ {item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: 'var(--accent-primary)',
                                            fontSize: '0.95rem',
                                        }}>
                                            R$ {(item.price * item.qtd).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--accent-danger)',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                padding: 0,
                                                opacity: 0.7,
                                            }}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Total & Checkout */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--space-md)',
                    borderTop: '1px solid var(--glass-border)',
                }}>
                    {/* Subtotal and Tax Info */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <span>Subtotal ({cart.reduce((a, i) => a + i.qtd, 0)} itens)</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>

                    {/* Total */}
                    <motion.div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: 'var(--space-lg)',
                        }}
                        animate={{ scale: cart.length > 0 ? [1, 1.02, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span>TOTAL</span>
                        <span style={{
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-info) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            R$ {total.toFixed(2)}
                        </span>
                    </motion.div>

                    <Button
                        variant="primary"
                        size="lg"
                        style={{ width: '100%' }}
                        onClick={handleFinish}
                        disabled={isProcessing || cart.length === 0}
                    >
                        {isProcessing ? (
                            <>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    ⏳
                                </motion.span>
                                Processando...
                            </>
                        ) : (
                            <>💳 Finalizar Venda (F2)</>
                        )}
                    </Button>

                    {!isOnline && cart.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: 'var(--space-md)',
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                color: 'var(--accent-secondary)',
                                textAlign: 'center',
                            }}
                        >
                            ⚠️ Modo Contingência - Nota será enviada quando online
                        </motion.div>
                    )}
                </div>
            </Card>

            {/* RIGHT PANEL: Products */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - var(--space-lg) * 2)',
            }}>
                {/* Header */}
                <header style={{
                    marginBottom: 'var(--space-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                        }}>
                            PDV{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-info) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                2026
                            </span>
                        </h1>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            display: 'block',
                        }}>
                            Sistema de Ponto de Venda
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                        {!isOnline && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    padding: '6px 12px',
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    borderRadius: 'var(--radius-xl)',
                                    color: 'var(--accent-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                }}
                            >
                                🔄 3 Notas Pendentes
                            </motion.div>
                        )}
                    </div>
                </header>

                {/* Search */}
                <Input
                    placeholder="🔍  Buscar produto ou digitar código de barras..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    style={{ marginBottom: 'var(--space-lg)' }}
                />

                {/* Products Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 'var(--space-md)',
                    overflowY: 'auto',
                    flex: 1,
                    paddingBottom: 'var(--space-md)',
                }}>
                    {PRODUCTS
                        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                        .map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                style={{
                                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-lg)',
                                    border: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-normal)',
                                    boxShadow: 'var(--glass-shadow)',
                                }}
                            >
                                <div style={{
                                    height: 80,
                                    background: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                }}>
                                    {product.emoji}
                                </div>
                                <h3 style={{
                                    margin: '0 0 var(--space-sm) 0',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    lineHeight: 1.3,
                                    color: 'var(--text-primary)',
                                }}>
                                    {product.name}
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-primary)',
                                }}>
                                    R$ {product.price.toFixed(2)}
                                </p>
                            </motion.div>
                        ))}
                </div>
            </div>
        </div>
    );
};
