/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import chalk from 'chalk';
import { config } from './config.js';
import { logger } from './config/print.js';
import { syncLid } from './lid/resolver.js'; 

export const pixelHandler = async (conn, m) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. LID Sync (Kurayami Engine)
        try { m.sender = await syncLid(conn, m, chat); } catch (e) {}

        // 2. Extraer Texto
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : body.trim().split(/ +/).shift().toLowerCase();
        
        // 3. Validaciones de Dueño
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat ? chat.endsWith('@g.us') : false;

        // 4. Ejecución de Comandos con Doble Verificación
        // Buscamos el comando en el mapa global
        let cmd = global.commands.get(commandName) || 
                  Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        // Si el comando existe, lo ejecutamos de forma segura
        if (cmd) {
            // Si el comando fue cargado como un módulo ESM, extraemos el default
            const runCmd = cmd.default || cmd;

            if (runCmd && typeof runCmd.run === 'function') {
                // Filtros básicos
                if (runCmd.isOwner && !isOwner) return m.reply('❌ Acceso denegado.');
                if (runCmd.isGroup && !isGroup) return m.reply('❌ Solo en grupos.');

                // Ejecutar pasándole todo para que el comando sea independiente
                await runCmd.run(conn, m, { prefix, commandName, isOwner, isGroup });
            }
        }

        logger(m, conn);
    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};