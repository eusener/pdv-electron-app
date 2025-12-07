import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Material You Button Variants
type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
    variant?: ButtonVariant;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button = ({
    variant = 'filled',
    icon,
    children,
    style,
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyle: any = {
        height: 40,
        minWidth: 48,
        padding: icon ? '0 24px 0 16px' : '0 24px',
        borderRadius: 'var(--shape-corner-full)',
        fontFamily: 'var(--font-family)',
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: 0.1,
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        border: 'none',
        outline: 'none',
        transition: 'all 200ms ease',
        opacity: disabled ? 0.38 : 1,
        position: 'relative',
        overflow: 'hidden',
        ...style,
    };

    const variants: Record<ButtonVariant, any> = {
        filled: {
            background: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            boxShadow: 'var(--elevation-1)',
        },
        tonal: {
            background: 'var(--md-secondary-container)',
            color: 'var(--md-on-secondary-container)',
        },
        outlined: {
            background: 'transparent',
            color: 'var(--md-primary)',
            border: '1px solid var(--md-outline)',
        },
        text: {
            background: 'transparent',
            color: 'var(--md-primary)',
            padding: icon ? '0 16px 0 12px' : '0 16px',
        },
        elevated: {
            background: 'var(--md-surface-container-low)',
            color: 'var(--md-primary)',
            boxShadow: 'var(--elevation-1)',
        },
    };

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            style={{ ...baseStyle, ...variants[variant] }}
            disabled={disabled}
            {...props}
        >
            {icon && <span style={{ display: 'flex', fontSize: 18 }}>{icon}</span>}
            {children}
        </motion.button>
    );
};

// Material You FAB (Floating Action Button)
interface FABProps extends HTMLMotionProps<"button"> {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
    icon: React.ReactNode;
    label?: string;
}

export const FAB = ({
    size = 'medium',
    variant = 'primary',
    icon,
    label,
    style,
    ...props
}: FABProps) => {
    const sizes = {
        small: { width: 40, height: 40, iconSize: 24 },
        medium: { width: 56, height: 56, iconSize: 24 },
        large: { width: 96, height: 96, iconSize: 36 },
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: 'var(--md-primary-container)',
            color: 'var(--md-on-primary-container)',
        },
        secondary: {
            background: 'var(--md-secondary-container)',
            color: 'var(--md-on-secondary-container)',
        },
        tertiary: {
            background: 'var(--md-tertiary-container)',
            color: 'var(--md-on-tertiary-container)',
        },
        surface: {
            background: 'var(--md-surface-container-high)',
            color: 'var(--md-primary)',
        },
    };

    const config = sizes[size];
    const isExtended = !!label;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                width: isExtended ? 'auto' : config.width,
                height: config.height,
                padding: isExtended ? '0 20px 0 16px' : 0,
                borderRadius: size === 'large' ? 'var(--shape-corner-extra-large)' : 'var(--shape-corner-large)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: 'var(--elevation-3)',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: 0.1,
                ...variants[variant],
                ...style,
            }}
            {...props}
        >
            <span style={{ fontSize: config.iconSize, display: 'flex' }}>{icon}</span>
            {label && <span>{label}</span>}
        </motion.button>
    );
};

// Material You Card
interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'elevated' | 'filled' | 'outlined';
    children: React.ReactNode;
}

export const Card = ({
    variant = 'filled',
    children,
    style,
    ...props
}: CardProps) => {
    const variants: Record<string, React.CSSProperties> = {
        elevated: {
            background: 'var(--md-surface-container-low)',
            boxShadow: 'var(--elevation-1)',
        },
        filled: {
            background: 'var(--md-surface-container-highest)',
        },
        outlined: {
            background: 'var(--md-surface)',
            border: '1px solid var(--md-outline-variant)',
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                borderRadius: 'var(--shape-corner-medium)',
                padding: 'var(--space-md)',
                ...variants[variant],
                ...style,
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Material You Chip
interface ChipProps {
    label: string;
    icon?: React.ReactNode;
    selected?: boolean;
    onClick?: () => void;
}

export const Chip = ({ label, icon, selected, onClick }: ChipProps) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                height: 32,
                padding: icon ? '0 16px 0 8px' : '0 16px',
                borderRadius: 'var(--shape-corner-small)',
                border: selected ? 'none' : '1px solid var(--md-outline)',
                background: selected ? 'var(--md-secondary-container)' : 'transparent',
                color: selected ? 'var(--md-on-secondary-container)' : 'var(--md-on-surface-variant)',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
            }}
        >
            {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
            {label}
        </motion.button>
    );
};

// Material You Status Badge (using chips style)
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'syncing';
    label?: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
    const config = {
        online: { color: '#4ADE80', text: label || 'Online', icon: <Wifi size={16} /> },
        offline: { color: '#F87171', text: label || 'Offline', icon: <WifiOff size={16} /> },
        syncing: { color: '#FBBF24', text: label || 'Sincronizando', icon: <RefreshCw size={16} /> },
    };

    const { color, text, icon } = config[status];

    return (
        <div style={{
            height: 32,
            padding: '0 12px',
            borderRadius: 'var(--shape-corner-small)',
            background: 'var(--md-surface-container-highest)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--md-on-surface-variant)',
        }}>
            <motion.span
                animate={status === 'syncing' ? { rotate: 360 } : { opacity: [1, 0.5, 1] }}
                transition={status === 'syncing'
                    ? { duration: 1, repeat: Infinity, ease: 'linear' }
                    : { duration: 2, repeat: Infinity }
                }
                style={{ color, display: 'flex', alignItems: 'center' }}
            >
                {icon}
            </motion.span>
            <span>{text}</span>
        </div>
    );
};

// Material You List Item
interface ListItemProps {
    leadingIcon?: React.ReactNode;
    headline: string;
    supportingText?: string;
    trailingContent?: React.ReactNode;
    onClick?: () => void;
}

export const ListItem = ({
    leadingIcon,
    headline,
    supportingText,
    trailingContent,
    onClick,
}: ListItemProps) => {
    return (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: '12px 16px',
                minHeight: 56,
                cursor: onClick ? 'pointer' : 'default',
                borderRadius: 'var(--shape-corner-medium)',
            }}
        >
            {leadingIcon && (
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--shape-corner-full)',
                    background: 'var(--md-primary-container)',
                    color: 'var(--md-on-primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                }}>
                    {leadingIcon}
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: 'var(--md-on-surface)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {headline}
                </div>
                {supportingText && (
                    <div style={{
                        fontSize: 14,
                        color: 'var(--md-on-surface-variant)',
                        marginTop: 2,
                    }}>
                        {supportingText}
                    </div>
                )}
            </div>
            {trailingContent && (
                <div style={{ color: 'var(--md-on-surface-variant)' }}>
                    {trailingContent}
                </div>
            )}
        </motion.div>
    );
};
