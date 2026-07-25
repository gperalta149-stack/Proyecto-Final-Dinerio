import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/config/database.js';

// helper logger: logs only when DEBUG=true in env
const debug = (...args: any[]) => { if (process.env.DEBUG === 'true') console.log(...args); };

debug('Importaciones completadas');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
debug('__dirname calculado:', __dirname);
async function seedDatabase()  {
    try {
        debug('Starting database seed...');

        const seedPath = path.join(__dirname, '../db/seedData.sql');
        debug('Seed file path:', seedPath);

    if (!fs.existsSync(seedPath))  {
            console.error('Seed file not found at:', seedPath);
        return;
    }
        debug('Seed file exists');

    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    debug('Seed file read successfully');

    debug('Executing seed statements...');

    const statements = seedSQL.split(';').filter(stmt => stmt.trim());
        debug('Found', statements.length, 'SQL statements');

    let successCount = 0;
    let errorCount = 0 ;

    for (let i  = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
            try {
            console.log(`DEBUG: Executing statement ${i + 1}/${statements.length}`);
            const result = await query(statement + ';');
            successCount++;
            debug(`Statement ${i + 1} executed successfully`);
            } catch (error: any) {
            console.error(`Error executing statement ${i + 1}:`, error.message);
            errorCount++;
            }
        }
    }

    console.log(`\n SEED COMPLETED! ${successCount} statements executed, ${errorCount} errors`);

        console.log('\n VERIFICANDO DATOS INSERTADOS:');

        try {
            const users = await query('SELECT email, first_name, role FROM users;');
            // Print only summary counts to avoid exposing email addresses in logs
            console.log(`USUARIOS: ${users.rowCount}`);
            debug('USUARIOS detalle (solo en DEBUG):', users.rows.map((u: any) => ({ email: u.email, name: u.first_name, role: u.role })));

            const subscriptions = await query('SELECT COUNT(*) as count FROM subscriptions;');
            console.log(`SUSCRIPCIONES: ${subscriptions.rows[0].count}`);

            const categories = await query('SELECT COUNT(*) as count FROM categories;');
            console.log(`CATEGORÍAS: ${categories.rows[0].count}`);

            } catch (error: any) {
            console.error('Error verificando datos:', error.message);
            }

        // No imprimir contraseñas ni credenciales en claro. Indicar ubicación de credenciales de prueba.
        console.log('\n CREDENCIALES PARA PRUEBAS: Ver README.md o db/seedData.sql (contraseñas no se muestran en logs)');

    } catch (error: any) {
        console.error('Fatal error seeding database:', error.message);
    }
}
debug('Llamando a seedDatabase...');
seedDatabase().then(() => {
  console.log('Todo el proceso completado');
}).catch((error: any) => {
  console.error('Error general:', error.message);
});
