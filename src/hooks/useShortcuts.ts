import { useEffect } from 'react';

interface ShortcutHandlers {
    onF1?: () => void;
    onF2?: () => void;
    onF3?: () => void;
    onF4?: () => void;
    onF5?: () => void;
    onF6?: () => void;
    onF7?: () => void;
    onF8?: () => void;
    onF9?: () => void;
    onF10?: () => void;
    onF11?: () => void;
    onF12?: () => void;
    onEscape?: () => void;
    onEnter?: () => void;
}

export const useShortcuts = (handlers: ShortcutHandlers) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Allow default browser behavior for some keys if needed, but mostly prevent for PDV

            switch (e.key) {
                case 'F1':
                    e.preventDefault();
                    handlers.onF1?.();
                    break;
                case 'F2':
                    e.preventDefault();
                    handlers.onF2?.();
                    break;
                case 'F3':
                    e.preventDefault();
                    handlers.onF3?.();
                    break;
                case 'F4':
                    e.preventDefault();
                    handlers.onF4?.();
                    break;
                case 'F5':
                    // e.preventDefault(); // Keep reload for dev? Or prevent?
                    // PDVs usually prevent reload.
                    if (handlers.onF5) {
                        e.preventDefault();
                        handlers.onF5();
                    }
                    break;
                case 'F6':
                    e.preventDefault();
                    handlers.onF6?.();
                    break;
                case 'F7':
                    e.preventDefault();
                    handlers.onF7?.();
                    break;
                case 'F8':
                    e.preventDefault();
                    handlers.onF8?.();
                    break;
                case 'F9':
                    e.preventDefault();
                    handlers.onF9?.();
                    break;
                case 'F10':
                    e.preventDefault();
                    handlers.onF10?.();
                    break;
                case 'F11':
                    // Fullscreen usually, let it be unless handler provided
                    if (handlers.onF11) {
                        e.preventDefault();
                        handlers.onF11();
                    }
                    break;
                case 'F12':
                    // DevTools, probably keep default
                    if (handlers.onF12) {
                        e.preventDefault();
                        handlers.onF12();
                    }
                    break;
                case 'Escape':
                    // Useful for closing modals
                    handlers.onEscape?.();
                    break;
                case 'Enter':
                    handlers.onEnter?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};
