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
        
        // 1. Definir el chat de forma segura antes de usarlo
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 2. --- MOTOR LID (KURAYAMI) ---
        // Sincronizamos el sender. Si falla, usamos el original para no detener el bot.
        try {
            m.sender = await syncLid(conn, m, chat);
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 3. Extraer el cuerpo del mensaje (Cualquier tipo)
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        // 4. Variables de mando
        const prefix = config.prefix || '!'; 
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        // 5. Validaciones de Identidad
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat ? chat.endsWith('@g.us') : false; // Protección para el error 'endsWith'
        
        // Logger oficial
        logger(m, conn);

        if (isCmd) {
            const cmd = global.commands.get(command) || 
                        Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(command));

            if (cmd) {
                // Filtros de seguridad
                if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso restringido.');
                if (cmd.isGroup && !isGroup) return m.reply('❌ Comando para grupos.');

                // Ejecución del Módulo
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
        console.error(chalk.red('\n[❌] ERROR EN HANDLER:'), err);
    }
};