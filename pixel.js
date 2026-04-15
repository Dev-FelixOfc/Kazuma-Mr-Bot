/* KURAYAMI TEAM - PIXEL HANDLER (MASTER FIX) */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { logger } from './config/print.js';

const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const sessionsPath = path.join(process.cwd(), 'sesiones_subbots');

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

        // --- LÓGICA DE PREFIJOS DINÁMICOS ---
        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const foundPrefix = allPrefixes.find(p => body.startsWith(p));

        // Esta es la clave: Si el usuario USÓ un prefijo, mantenemos ese.
        // Si NO usó prefijo (noPrefix), usamos '#' para que aparezca en los mensajes.
        let usedPrefix = foundPrefix ? foundPrefix : '#';

        let commandName = foundPrefix 
            ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        // --- LÓGICA DE BOT PRIMARIO ---
        if (isGroup) {
            const comandosGestion = ['setprimary', 'delprimary'];
            if (!comandosGestion.includes(commandName)) {
                const myJid = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
                if (fs.existsSync(databasePath)) {
                    let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
                    if (db[chat]) {
                        const primaryNumber = db[chat].replace(/[^0-9]/g, '');
                        const isSubActive = fs.existsSync(path.join(sessionsPath, primaryNumber));
                        if (isSubActive || primaryNumber === myJid) {
                            if (myJid !== primaryNumber) return; 
                        } else {
                            delete db[chat];
                            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
                        }
                    }
                }
            }
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (!cmd) return;

        // SIGUE SIENDO LIBRE: Si no hay prefijo real, verificamos si el comando es noPrefix
        if (!foundPrefix && !cmd.noPrefix) return;

        if (!isGroup && !isOwner && commandName !== 'code') return;

        if (cmd.isOwner && !isOwner) {
            return m.reply(`*❁* \`ACCESO DENEGADO\` *❁*\n\nID: \`${sender}\`\n\n> ¡Solo mi desarrollador puede usar esto!`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply('*✿︎* \`Aviso\` *✿︎*\n\nEste comando solo puede ser utilizado en grupos.\n\n> ¡Inténtalo en un chat grupal!');
        }

        logger(m, conn);
        
        // Ejecutamos pasando usedPrefix (que será el real o '#' si fue noPrefix)
        await cmd.run(conn, m, args, usedPrefix, commandName, text);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};