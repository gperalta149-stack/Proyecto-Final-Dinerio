import bcrypt from 'bcryptjs';

async function generateHashes() {
    console.log('Generando hashes bcrypt válidos...\n');

    try {
        // Se genera hash para Admin (password no se imprime por seguridad)
        const adminHash = await bcrypt.hash('Admin2025*', 10);
        console.log('ADMIN - admin@dinerio.com (password oculto)');
        console.log('Hash:', adminHash);
        console.log('SQL (use este valor para insertar en la DB):');
        console.log(`'${adminHash}'`);
        console.log('');

        // Se genera hash para usuario (password no se imprime por seguridad)
        const userHash = await bcrypt.hash('Password123', 10);
        console.log('USER - usuario@ejemplo.com (password oculto)');
        console.log('Hash:', userHash);
        console.log('SQL (use este valor para insertar en la DB):');
        console.log(`'${userHash}'`);


    } catch (error) {
        console.error('Error generando hashes:', error);
    }
}
generateHashes();
