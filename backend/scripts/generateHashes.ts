import bcrypt from 'bcryptjs';
import logger from '../src/config/logger.js';

async function generateHashes() {
    logger.info('Generando hashes bcrypt válidos...\n');

    try {
        // Se genera hash para Admin (password no se imprime por seguridad)
        const adminHash = await bcrypt.hash('Admin2025*', 10);
        logger.info('ADMIN - admin@dinerio.com (password oculto)');
        logger.debug('Hash:', adminHash);
        logger.info('SQL (use este valor para insertar en la DB):');
        logger.debug(`'${adminHash}'`);
        logger.info('');

        // Se genera hash para usuario (password no se imprime por seguridad)
        const userHash = await bcrypt.hash('Password123', 10);
        logger.info('USER - usuario@ejemplo.com (password oculto)');
        logger.debug('Hash:', userHash);
        logger.info('SQL (use este valor para insertar en la DB):');
        logger.debug(`'${userHash}'`);


    } catch (error) {
        logger.error('Error generando hashes:', error);
    }
}

generateHashes();
