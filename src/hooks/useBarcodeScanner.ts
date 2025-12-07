import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void;
    minLength?: number;
    timeLimit?: number; // Time in ms to consider input as part of the same barcode scan
}

export const useBarcodeScanner = ({
    onScan,
    minLength = 3,
    timeLimit = 100
}: UseBarcodeScannerProps) => {
    // Buffer to store scanned characters
    const buffer = useRef<string>('');
    // Timer reference to distinguish manual typing from scanning
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is on an input or textarea (unless checking for global scan)
            // But usually PDVs want global scan. 
            // We'll allow it generally, but maybe check if defaultPrevented
            if (e.defaultPrevented) return;

            // If 'Enter' is pressed, check buffer
            if (e.key === 'Enter') {
                if (buffer.current.length >= minLength) {
                    onScan(buffer.current);
                    buffer.current = '';
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                } else {
                    buffer.current = ''; // Reset if too short
                }
                return;
            }

            // Ignore non-printable keys (Shift, Ctrl, etc.)
            if (e.key.length > 1) return;

            // Add char to buffer
            buffer.current += e.key;

            // Clear previous timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Set new timeout to clear buffer if no new input comes quickly
            timeoutRef.current = setTimeout(() => {
                buffer.current = '';
            }, timeLimit);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [onScan, minLength, timeLimit]);
};
