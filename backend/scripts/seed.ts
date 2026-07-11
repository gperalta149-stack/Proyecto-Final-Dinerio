console.log('DEBUG 1: Script empezando...');
import { query } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
console.log('DEBUG 2: Importaciones completadas');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('DEBUG 3: __dirname calculado:', __dirname);
async function seedDatabase()  {
    try {
        console.log('DEBUG 4:  Starting database seed...');

        const seedPath = path.join(__dirname, '../db/seedData.sql');
        console.log('DEBUG 5: Seed file path:', seedPath);

    if (!fs.existsSync(seedPath))  {
        console.error('DEBUG 6: Seed file not found at:', seedPath);
        return;
    }
    console.log('DEBUG 7: Seed file exists');

    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    console.log('DEBUG 8: Seed file read successfully');

    console.log('DEBUG 9: Executing seed statements...');

    const statements = seedSQL.split(';').filter(stmt => stmt.trim());
    console.log('DEBUG 10: Found', statements.length, 'SQL statements');

    let successCount = 0;
    let errorCount = 0 ;

    for (let i  = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
            try {
            console.log(`DEBUG: Executing statement ${i + 1}/${statements.length}`);
            const result = await query(statement + ';');
            successCount++;
            console.log(`Statement ${i + 1} executed successfully`);
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
        console.log('USUARIOS:');
        users.rows.forEach((user: any) => {
            console.log(`   - ${user.email} (${user.first_name}) - ${user.role}`);
        });

        const subscriptions = await query('SELECT COUNT(*) as count FROM subscriptions;');
        console.log(`SUSCRIPCIONES: ${subscriptions.rows[0].count}`);

        const categories = await query('SELECT COUNT(*) as count FROM categories;');
        console.log(`CATEGORÍAS: ${categories.rows[0].count}`);

        } catch (error: any) {
        console.error('Error verificando datos:', error.message);
        }

    console.log('\n CREDENCIALES PARA PRUEBAS:');
    console.log('   ADMIN: admin@dinerio.com / Admin2025*');
    console.log('   USER:  usuario@ejemplo.com / Password123');
    console.log('   USER:  maria.garcia@ejemplo.com / Password123');

    } catch (error: any) {
        console.error('Fatal error seeding database:', error.message);
    }
}
console.log('DEBUG: Llamando a seedDatabase...');
    seedDatabase().then(() => {
    console.log('Todo el proceso completado');
    }).catch((error: any) => {
    console.error('Error general:', error.message);
});
