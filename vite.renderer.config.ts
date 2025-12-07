import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async () => {
    const react = (await import('@vitejs/plugin-react')).default; // eslint-disable-line import/no-unresolved
    return {
        plugins: [react()],
    };
});
