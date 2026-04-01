/* KURAYAMI TEAM - PIXEL HANDLER (SECURITY V2) 
   Lógica: Identidad Dual + Muro de Privado Anti-Spam
*/

import chalk from 'chalk';
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const sender = m.sender || m.key.participant || m.key.remoteJid;
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // 1. --- VALIDACIÓN DE DUEÑO E IDENTIDAD ---
        const owners = Array.isArray(config.owner) ? config.owner : [config.owner];
        const isOwner = owners.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        // 2. --- MURO ANTI-SPAM (SOLO OWNER EN PRIVADO) ---
        // Si no es grupo y no eres owner, el bot se desconecta de la lógica aquí mismo.
        if (!isGroup && !isOwner) {
            // Solo permitimos el comando 'code' o vinculación si es necesario
            const firstWord = body.trim().split(/ +/)[0].toLowerCase();
            if (firstWord !== 'code' && firstWord !== 'vinculación') return; 
        }

        // 3. --- LÓGICA DE PREFIJOS ---
        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));
        
        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. --- EJECUCIÓN ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Protección adicional: Si el comando no es noPrefix y no se usó prefijo, ignorar.
            if (!usedPrefix && !cmd.noPrefix) return;

            // Validación de rango
            if (cmd.isOwner && !isOwner) return; // Ni siquiera responde para no dar pistas

            if (cmd.isGroup && !isGroup) return m.reply('❌ Este comando es solo para grupos.');

            // Si todo está bien, registramos y ejecutamos
            logger(m, conn);
            await cmd.run(conn, m, { 
                body, 
                prefix: config.prefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red('[ERROR HANDLER]'), err);
    }
};