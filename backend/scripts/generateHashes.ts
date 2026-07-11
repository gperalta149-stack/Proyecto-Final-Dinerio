import bcrypt from 'bcryptjs';

async function generateHashes() {
    console.log('Generando hashes bcrypt válidos...\n');

    try {
        // Se genera hash para Admin2025*
        const adminHash = await bcrypt.hash('Admin2025*', 10);
        console.log('ADMIN - admin@dinerio.com / Admin2025*');
        console.log('Hash:', adminHash);
        console.log('SQL:');
        console.log(`'${adminHash}'`);
        console.log('');

        // Se genera hash para Password123
        const userHash = await bcrypt.hash('Password123', 10);
        console.log('USER - usuario@ejemplo.com / Password123');
        console.log('Hash:', userHash);
        console.log('SQL:');
        console.log(`'${userHash}'`);


    } catch (error) {
        console.error('Error generando hashes:', error);
    }
}
generateHashes();
