import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    width?: string | number;
    children: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    style,
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyle: any = {
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontFamily: 'inherit',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'var(--transition-normal)',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
        ...style,
    };

    const variants: Record<string, any> = {
        primary: {
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #0D9488 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px -4px var(--accent-primary-glow), inset 0 1px 0 rgba(255,255,255,0.15)',
        },
        secondary: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
        },
        danger: {
            background: 'linear-gradient(135deg, var(--accent-danger) 0%, #DC2626 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px -4px rgba(248, 113, 113, 0.4)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent',
        },
    };

    const sizes: Record<string, any> = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.875rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
    };

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{ ...baseStyle, ...variants[variant], ...sizes[size] }}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    );
};

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    glass?: boolean;
    glow?: boolean;
}

export const Card = ({ children, glass = true, glow = false, style, ...props }: CardProps) => {
    const cardStyle: any = {
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        background: glass
            ? 'linear-gradient(135deg, var(--glass-bg) 0%, rgba(26, 36, 46, 0.9) 100%)'
            : 'var(--bg-secondary)',
        backdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        border: '1px solid var(--glass-border)',
        boxShadow: glow
            ? 'var(--glass-shadow), var(--card-glow)'
            : 'var(--glass-shadow)',
        transition: 'var(--transition-normal)',
        ...style,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={cardStyle}
            {...props}
        >
            {children}
        </motion.div>
    );
};

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'syncing';
    label?: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
    const statusConfig = {
        online: { color: 'var(--accent-success)', text: label || 'ONLINE' },
        offline: { color: 'var(--accent-danger)', text: label || 'OFFLINE' },
        syncing: { color: 'var(--accent-secondary)', text: label || 'SINCRONIZANDO' },
    };

    const { color, text } = statusConfig[status];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-xl)',
                background: `${color}15`,
                border: `1px solid ${color}30`,
            }}
        >
            <motion.div
                animate={{
                    boxShadow: [
                        `0 0 0 0 ${color}`,
                        `0 0 0 8px transparent`
                    ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                }}
            />
            <span style={{
                color,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
            }}>
                {text}
            </span>
        </motion.div>
    );
};
