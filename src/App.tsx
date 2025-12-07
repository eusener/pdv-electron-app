import React, { useState, useMemo } from 'react';
import { Button, Card, StatusBadge, Chip, ListItem, FAB } from './components/Core';
import { SearchBar } from './components/Input';
import { LayoutSelector, LayoutToggle } from './components/LayoutSelector';
import { TableMap, generateSampleTables } from './components/restaurant/TableMap';
import { ServiceQueue, generateSampleServices, ServiceItem } from './components/petshop/ServiceQueue';
import { SmartRecommendations } from './components/retail/SmartRecommendations';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscountDialog } from './components/DiscountDialog';
import { PaymentDialog } from './components/PaymentDialog';
import { SavedSalesDialog, SavedSale } from './components/SavedSalesDialog';
import { ClientDialog, Client } from './components/ClientDialog';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useShortcuts } from './hooks/useShortcuts';
import { ShortcutsFooter } from './components/ShortcutsFooter';
import { LayoutConfig, getLayoutById } from './layouts/config';
import './styles/theme.css';
import {
    ShoppingCart,
    CreditCard,
    Plus,
    X,
    MapPin,
    ClipboardList,
    AlertTriangle,
    PackageOpen,
    Sun,
    Moon,
    Percent,
    ScanBarcode,
    Save,
    FileText,
    CheckCircle2,
    FolderOpen,
    User,
    UserPlus
} from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    qtd: number;
    icon?: React.ReactNode;
    category?: string;
    discount?: { type: 'fixed' | 'percent', value: number };
}

export const App = () => {
    // Layout State
    const [currentLayout, setCurrentLayout] = useState<LayoutConfig>(() => getLayoutById('retail'));
    const [isLayoutSelectorOpen, setIsLayoutSelectorOpen] = useState(false);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [globalDiscount, setGlobalDiscount] = useState<{ type: 'fixed' | 'percent', value: number } | null>(null);
    const [discountTarget, setDiscountTarget] = useState<'global' | number | null>(null);
    const [scanMessage, setScanMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [savedSales, setSavedSales] = useState<SavedSale[]>([]);
    const [isSavedSalesOpen, setIsSavedSalesOpen] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [lastScannedProduct, setLastScannedProduct] = useState<{ name: string; price: number; icon: React.ReactNode } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Restaurant State
    const [tables] = useState(() => generateSampleTables());
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    // Pet Shop State
    const [services, setServices] = useState<ServiceItem[]>(() => generateSampleServices());

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

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'dark';
    });

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Apply theme colors dynamically
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--md-primary', currentLayout.theme.accentPrimary);
    }, [currentLayout]);

    // Clear state when layout changes
    React.useEffect(() => {
        setCart([]);
        setSelectedCategory(null);
        setGlobalDiscount(null);
        setDiscountTarget(null);
        setSearch('');
        setSelectedTable(null);
    }, [currentLayout.id]);

    const addToCart = (product: { id: number; name: string; price: number; icon?: React.ReactNode; category?: string }) => {
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

    const calculateItemTotal = (item: CartItem) => {
        const gross = item.price * item.qtd;
        if (!item.discount) return gross;
        const discAmount = item.discount.type === 'percent' ? gross * (item.discount.value / 100) : item.discount.value;
        return Math.max(0, gross - discAmount);
    };

    const subtotal = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    const globalDiscountAmount = globalDiscount ? (globalDiscount.type === 'percent' ? subtotal * (globalDiscount.value / 100) : globalDiscount.value) : 0;
    const total = Math.max(0, subtotal - globalDiscountAmount);

    const handleApplyDiscount = (type: 'fixed' | 'percent', value: number) => {
        if (discountTarget === 'global') {
            setGlobalDiscount({ type, value });
        } else if (typeof discountTarget === 'number') {
            setCart(prev => prev.map(item =>
                item.id === discountTarget ? { ...item, discount: { type, value } } : item
            ));
        }
        setDiscountTarget(null);
    };

    const filteredProducts = useMemo(() => {
        return currentLayout.sampleProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [currentLayout.sampleProducts, search, selectedCategory]);

    const handleScan = (code: string) => {
        const product = currentLayout.sampleProducts.find(p => p.barcode === code);
        if (product) {
            addToCart(product);
            setScanMessage({ text: `${product.name} adicionado!`, type: 'success' });

            if (currentLayout.id === 'supermarket') {
                setLastScannedProduct(product);
                setTimeout(() => setLastScannedProduct(null), 2000); // Hide after 2s
            }
        } else {
            setScanMessage({ text: `Código desconhecido: ${code}`, type: 'error' });
        }
        setTimeout(() => setScanMessage(null), 3000);
    };

    useBarcodeScanner({ onScan: handleScan });



    const handlePreCheckout = () => {
        if (cart.length === 0) return;
        setIsPaymentOpen(true);
    };

    const handleCompletePayment = async (payments: any[]) => {
        setIsProcessing(true);
        setIsPaymentOpen(false);
        try {
            const saleData = {
                total,
                subtotal,
                globalDiscount,
                paymentMethod: 'multiple',
                payments,
                client, // Add client to sale data
                items: cart,
                isOffline: !isOnline,
                totalTax: { icms: total * 0.18, ibs: total * 0.01, cbs: total * 0.09 },
                status: 'completed',
                date: new Date().toISOString()
            };
            const response = await window.api.saveSale(saleData);
            if (response.success) {
                setCart([]);
                setGlobalDiscount(null);
                setScanMessage({ text: 'Venda finalizada com sucesso!', type: 'success' });
                setTimeout(() => setScanMessage(null), 3000);
            }
        } catch (e) {
            console.error(e);
            setScanMessage({ text: 'Erro ao finalizar venda', type: 'error' });
            setTimeout(() => setScanMessage(null), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSavePreSale = () => {
        if (cart.length === 0) return;
        const newSale: SavedSale = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'presale',
            date: new Date().toISOString(),
            items: cart,
            total,
            clientName: client ? client.name : 'Cliente Balcão'
        };
        // Also save discount logic if needed, but keeping simple
        setSavedSales([newSale, ...savedSales]);
        setCart([]);
        setGlobalDiscount(null);
        setClient(null); // Reset client
        setScanMessage({ text: 'Pré-venda salva!', type: 'success' });
        setTimeout(() => setScanMessage(null), 3000);
    };

    const handleSaveQuote = () => {
        if (cart.length === 0) return;
        const newSale: SavedSale = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'quote',
            date: new Date().toISOString(),
            items: cart,
            total,
        };
        setSavedSales([newSale, ...savedSales]);
        setCart([]);
        setGlobalDiscount(null);
        setScanMessage({ text: 'Orçamento salvo!', type: 'success' });
        setTimeout(() => setScanMessage(null), 3000);
    };

    useShortcuts({
        onF1: () => setIsClientDialogOpen(true),
        onF2: handleSavePreSale,
        onF3: handleSaveQuote,
        onF4: handlePreCheckout,
        onF6: () => setIsSavedSalesOpen(true),
        onF7: () => setDiscountTarget('global'),
        onF8: () => {
            if (window.confirm('Cancelar venda e limpar carrinho?')) {
                setCart([]);
                setClient(null);
                setGlobalDiscount(null);
            }
        },
        onEscape: () => {
            if (isPaymentOpen) { setIsPaymentOpen(false); return; }
            if (isClientDialogOpen) { setIsClientDialogOpen(false); return; }
            if (isSavedSalesOpen) { setIsSavedSalesOpen(false); return; }
            if (isLayoutSelectorOpen) { setIsLayoutSelectorOpen(false); return; }
            if (discountTarget) { setDiscountTarget(null); return; }
            if (selectedCategory) { setSelectedCategory(null); return; }
            // Optional: if (search) setSearch('');
        }
    });

    const handleLoadSale = (sale: SavedSale) => {
        // Confirmation if cart not empty? For now just overwrite
        setCart(sale.items);
        setGlobalDiscount(null); // Simple reload
        setSavedSales(prev => prev.filter(s => s.id !== sale.id));
        setIsSavedSalesOpen(false);
        setScanMessage({ text: 'Venda recuperada!', type: 'success' });
        setTimeout(() => setScanMessage(null), 3000);
    };

    const handleDeleteSavedSale = (id: string) => {
        setSavedSales(prev => prev.filter(s => s.id !== id));
    };

    const handleServiceStatusUpdate = (id: number, status: ServiceItem['status']) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    // Render main content based on layout type
    const renderMainContent = () => {
        switch (currentLayout.id) {
            case 'restaurant':
                return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--md-on-surface-variant)',
                            marginBottom: 'var(--space-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <MapPin size={16} /> Mapa de Mesas
                        </div>
                        <TableMap
                            tables={tables}
                            selectedTable={selectedTable}
                            onSelectTable={(id) => setSelectedTable(id)}
                            accentColor={currentLayout.theme.accentPrimary}
                        />
                    </div>
                );

            case 'petshop':
                return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--md-on-surface-variant)',
                            marginBottom: 'var(--space-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <ClipboardList size={16} /> Fila de Serviços
                        </div>
                        <ServiceQueue
                            services={services}
                            onSelectService={(id) => {
                                const service = services.find(s => s.id === id);
                                if (service) {
                                    addToCart({
                                        id: service.id,
                                        name: `${service.petName} - ${service.service}`,
                                        price: service.price,
                                        icon: <PackageOpen size={16} />, // Default icon for services if needed
                                    });
                                }
                            }}
                            onUpdateStatus={handleServiceStatusUpdate}
                            accentColor={currentLayout.theme.accentPrimary}
                        />
                    </div>
                );

            default:
                return (
                    <>
                        {/* Filter Chips */}
                        {currentLayout.showCategories && (
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-sm)',
                                marginBottom: 'var(--space-md)',
                                overflowX: 'auto',
                                paddingBottom: 4,
                            }}>
                                <Chip
                                    label="Todos"
                                    selected={!selectedCategory}
                                    onClick={() => setSelectedCategory(null)}
                                />
                                {currentLayout.categories.map(cat => (
                                    <Chip
                                        key={cat.id}
                                        label={cat.name}
                                        icon={cat.icon}
                                        selected={selectedCategory === cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="product-grid">
                            {/* Product rendering logic wrapped in AnimatePresence? No, simple map */}
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: 'var(--elevation-2)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    style={{
                                        background: 'var(--md-surface-container)',
                                        borderRadius: 'var(--shape-corner-large)',
                                        padding: 'var(--space-md)',
                                        cursor: 'pointer',
                                        border: '1px solid var(--md-outline-variant)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        height: '100%'
                                    }}
                                >
                                    <div style={{
                                        height: 80,
                                        width: 80,
                                        background: 'var(--md-surface-container-high)',
                                        borderRadius: 'var(--shape-corner-medium)',
                                        marginBottom: 'var(--space-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--md-primary)',
                                    }}>
                                        {product.icon}
                                    </div>
                                    <div style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: 'var(--md-on-surface)',
                                        marginBottom: 4,
                                        lineHeight: 1.4,
                                        width: '100%',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        minHeight: 40,
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: 'var(--md-primary)',
                                        marginTop: 'auto',
                                    }}>
                                        R$ {product.price.toFixed(2)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                );
        }
    };

    const isCartRight = currentLayout.id === 'restaurant';
    const showRecs = (currentLayout.id === 'retail' || currentLayout.id === 'decor') && cart.length > 0;

    return (
        <>
            <LayoutSelector
                currentLayout={currentLayout}
                onSelect={setCurrentLayout}
                isOpen={isLayoutSelectorOpen}
                onClose={() => setIsLayoutSelectorOpen(false)}
            />

            <div className={`app-grid ${isCartRight ? 'cart-right' : ''} ${showRecs ? 'with-recommendations' : ''}`}>
                {/* CART PANEL */}
                <div
                    className="cart-panel"
                    style={{
                        background: 'var(--md-surface-container-low)',
                        order: isCartRight ? 3 : 1,
                        padding: 'var(--space-md)',
                        borderRight: !isCartRight ? '1px solid var(--md-outline-variant)' : 'none',
                        borderLeft: isCartRight ? '1px solid var(--md-outline-variant)' : 'none',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-md)',
                    }}>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: 22,
                                fontWeight: 400,
                                color: 'var(--md-on-surface)',
                            }}>
                                {currentLayout.labels.cart}
                            </h2>
                            <span style={{
                                fontSize: 12,
                                color: 'var(--md-on-surface-variant)',
                            }}>
                                {new Date().toLocaleDateString('pt-BR', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsClientDialogOpen(true)}
                                style={{
                                    background: client ? 'var(--md-primary-container)' : 'var(--md-surface-container-high)',
                                    color: client ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}
                                title={client ? client.name : "Adicionar Cliente"}
                            >
                                {client ? <User size={16} /> : <UserPlus size={16} />}
                                {client && (
                                    <span style={{
                                        position: 'absolute', top: -4, right: -4,
                                        background: 'var(--md-primary)', color: 'var(--md-on-primary)',
                                        fontSize: 10, borderRadius: '50%', width: 14, height: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid var(--md-surface)'
                                    }}>
                                        <CheckCircle2 size={10} />
                                    </span>
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsSavedSalesOpen(true)}
                                style={{
                                    background: 'var(--md-secondary-container)',
                                    color: 'var(--md-on-secondary-container)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <FolderOpen size={16} />
                                {savedSales.length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -4, right: -4,
                                        background: 'var(--md-error)', color: 'white',
                                        fontSize: 10, borderRadius: '50%', width: 14, height: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {savedSales.length}
                                    </span>
                                )}
                            </motion.button>
                            <StatusBadge status={isOnline ? 'online' : 'offline'} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{
                        height: 1,
                        background: 'var(--md-outline-variant)',
                        marginBottom: 'var(--space-md)',
                    }} />

                    {/* Cart Items */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--md-on-surface-variant)',
                                marginTop: 'var(--space-xl)',
                            }}>
                                <div style={{
                                    fontSize: 48,
                                    marginBottom: 'var(--space-md)',
                                    opacity: 0.5,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <ShoppingCart size={48} />
                                </div>
                                <div style={{ fontSize: 14 }}>
                                    {currentLayout.labels.cart} vazio
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <ListItem
                                            leadingIcon={item.icon || <PackageOpen size={24} />}
                                            headline={item.name}
                                            supportingText={`${item.qtd}x R$ ${item.price.toFixed(2)}`}
                                            trailingContent={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 4 }}>
                                                        {item.discount && (
                                                            <span style={{
                                                                fontSize: 10,
                                                                textDecoration: 'line-through',
                                                                color: 'var(--md-error)'
                                                            }}>
                                                                R$ {(item.price * item.qtd).toFixed(2)}
                                                            </span>
                                                        )}
                                                        <span style={{
                                                            fontWeight: 500,
                                                            color: 'var(--md-primary)',
                                                        }}>
                                                            R$ {calculateItemTotal(item).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setDiscountTarget(item.id)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 'var(--shape-corner-full)',
                                                            border: 'none',
                                                            background: item.discount ? 'var(--md-secondary-container)' : 'transparent',
                                                            color: item.discount ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Percent size={16} />
                                                    </motion.button>

                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 'var(--shape-corner-full)',
                                                            border: 'none',
                                                            background: 'var(--md-error-container)',
                                                            color: 'var(--md-on-error-container)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </motion.button>
                                                </div>
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>



                    {/* Total & Checkout */}
                    <div style={{
                        marginTop: 'var(--space-md)',
                        paddingTop: 'var(--space-md)',
                        borderTop: '1px solid var(--md-outline-variant)',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-sm)',
                            fontSize: 14,
                            color: 'var(--md-on-surface-variant)',
                        }}>
                            <span>{cart.reduce((a, i) => a + i.qtd, 0)} itens</span>
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>

                        {/* Discount Line */}
                        {globalDiscount ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 14,
                                color: 'var(--md-primary)',
                                marginBottom: 'var(--space-md)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span>Desconto Global ({globalDiscount.type === 'percent' ? `${globalDiscount.value}%` : 'Fixo'})</span>
                                    <button
                                        onClick={() => setGlobalDiscount(null)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--md-error)',
                                            padding: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                                <span>- R$ {globalDiscountAmount.toFixed(2)}</span>
                            </div>
                        ) : (
                            <div style={{ marginBottom: 'var(--space-md)', textAlign: 'right' }}>
                                <button
                                    onClick={() => setDiscountTarget('global')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--md-primary)',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    <Percent size={14} /> Adicionar Desconto Global
                                </button>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 28,
                            fontWeight: 400,
                            marginBottom: 'var(--space-lg)',
                            color: 'var(--md-on-surface)',
                        }}>
                            <span>{currentLayout.labels.total}</span>
                            <span style={{ color: 'var(--md-primary)' }}>
                                R$ {total.toFixed(2)}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <Button
                                variant="tonal"
                                onClick={handleSavePreSale}
                                disabled={cart.length === 0 || isProcessing}
                                style={{ flex: 1 }}
                            >
                                <Save size={18} style={{ marginRight: 8 }} /> Pré-venda
                            </Button>
                            <Button
                                variant="tonal"
                                onClick={handleSaveQuote}
                                disabled={cart.length === 0 || isProcessing}
                                style={{ flex: 1 }}
                            >
                                <FileText size={18} style={{ marginRight: 8 }} /> Orçamento
                            </Button>
                        </div>

                        <Button
                            variant="filled"
                            onClick={handlePreCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            style={{
                                width: '100%',
                                height: 56,
                                fontSize: 18,
                            }}
                        >
                            {isProcessing ? 'Processando...' : currentLayout.labels.checkout}
                        </Button>

                        {!isOnline && cart.length > 0 && (
                            <Card variant="outlined" style={{
                                marginTop: 'var(--space-sm)',
                                padding: 'var(--space-sm) var(--space-md)',
                            }}>
                                <div style={{
                                    fontSize: 12,
                                    color: 'var(--md-on-surface-variant)',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6
                                }}>
                                    <AlertTriangle size={14} /> Modo Contingência - Nota será enviada quando online
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                {/* RECOMMENDATIONS PANEL */}
                {showRecs && (
                    <div className="recs-panel" style={{ order: 2 }}>
                        <div style={{
                            padding: 'var(--space-md)',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--md-on-surface-variant)',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <PackageOpen size={16} /> Combine com sua compra
                        </div>
                        <SmartRecommendations
                            cart={cart}
                            allProducts={currentLayout.sampleProducts}
                            onAddToCart={addToCart}
                            accentColor={currentLayout.theme.accentPrimary}
                            layout="vertical"
                        />
                    </div>
                )}

                {/* MAIN CONTENT PANEL */}
                <div className="main-panel" style={{ order: isCartRight ? 1 : 3 }}>
                    {/* Top App Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-md)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ color: 'var(--md-primary)' }}>
                                {currentLayout.icon}
                            </div>
                            <div>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 400,
                                    color: 'var(--md-on-surface)',
                                }}>
                                    {currentLayout.name}
                                </h1>
                                <span style={{
                                    fontSize: 12,
                                    color: 'var(--md-on-surface-variant)',
                                }}>
                                    {currentLayout.description}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <motion.button
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTheme}
                                style={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: '1px solid var(--md-outline-variant)',
                                    borderRadius: 'var(--shape-corner-full)',
                                    cursor: 'pointer',
                                    color: 'var(--md-on-surface)',
                                }}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </motion.button>
                            <LayoutToggle
                                layout={currentLayout}
                                onClick={() => setIsLayoutSelectorOpen(true)}
                            />
                        </div>
                    </div>

                    {/* Search (for retail/decor/supermarket) */}
                    {(currentLayout.id === 'retail' || currentLayout.id === 'decor' || currentLayout.id === 'supermarket') && (
                        <SearchBar
                            placeholder={`Buscar ${currentLayout.labels.products.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ marginBottom: 'var(--space-md)' }}
                        />
                    )}

                    {/* Main Content */}
                    {renderMainContent()}
                </div>

                {/* FOOTER SHORTCUTS */}
                <ShortcutsFooter />
            </div>

            {/* FAB for quick actions */}
            {currentLayout.id === 'restaurant' && selectedTable && (
                <FAB
                    icon={<Plus size={24} />}
                    label="Adicionar Item"
                    variant="primary"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: isCartRight ? 400 : 24, // Adjust based on layout
                    }}
                />
            )}
            <DiscountDialog
                isOpen={!!discountTarget}
                onClose={() => setDiscountTarget(null)}
                onApply={handleApplyDiscount}
                currentTotal={(() => {
                    if (discountTarget === 'global') return subtotal;
                    if (typeof discountTarget === 'number') {
                        const item = cart.find(i => i.id === discountTarget);
                        return item ? item.price * item.qtd : 0;
                    }
                    return 0;
                })()}
            />
            {/* Scan Toast */}
            <AnimatePresence>
                {scanMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            bottom: 32,
                            left: '50%',
                            background: scanMessage.type === 'success' ? 'var(--md-inverse-surface)' : 'var(--md-error-container)',
                            color: scanMessage.type === 'success' ? 'var(--md-inverse-on-surface)' : 'var(--md-on-error-container)',
                            padding: '12px 24px',
                            borderRadius: 'var(--shape-corner-full)',
                            boxShadow: 'var(--elevation-3)',
                            zIndex: 10000, // Top of everything
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {scanMessage.type === 'success' ? (
                            scanMessage.text.includes('adicionado') ? <ScanBarcode size={20} /> : <CheckCircle2 size={20} />
                        ) : <AlertTriangle size={20} />}
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{scanMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <PaymentDialog
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                total={total}
                onFinish={handleCompletePayment}
            />

            <SavedSalesDialog
                isOpen={isSavedSalesOpen}
                onClose={() => setIsSavedSalesOpen(false)}
                sales={savedSales}
                onLoad={handleLoadSale}
                onDelete={handleDeleteSavedSale}
            />

            <ClientDialog
                isOpen={isClientDialogOpen}
                onClose={() => setIsClientDialogOpen(false)}
                onSelect={setClient}
                currentClient={client}
            />

            {/* SUPERMARKET SCANNED PRODUCT OVERLAY */}
            <AnimatePresence>
                {lastScannedProduct && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'var(--md-surface)',
                            padding: '32px',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-5)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            minWidth: 300
                        }}
                    >
                        <div style={{
                            width: 200, height: 200,
                            marginBottom: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {React.isValidElement(lastScannedProduct.icon)
                                    ? React.cloneElement(lastScannedProduct.icon as any, {
                                        size: 200,
                                        width: '100%',
                                        height: '100%',
                                        style: { width: '100%', height: '100%', objectFit: 'contain' }
                                    })
                                    : lastScannedProduct.icon}
                            </div>
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, color: 'var(--md-on-surface)' }}>
                            {lastScannedProduct.name}
                        </h2>
                        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--md-primary)' }}>
                            R$ {lastScannedProduct.price.toFixed(2)}
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--md-primary)', fontSize: 14, fontWeight: 500 }}>
                            <CheckCircle2 size={16} /> Item Adicionado
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
