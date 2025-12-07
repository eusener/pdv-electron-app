import { query } from '../database';

export class SyncWorker {
    private isProcessing = false;
    private intervalId: NodeJS.Timeout | null = null;
    private checkIntervalMs = 5000; // 5 seconds

    start() {
        console.log('🔄 SyncWorker started');
        this.intervalId = setInterval(() => this.processQueue(), this.checkIntervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('🛑 SyncWorker stopped');
    }

    async processQueue() {
        if (this.isProcessing) return;

        try {
            // Check connectivity (simple ping)
            try {
                await fetch('https://www.google.com', { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            } catch (e) {
                // Offline
                return;
            }

            this.isProcessing = true;

            // 1. Fetch pending items
            const result = await query(
                `SELECT * FROM vendas_sync_queue WHERE status = 'PENDING' ORDER BY data_criacao ASC LIMIT 10`
            );

            if (result.rows.length === 0) {
                this.isProcessing = false;
                return;
            }

            console.log(`📡 SyncWorker: Found ${result.rows.length} pending items`);

            for (const item of result.rows) {
                await this.syncItem(item);
            }

        } catch (error) {
            console.error('❌ SyncWorker Error:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async syncItem(item: any) {
        try {
            // TODO: Implement actual SEFAZ/Cloud transmission
            console.log(`📤 Sending XML for Sale ${item.venda_id}...`);

            // Simulate success
            await query(
                `UPDATE vendas_sync_queue SET status = 'SYNCED', data_sincronizacao = NOW() WHERE id = $1`,
                [item.id]
            );

        } catch (error) {
            console.error(`❌ Failed to sync item ${item.id}`, error);
            // Optional: Increment retry count
            await query(
                `UPDATE vendas_sync_queue SET tentativas = tentativas + 1 WHERE id = $1`,
                [item.id]
            );
        }
    }
}
