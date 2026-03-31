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
        if (m.key && m.key.remoteJid === 'status@broadcast') return;

        // 1. Normalización LID
        m.sender = await syncLid(conn, m, m.chat);

        // 2. Cuerpo del mensaje
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        // 3. Prefijo y comandos
        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        // 4. Validación de Owner (Usando exactamente config.owner de tu archivo)
        const isOwner = [conn.user.id.split(':')[0], ...(config.owner || [])].some(num => m.sender.includes(num));
        const isGroup = m.chat.endsWith('@g.us');
        
        // Logger para ver qué pasa en consola
        logger(m, conn);

        if (isCmd) {
            const cmd = global.commands.get(command) || 
                        Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(command));

            if (cmd) {
                // Validaciones simples
                if (cmd.isOwner && !isOwner) return m.reply('❌ Solo mi desarrollador.');
                if (cmd.isGroup && !isGroup) return m.reply('❌ Solo en grupos.');

                // Ejecución
                await cmd.run(conn, m, { 
                    prefix, 
                    command, 
                    args, 
                    text, 
                    isOwner, 
                    isGroup 
                });
            }
        }

    } catch (err) {
        // Esto te dirá exactamente qué línea falla si algo sale mal
        console.log(chalk.red('[ERROR CRÍTICO]'), err);
    }
};