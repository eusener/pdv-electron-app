import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    supportingText?: string;
    error?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}

export const Input = ({
    label,
    supportingText,
    error,
    leadingIcon,
    trailingIcon,
    style,
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = !!props.value;

    return (
        <div style={{ width: '100%', ...style }}>
            {/* Filled Text Field Container */}
            <motion.div
                animate={{
                    borderColor: error
                        ? 'var(--md-error)'
                        : isFocused
                            ? 'var(--md-primary)'
                            : 'transparent',
                }}
                style={{
                    position: 'relative',
                    background: 'var(--md-surface-container-highest)',
                    borderRadius: 'var(--shape-corner-extra-small) var(--shape-corner-extra-small) 0 0',
                    borderBottom: '1px solid',
                    borderColor: error ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
                }}
            >
                {/* Leading Icon */}
                {leadingIcon && (
                    <span style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 20,
                        display: 'flex',
                    }}>
                        {leadingIcon}
                    </span>
                )}

                {/* Input */}
                <input
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    style={{
                        width: '100%',
                        height: 56,
                        padding: label
                            ? `20px ${trailingIcon ? 48 : 16}px 8px ${leadingIcon ? 48 : 16}px`
                            : `16px ${trailingIcon ? 48 : 16}px 16px ${leadingIcon ? 48 : 16}px`,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'var(--font-family)',
                        fontSize: 16,
                        color: 'var(--md-on-surface)',
                        caretColor: error ? 'var(--md-error)' : 'var(--md-primary)',
                    }}
                    {...props}
                />

                {/* Floating Label */}
                {label && (
                    <motion.label
                        animate={{
                            top: (isFocused || hasValue) ? 8 : '50%',
                            fontSize: (isFocused || hasValue) ? 12 : 16,
                            color: error
                                ? 'var(--md-error)'
                                : isFocused
                                    ? 'var(--md-primary)'
                                    : 'var(--md-on-surface-variant)',
                        }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            left: leadingIcon ? 48 : 16,
                            transform: (isFocused || hasValue) ? 'none' : 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontFamily: 'var(--font-family)',
                        }}
                    >
                        {label}
                    </motion.label>
                )}

                {/* Active Indicator */}
                <motion.div
                    animate={{
                        scaleX: isFocused ? 1 : 0,
                        opacity: isFocused ? 1 : 0,
                    }}
                    style={{
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: error ? 'var(--md-error)' : 'var(--md-primary)',
                        transformOrigin: 'center',
                    }}
                />

                {/* Trailing Icon */}
                {trailingIcon && (
                    <span style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--md-on-surface-variant)',
                        fontSize: 20,
                        display: 'flex',
                    }}>
                        {trailingIcon}
                    </span>
                )}
            </motion.div>

            {/* Supporting Text */}
            {supportingText && (
                <div style={{
                    padding: '4px 16px 0',
                    fontSize: 12,
                    color: error ? 'var(--md-error)' : 'var(--md-on-surface-variant)',
                }}>
                    {supportingText}
                </div>
            )}
        </div>
    );
};

import { Search } from 'lucide-react';

// Search Bar (M3 Style)
interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
}

export const SearchBar = ({ onSearch, style, ...props }: SearchBarProps) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 56,
            padding: '0 16px',
            background: 'var(--md-surface-container-high)',
            borderRadius: 'var(--shape-corner-full)',
            gap: 16,
            ...style,
        }}>
            <span style={{
                color: 'var(--md-on-surface-variant)',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Search size={24} />
            </span>
            <input
                type="text"
                style={{
                    flex: 1,
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-family)',
                    fontSize: 16,
                    color: 'var(--md-on-surface)',
                }}
                {...props}
            />
        </div>
    );
};
