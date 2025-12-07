export { };

declare global {
    interface Window {
        api: {
            saveSale: (saleData: any) => Promise<{ success: boolean; saleId?: string; error?: string }>;
        };
    }
}
