import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, style, ...props }: InputProps) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
            width: '100%',
            ...style
        }}>
            {label && (
                <label style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginLeft: '4px',
                }}>
                    {label}
                </label>
            )}
            <motion.div
                whileFocusWithin={{
                    borderColor: 'var(--accent-primary)',
                    boxShadow: '0 0 0 3px var(--accent-primary-glow)',
                }}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {icon && (
                    <span style={{
                        position: 'absolute',
                        left: 16,
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                    }}>
                        {icon}
                    </span>
                )}
                <input
                    style={{
                        width: '100%',
                        padding: icon ? '1rem 1rem 1rem 3rem' : '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'var(--transition-normal)',
                        fontFamily: 'inherit',
                    }}
                    {...props}
                />
            </motion.div>
            {error && (
                <span style={{
                    color: 'var(--accent-danger)',
                    fontSize: '0.75rem',
                    marginLeft: '4px',
                }}>
                    {error}
                </span>
            )}
        </div>
    );
};
