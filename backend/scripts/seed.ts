import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/config/database.js';

import logger from '../src/config/logger.js';

logger.debug('Importaciones completadas');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
logger.debug('__dirname calculado:', __dirname);
async function seedDatabase()  {
    try {
        logger.info('Starting database seed...');

        const seedPath = path.join(__dirname, '../db/seedData.sql');
        logger.debug('Seed file path:', seedPath);

    if (!fs.existsSync(seedPath))  {
            console.error('Seed file not found at:', seedPath);
        return;
    }
        logger.debug('Seed file exists');

    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    logger.debug('Seed file read successfully');

    logger.debug('Executing seed statements...');

    const statements = seedSQL.split(';').filter(stmt => stmt.trim());
        logger.debug('Found', statements.length, 'SQL statements');

    let successCount = 0;
    let errorCount = 0 ;

    for (let i  = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
            try {
            logger.debug(`Executing statement ${i + 1}/${statements.length}`);
            const result = await query(statement + ';');
            successCount++;
            logger.debug(`Statement ${i + 1} executed successfully`);
            } catch (error: any) {
            console.error(`Error executing statement ${i + 1}:`, error.message);
            errorCount++;
            }
        }
    }

    logger.info(`\n SEED COMPLETED! ${successCount} statements executed, ${errorCount} errors`);

            logger.info('\n VERIFICANDO DATOS INSERTADOS:');

        try {
            const users = await query('SELECT email, first_name, role FROM users;');
            // Print only summary counts to avoid exposing email addresses in logs
            logger.info(`USUARIOS: ${users.rowCount}`);
            debug('USUARIOS detalle (solo en DEBUG):', users.rows.map((u: any) => ({ email: u.email, name: u.first_name, role: u.role })));

            const subscriptions = await query('SELECT COUNT(*) as count FROM subscriptions;');
            logger.info(`SUSCRIPCIONES: ${subscriptions.rows[0].count}`);

            const categories = await query('SELECT COUNT(*) as count FROM categories;');
            logger.info(`CATEGORÍAS: ${categories.rows[0].count}`);

            } catch (error: any) {
            console.error('Error verificando datos:', error.message);
            }

        // No imprimir contraseñas ni credenciales en claro. Indicar ubicación de credenciales de prueba.
        logger.info('\n CREDENCIALES PARA PRUEBAS: Ver README.md o db/seedData.sql (contraseñas no se muestran en logs)');

    } catch (error: any) {
        console.error('Fatal error seeding database:', error.message);
    }
}
logger.debug('Llamando a seedDatabase...');
seedDatabase().then(() => {
  logger.info('Todo el proceso completado');
}).catch((error: any) => {
  logger.error('Error general:', error.message);
});
