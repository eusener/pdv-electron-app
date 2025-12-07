import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Scissors, Dog, Cat, PawPrint } from 'lucide-react';

export interface ServiceItem {
    id: number;
    petName: string;
    ownerName: string;
    service: string;
    time: string;
    status: 'waiting' | 'in-progress' | 'ready';
    petType: 'dog' | 'cat' | 'other';
    price: number;
}

interface ServiceQueueProps {
    services: ServiceItem[];
    onSelectService: (id: number) => void;
    onUpdateStatus: (id: number, status: ServiceItem['status']) => void;
    accentColor: string;
}

export const generateSampleServices = (): ServiceItem[] => [
    { id: 1, petName: 'Thor', ownerName: 'Carlos Silva', service: 'Banho e Tosa', time: '14:00', status: 'in-progress', petType: 'dog', price: 89.90 },
    { id: 2, petName: 'Luna', ownerName: 'Ana Souza', service: 'Banho Simples', time: '14:30', status: 'waiting', petType: 'cat', price: 65.00 },
    { id: 3, petName: 'Paçoca', ownerName: 'Marcos O.', service: 'Hidratação', time: '13:00', status: 'ready', petType: 'dog', price: 120.00 },
    { id: 4, petName: 'Nina', ownerName: 'Beatriz L.', service: 'Corte de Unhas', time: '15:00', status: 'waiting', petType: 'dog', price: 35.00 },
];

export const ServiceQueue = ({ services, onSelectService, onUpdateStatus, accentColor }: ServiceQueueProps) => {
    const getPetIcon = (type: ServiceItem['petType']) => {
        switch (type) {
            case 'dog': return <Dog size={24} />;
            case 'cat': return <Cat size={24} />;
            default: return <PawPrint size={24} />;
        }
    };

    const getStatusConfig = (status: ServiceItem['status']) => {
        switch (status) {
            case 'waiting': return { color: '#FBBF24', label: 'Aguardando', icon: <Clock size={12} /> };
            case 'in-progress': return { color: '#38BDF8', label: 'Em Atendimento', icon: <Scissors size={12} /> };
            case 'ready': return { color: '#4ADE80', label: 'Pronto', icon: <CheckCircle2 size={12} /> };
            default: return { color: '#64748B', label: status, icon: <Clock size={12} /> };
        }
    };

    const groupedServices = {
        waiting: services.filter(s => s.status === 'waiting'),
        inProgress: services.filter(s => s.status === 'in-progress'),
        ready: services.filter(s => s.status === 'ready'),
    };

    const renderServiceCard = (service: ServiceItem, index: number) => {
        const statusConfig = getStatusConfig(service.status);

        return (
            <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'var(--md-surface-container-high)' }}
                onClick={() => onSelectService(service.id)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'var(--md-surface-container)',
                    borderRadius: 'var(--shape-corner-large)',
                    border: '1px solid var(--md-outline-variant)',
                    cursor: 'pointer',
                    marginBottom: 'var(--space-sm)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Status Strip */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: statusConfig.color,
                }} />

                {/* Pet Avatar */}
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--shape-corner-medium)',
                    background: 'var(--md-surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--md-primary)',
                    marginLeft: '8px', // Space for strip
                }}>
                    {getPetIcon(service.petType)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                    }}>
                        <span style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: 'var(--md-on-surface)'
                        }}>
                            {service.petName}
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--md-on-surface-variant)',
                            padding: '2px 8px',
                            background: 'var(--md-surface-container-high)',
                            borderRadius: 'var(--shape-corner-full)',
                        }}>
                            {service.ownerName}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--md-on-surface-variant)' }}>
                        {service.service}
                    </div>
                </div>

                {/* Price & Status */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{
                        fontWeight: 700,
                        color: 'var(--md-on-surface)',
                        fontSize: '1rem',
                    }}>
                        R$ {service.price.toFixed(2)}
                    </div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: statusConfig.color,
                    }}>
                        {statusConfig.icon} {statusConfig.label}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
            }}>
                {[
                    { label: 'Aguardando', count: groupedServices.waiting.length, color: '#FBBF24' },
                    { label: 'Em Atendimento', count: groupedServices.inProgress.length, color: '#38BDF8' },
                    { label: 'Prontos', count: groupedServices.ready.length, color: '#4ADE80' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        style={{
                            flex: 1,
                            padding: 'var(--space-md)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `3px solid ${stat.color}`,
                        }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: stat.color,
                        }}>
                            {stat.count}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Queue List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* In Progress - Priority */}
                {groupedServices.inProgress.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            color: '#38BDF8',
                            marginBottom: 'var(--space-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Scissors size={16} /> Em Atendimento
                        </h3>
                        <AnimatePresence>
                            {groupedServices.inProgress.map((s, i) => renderServiceCard(s, i))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Waiting */}
                {groupedServices.waiting.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            color: '#FBBF24',
                            marginBottom: 'var(--space-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <Clock size={16} /> Fila de Espera
                        </h3>
                        <AnimatePresence>
                            {groupedServices.waiting.map((s, i) => renderServiceCard(s, i))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Ready for Pickup */}
                {groupedServices.ready.length > 0 && (
                    <div>
                        <h3 style={{
                            fontSize: '0.875rem',
                            color: '#4ADE80',
                            marginBottom: 'var(--space-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <CheckCircle2 size={16} /> Prontos para Retirada
                        </h3>
                        <AnimatePresence>
                            {groupedServices.ready.map((s, i) => renderServiceCard(s, i))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

