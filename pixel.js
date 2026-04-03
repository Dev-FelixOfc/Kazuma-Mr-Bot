/* KURAYAMI TEAM - PIXEL HANDLER (FIXED) */

import chalk from 'chalk';
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const sender = m.sender || m.key.participant || m.key.remoteJid;
        const misIdentidades = config.owner || [];

        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body) return;

        // Muro de Privado para usuarios no dueños
        if (!isGroup && !isOwner && body.toLowerCase() !== 'code') return;

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));

        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            if (!usedPrefix && !cmd.noPrefix) return;

            if (cmd.isOwner && !isOwner) {
                return m.reply(`🚫 *ACCESO DENEGADO*\n\nID: \`${sender}\``);
            }

            if (cmd.isGroup && !isGroup) return m.reply('❌ Solo para grupos.');

            logger(m, conn);
            // Ejecución segura del comando
            await cmd.run(conn, m, args, usedPrefix, commandName, text);
        }

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};