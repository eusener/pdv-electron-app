import fs from 'fs';
import path from 'path';
import { query } from './index';

export const initDatabase = async () => {
    try {
        console.log('🔄 Initializing Database...');

        // Read schema file
        // In production, resources might be packed differently, considering path relative to main process execution
        // For dev, __dirname is usually src/ or dist/main
        const schemaPath = path.resolve(__dirname, '../../src/database/schema.sql');

        // Fallback for dev/prod paths - simpler to inline for now or improve path resolution later
        // For this step, I'll read from the source path assuming dev environment or standard forge structure

        let schemaSql = '';
        try {
            schemaSql = fs.readFileSync(schemaPath, 'utf8');
        } catch (err) {
            // Try looking relative to app root if packed
            schemaSql = fs.readFileSync(path.join(process.cwd(), 'src/database/schema.sql'), 'utf8');
            console.log('Fallback read schema success');
        }

        if (!schemaSql) {
            throw new Error('Schema SQL is empty or could not be read');
        }

        // Split by semicolon? No, pg driver usually handles multiple statements or we can use a loop
        // BUT pg query simple protocol allows multiple statements
        await query(schemaSql);

        console.log('✅ Database Schema Applied Successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
    }
};
