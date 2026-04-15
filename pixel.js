/* KURAYAMI TEAM - PIXEL HANDLER (ULTIMATE FIX) */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
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

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));

        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (!cmd) return;

        // --- LÓGICA DE BOT PRIMARIO (FILTRO DE EJECUCIÓN) ---
        if (isGroup && commandName !== 'setprimary') {
            const databasePath = path.resolve('./jsons/preferencias.json');
            const sessionsPath = path.resolve('./sesiones_subbots');
            const myNumber = conn.user.id.split(':')[0].split('@')[0];

            if (fs.existsSync(databasePath)) {
                let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
                
                if (db[chat]) {
                    const primaryNumber = db[chat];
                    const isPrimaryActive = fs.existsSync(path.join(sessionsPath, primaryNumber)) || primaryNumber === myNumber;

                    if (isPrimaryActive) {
                        if (myNumber !== primaryNumber) return; // Si no soy el elegido, ignoro el comando
                    } else {
                        delete db[chat];
                        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
                    }
                }
            }
        }

        if (!usedPrefix && !cmd.noPrefix) return;
        if (!isGroup && !isOwner && commandName !== 'code') return;

        if (cmd.isOwner && !isOwner) {
            return m.reply(`*❁* \`ACCESO DENEGADO\` *❁*\n\nID: \`${sender}\`\n\n> ¡Solo mi desarrollador puede usar esto!`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply('*✿︎* \`Aviso\` *✿︎*\n\nEste comando solo puede ser utilizado en grupos.\n\n> ¡Inténtalo en un chat grupal!');
        }

        logger(m, conn);
        await cmd.run(conn, m, args, usedPrefix, commandName, text);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};