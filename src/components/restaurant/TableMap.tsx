import { AnimatePresence, motion } from 'framer-motion';
import { Armchair, Utensils } from 'lucide-react';

interface Table {
    id: number;
    number: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'billing';
    guests?: number;
    waiter?: string;
    total?: number;
    openedAt?: Date;
}

interface TableMapProps {
    tables: Table[];
    selectedTable: number | null;
    onSelectTable: (id: number) => void;
    accentColor: string;
}

export const TableMap = ({ tables, selectedTable, onSelectTable, accentColor }: TableMapProps) => {

    const getStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'available': return 'var(--accent-success)';
            case 'occupied': return 'var(--md-error)';
            case 'reserved': return 'var(--accent-secondary)';
            case 'billing': return 'var(--accent-info)';
            default: return 'var(--md-outline)';
        }
    };

    const getStatusLabel = (status: Table['status']) => {
        switch (status) {
            case 'available': return 'Livre';
            case 'occupied': return 'Ocupada';
            case 'reserved': return 'Reservada';
            case 'billing': return 'Pagamento';
            default: return status;
        }
    };

    const stats = {
        available: tables.filter(t => t.status === 'available').length,
        occupied: tables.filter(t => t.status === 'occupied').length,
        reserved: tables.filter(t => t.status === 'reserved').length,
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Stats Bar */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-md)',
                overflowX: 'auto',
                paddingBottom: 4,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 16px',
                    height: 36,
                    borderRadius: 'var(--shape-corner-full)',
                    background: 'var(--md-surface-container)',
                    border: '1px solid var(--md-outline-variant)',
                    fontSize: '0.875rem',
                    color: 'var(--md-on-surface)',
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }} />
                    Livres <strong style={{ color: 'var(--md-on-surface)' }}>{stats.available}</strong>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 16px',
                    height: 36,
                    borderRadius: 'var(--shape-corner-full)',
                    background: 'var(--md-surface-container)',
                    border: '1px solid var(--md-outline-variant)',
                    fontSize: '0.875rem',
                    color: 'var(--md-on-surface)',
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--md-error)' }} />
                    Ocupadas <strong style={{ color: 'var(--md-on-surface)' }}>{stats.occupied}</strong>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 16px',
                    height: 36,
                    borderRadius: 'var(--shape-corner-full)',
                    background: 'var(--md-surface-container)',
                    border: '1px solid var(--md-outline-variant)',
                    fontSize: '0.875rem',
                    color: 'var(--md-on-surface)',
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-secondary)' }} />
                    Reservadas <strong style={{ color: 'var(--md-on-surface)' }}>{stats.reserved}</strong>
                </div>
            </div>

            {/* Table Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 'var(--space-md)',
                flex: 1,
                overflowY: 'auto',
                paddingRight: 4,
            }}>
                {tables.map((table, index) => {
                    const isSelected = selectedTable === table.id;
                    const statusColor = getStatusColor(table.status);
                    const isOccupied = table.status === 'occupied';

                    return (
                        <motion.button
                            key={table.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.02, y: -2, boxShadow: 'var(--elevation-2)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectTable(table.id)}
                            style={{
                                aspectRatio: '1',
                                background: isSelected
                                    ? 'var(--md-secondary-container)'
                                    : 'var(--md-surface-container)',
                                border: isSelected
                                    ? `2px solid var(--md-primary)`
                                    : `1px solid var(--md-outline-variant)`,
                                borderRadius: 'var(--shape-corner-large)', // 16px - cleaner
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-md)',
                                position: 'relative',
                                overflow: 'hidden',
                                color: 'var(--md-on-surface)',
                            }}
                        >
                            {/* Header: Status Dot & Number */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-family)',
                                    color: isSelected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface)'
                                }}>
                                    {table.number}
                                </div>
                                <div style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: statusColor,
                                    boxShadow: `0 0 8px ${statusColor}60`
                                }} />
                            </div>

                            {/* Center: Icon */}
                            <div style={{
                                color: isSelected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                                opacity: isOccupied ? 1 : 0.5,
                                transform: 'scale(1.2)',
                                padding: '12px 0',
                            }}>
                                {isOccupied ? <Utensils size={32} /> : <Armchair size={32} />}
                            </div>

                            {/* Footer: Details */}
                            <div style={{ width: '100%' }}>
                                {isOccupied && table.total ? (
                                    <div style={{
                                        background: 'var(--md-surface-container-high)',
                                        borderRadius: 'var(--shape-corner-small)',
                                        padding: '4px 8px',
                                        textAlign: 'center',
                                        width: '100%',
                                    }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--md-on-surface-variant)' }}>Total</div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: 'var(--md-on-surface)'
                                        }}>
                                            R$ {table.total.toFixed(0)}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        fontSize: '0.75rem',
                                        color: 'var(--md-on-surface-variant)',
                                        fontWeight: 500
                                    }}>
                                        {table.seats} lugares
                                    </div>
                                )}
                            </div>

                            {/* Subtle Status Strip for occupied */}
                            {isOccupied && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 3,
                                    background: statusColor
                                }} />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

// Sample data generator
export const generateSampleTables = (): Table[] => {
    return [
        { id: 1, number: '01', seats: 4, status: 'occupied', guests: 3, total: 145.50, waiter: 'João' },
        { id: 2, number: '02', seats: 2, status: 'available' },
        { id: 3, number: '03', seats: 6, status: 'occupied', guests: 5, total: 289.00, waiter: 'Maria' },
        { id: 4, number: '04', seats: 4, status: 'reserved' },
        { id: 5, number: '05', seats: 2, status: 'available' },
        { id: 6, number: '06', seats: 4, status: 'billing', guests: 4, total: 198.00, waiter: 'Pedro' },
        { id: 7, number: '07', seats: 8, status: 'occupied', guests: 7, total: 456.00, waiter: 'Ana' },
        { id: 8, number: '08', seats: 4, status: 'available' },
        { id: 9, number: '09', seats: 2, status: 'occupied', guests: 2, total: 78.50, waiter: 'João' },
        { id: 10, number: '10', seats: 6, status: 'reserved' },
        { id: 11, number: '11', seats: 4, status: 'available' },
        { id: 12, number: '12', seats: 2, status: 'available' },
    ];
};
