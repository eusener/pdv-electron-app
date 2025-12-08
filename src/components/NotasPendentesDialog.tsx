import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    Send,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Loader2,
    RefreshCw,
    CheckSquare,
    Square,
    FileCheck,
    Calendar,
    Filter
} from 'lucide-react';
import { Button } from './Core';

interface NotaPendente {
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

interface NotasPendentesDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotasPendentesDialog = ({ isOpen, onClose }: NotasPendentesDialogProps) => {
    const [notas, setNotas] = useState<NotaPendente[]>([]);
    const [loading, setLoading] = useState(false);
    const [emitting, setEmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Date filter state
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter notas by date
    const notasFiltradas = useMemo(() => {
        return notas.filter(nota => {
            const dataNota = new Date(nota.dataCriacao);

            if (dataInicio) {
                const inicio = new Date(dataInicio);
                inicio.setHours(0, 0, 0, 0);
                if (dataNota < inicio) return false;
            }

            if (dataFim) {
                const fim = new Date(dataFim);
                fim.setHours(23, 59, 59, 999);
                if (dataNota > fim) return false;
            }

            return true;
        });
    }, [notas, dataInicio, dataFim]);

    useEffect(() => {
        if (isOpen) {
            loadNotas();
            // Set default date range to today
            const today = new Date().toISOString().split('T')[0];
            setDataInicio(today);
            setDataFim(today);
        }
    }, [isOpen]);

    const loadNotas = async () => {
        setLoading(true);
        try {
            const result = await window.api.getNotasPendentes();
            if (result.success && result.notas) {
                setNotas(result.notas);
            }
        } catch (e) {
            console.error(e);
            setMessage({ text: 'Erro ao carregar notas pendentes', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        const pendentes = notasFiltradas.filter(n => n.status === 'pendente' || n.status === 'erro');
        if (selectedIds.size === pendentes.length && pendentes.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendentes.map(n => n.id)));
        }
    };

    const clearFilters = () => {
        setDataInicio('');
        setDataFim('');
    };

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleEmitirSelecionadas = async () => {
        if (selectedIds.size === 0) {
            setMessage({ text: 'Selecione ao menos uma nota para emitir', type: 'info' });
            return;
        }

        setEmitting(true);
        setMessage(null);

        try {
            const result = await window.api.emitirNotasPendentes(Array.from(selectedIds));

            if (result.success && result.resultados) {
                const sucessos = result.resultados.filter(r => r.sucesso).length;
                const erros = result.resultados.filter(r => !r.sucesso).length;

                if (erros === 0) {
                    setMessage({ text: `${sucessos} nota(s) emitida(s) com sucesso!`, type: 'success' });
                } else {
                    setMessage({ text: `${sucessos} emitida(s), ${erros} erro(s)`, type: 'error' });
                }

                // Reload notes
                await loadNotas();
                setSelectedIds(new Set());
            } else {
                setMessage({ text: result.error || 'Erro ao emitir notas', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Erro ao emitir notas', type: 'error' });
        } finally {
            setEmitting(false);
        }
    };

    const handleRemover = async (id: string) => {
        try {
            await window.api.removerNotaPendente(id);
            setNotas(notas.filter(n => n.id !== id));
            selectedIds.delete(id);
            setSelectedIds(new Set(selectedIds));
            setMessage({ text: 'Nota removida', type: 'success' });
        } catch (e) {
            setMessage({ text: 'Erro ao remover nota', type: 'error' });
        }
    };

    const getStatusIcon = (status: NotaPendente['status']) => {
        switch (status) {
            case 'emitida':
                return <CheckCircle2 size={16} color="var(--accent-success)" />;
            case 'erro':
                return <AlertTriangle size={16} color="var(--md-error)" />;
            case 'processando':
                return <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />;
            case 'cancelada':
                return <X size={16} color="var(--md-outline)" />;
            default:
                return <Clock size={16} color="var(--md-primary)" />;
        }
    };

    const getStatusLabel = (status: NotaPendente['status']) => {
        const labels: Record<typeof status, string> = {
            pendente: 'Pendente',
            processando: 'Processando...',
            emitida: 'Emitida',
            erro: 'Erro',
            cancelada: 'Cancelada',
        };
        return labels[status];
    };

    const getTipoLabel = (tipo: NotaPendente['tipo']) => {
        const labels: Record<typeof tipo, string> = {
            nfe: 'NF-e',
            nfce: 'NFC-e',
            cte: 'CT-e',
        };
        return labels[tipo];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const pendentesCount = notasFiltradas.filter(n => n.status === 'pendente' || n.status === 'erro').length;
    const hasActiveFilters = dataInicio || dataFim;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 500,
                        }}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            margin: 'auto',
                            width: '95%',
                            maxWidth: 800,
                            height: 'fit-content',
                            maxHeight: '90vh',
                            background: 'var(--md-surface)',
                            borderRadius: 'var(--shape-corner-extra-large)',
                            boxShadow: 'var(--elevation-5)',
                            zIndex: 501,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: 'var(--md-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <FileCheck size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
                                        Notas Fiscais Pendentes
                                    </h2>
                                    <span style={{ fontSize: 13, color: 'var(--md-on-surface-variant)' }}>
                                        {pendentesCount} nota(s) aguardando emissão
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Button
                                    variant="tonal"
                                    onClick={loadNotas}
                                    disabled={loading}
                                    style={{ padding: '8px 12px' }}
                                >
                                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                                </Button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    style={{
                                        background: 'var(--md-surface-container-high)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--md-on-surface)',
                                    }}
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Date Filters */}
                        <div style={{
                            padding: '12px 24px',
                            borderBottom: '1px solid var(--md-outline-variant)',
                            background: 'var(--md-surface-container)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                flexWrap: 'wrap',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={16} color="var(--md-primary)" />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                                        Período:
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            border: '1px solid var(--md-outline-variant)',
                                            background: 'var(--md-surface)',
                                            color: 'var(--md-on-surface)',
                                            fontSize: 13,
                                            outline: 'none',
                                        }}
                                    />
                                    <span style={{ color: 'var(--md-on-surface-variant)', fontSize: 13 }}>até</span>
                                    <input
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            border: '1px solid var(--md-outline-variant)',
                                            background: 'var(--md-surface)',
                                            color: 'var(--md-on-surface)',
                                            fontSize: 13,
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: 16,
                                            border: 'none',
                                            background: 'var(--md-error-container)',
                                            color: 'var(--md-on-error-container)',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <X size={12} />
                                        Limpar
                                    </button>
                                )}
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: 12,
                                    color: 'var(--md-on-surface-variant)',
                                }}>
                                    {notasFiltradas.length} de {notas.length} nota(s)
                                </span>
                            </div>
                        </div>

                        {/* Toolbar */}
                        {notasFiltradas.length > 0 && (
                            <div style={{
                                padding: '12px 24px',
                                borderBottom: '1px solid var(--md-outline-variant)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--md-surface-container-lowest)',
                            }}>
                                <button
                                    onClick={handleSelectAll}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--md-on-surface)',
                                        fontSize: 13,
                                        padding: 0,
                                    }}
                                >
                                    {selectedIds.size === pendentesCount && pendentesCount > 0 ? (
                                        <CheckSquare size={18} color="var(--md-primary)" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                    Selecionar todas pendentes
                                </button>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        variant="filled"
                                        onClick={handleEmitirSelecionadas}
                                        disabled={selectedIds.size === 0 || emitting}
                                    >
                                        {emitting ? (
                                            <Loader2 size={16} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Send size={16} style={{ marginRight: 8 }} />
                                        )}
                                        Emitir Selecionadas ({selectedIds.size})
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                            {loading ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 40,
                                }}>
                                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--md-primary)' }} />
                                    <p style={{ marginTop: 12, color: 'var(--md-on-surface-variant)' }}>
                                        Carregando notas...
                                    </p>
                                </div>
                            ) : notas.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 40,
                                    color: 'var(--md-on-surface-variant)',
                                }}>
                                    <FileText size={48} strokeWidth={1} />
                                    <p style={{ marginTop: 12, fontSize: 14 }}>
                                        Nenhuma nota pendente
                                    </p>
                                    <p style={{ fontSize: 12, opacity: 0.8 }}>
                                        As notas salvas para emissão em lote aparecerão aqui
                                    </p>
                                </div>
                            ) : notasFiltradas.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 40,
                                    color: 'var(--md-on-surface-variant)',
                                }}>
                                    <Filter size={48} strokeWidth={1} />
                                    <p style={{ marginTop: 12, fontSize: 14 }}>
                                        Nenhuma nota no período selecionado
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        style={{
                                            marginTop: 8,
                                            padding: '8px 16px',
                                            borderRadius: 20,
                                            border: 'none',
                                            background: 'var(--md-primary)',
                                            color: 'white',
                                            fontSize: 13,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {notasFiltradas.map(nota => {
                                        const isSelectable = nota.status === 'pendente' || nota.status === 'erro';
                                        const isSelected = selectedIds.has(nota.id);

                                        return (
                                            <motion.div
                                                key={nota.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    padding: '12px 16px',
                                                    background: isSelected ? 'var(--md-primary-container)' : 'var(--md-surface-container)',
                                                    borderRadius: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    border: isSelected ? '2px solid var(--md-primary)' : '1px solid transparent',
                                                    cursor: isSelectable ? 'pointer' : 'default',
                                                    opacity: nota.status === 'cancelada' ? 0.5 : 1,
                                                }}
                                                onClick={() => isSelectable && handleToggleSelect(nota.id)}
                                            >
                                                {/* Checkbox */}
                                                {isSelectable && (
                                                    <div style={{ color: isSelected ? 'var(--md-primary)' : 'var(--md-outline)' }}>
                                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                    </div>
                                                )}

                                                {/* Status Icon */}
                                                <div style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    background: nota.status === 'emitida' ? 'rgba(34, 197, 94, 0.1)' :
                                                        nota.status === 'erro' ? 'rgba(239, 68, 68, 0.1)' :
                                                            'var(--md-surface-container-high)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {getStatusIcon(nota.status)}
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            padding: '2px 6px',
                                                            borderRadius: 4,
                                                            background: nota.tipo === 'nfe' ? 'var(--md-primary-container)' :
                                                                nota.tipo === 'nfce' ? 'var(--md-secondary-container)' :
                                                                    'var(--md-tertiary-container)',
                                                            color: nota.tipo === 'nfe' ? 'var(--md-on-primary-container)' :
                                                                nota.tipo === 'nfce' ? 'var(--md-on-secondary-container)' :
                                                                    'var(--md-on-tertiary-container)',
                                                        }}>
                                                            {getTipoLabel(nota.tipo)}
                                                        </span>
                                                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--md-on-surface)' }}>
                                                            {nota.clienteNome || `Venda ${nota.vendaId?.slice(0, 8) || nota.id.slice(0, 8)}`}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 12, color: 'var(--md-on-surface-variant)' }}>
                                                        <span>{formatDate(nota.dataCriacao)}</span>
                                                        <span style={{ fontWeight: 600 }}>
                                                            R$ {nota.valorTotal.toFixed(2)}
                                                        </span>
                                                        {nota.numeroNota && (
                                                            <span>Nº {nota.numeroNota}</span>
                                                        )}
                                                    </div>
                                                    {nota.ultimoErro && nota.status === 'erro' && (
                                                        <div style={{
                                                            marginTop: 4,
                                                            fontSize: 11,
                                                            color: 'var(--md-error)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                        }}>
                                                            <AlertTriangle size={12} />
                                                            {nota.ultimoErro}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div style={{
                                                    fontSize: 12,
                                                    padding: '4px 10px',
                                                    borderRadius: 16,
                                                    background: nota.status === 'emitida' ? 'rgba(34, 197, 94, 0.1)' :
                                                        nota.status === 'erro' ? 'rgba(239, 68, 68, 0.1)' :
                                                            nota.status === 'processando' ? 'rgba(59, 130, 246, 0.1)' :
                                                                'var(--md-surface-container-high)',
                                                    color: nota.status === 'emitida' ? 'var(--accent-success)' :
                                                        nota.status === 'erro' ? 'var(--md-error)' :
                                                            nota.status === 'processando' ? 'var(--md-primary)' :
                                                                'var(--md-on-surface-variant)',
                                                    fontWeight: 500,
                                                }}>
                                                    {getStatusLabel(nota.status)}
                                                </div>

                                                {/* Actions */}
                                                {(nota.status === 'pendente' || nota.status === 'erro') && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemover(nota.id);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: 8,
                                                            cursor: 'pointer',
                                                            color: 'var(--md-error)',
                                                            borderRadius: 8,
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: 16,
                                        padding: '12px 16px',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        background: message.type === 'success' ? 'var(--md-primary-container)' :
                                            message.type === 'error' ? 'var(--md-error-container)' :
                                                'var(--md-surface-container-high)',
                                        color: message.type === 'success' ? 'var(--md-on-primary-container)' :
                                            message.type === 'error' ? 'var(--md-on-error-container)' :
                                                'var(--md-on-surface)',
                                    }}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid var(--md-outline-variant)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                        }}>
                            <Button variant="text" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotasPendentesDialog;
