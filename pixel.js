import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { logger } from './config/print.js';

const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const prefixPath = path.join(process.cwd(), 'jsons', 'prefix.json');

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

        let activePrefixes = config.allPrefixes || ['#', '!', '.'];
        if (fs.existsSync(prefixPath)) {
            try {
                const prefixData = JSON.parse(fs.readFileSync(prefixPath, 'utf-8'));
                if (prefixData.selected) activePrefixes = [prefixData.selected];
            } catch (e) {}
        }

        const foundPrefix = activePrefixes.find(p => body.startsWith(p));
        const usedPrefix = foundPrefix ? foundPrefix : '';

        let commandName = foundPrefix 
            ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        if (isGroup) {
            const comandosGestion = ['setprimary', 'delprimary', 'sockets', 'bots'];
            if (!comandosGestion.includes(commandName)) {
                if (fs.existsSync(databasePath)) {
                    let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
                    if (db[chat]) {
                        const primaryNumber = db[chat].replace(/\D/g, '');
                        if (myJid !== primaryNumber) return; 
                    }
                }
            }
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (foundPrefix && !cmd) {
            return m.reply(`*${config.visuals.emoji2}* El comando \`${usedPrefix}${commandName}\` no fue encontrado.\n> Para ver los comandos existente usa el comando *${usedPrefix}help*`);
        }

        if (!cmd) return;
        if (!foundPrefix && !cmd.noPrefix) return;
        if (!isGroup && !isOwner && commandName !== 'code') return;

        if (cmd.isOwner && !isOwner) {
            return m.reply(`*❁* \`ACCESO DENEGADA\` *❁*\n\nID: \`${sender}\`\n\n> ¡Solo mi desarrollador puede usar esto!`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply('*✿︎* \`Aviso\` *✿︎*\n\nEste comando solo puede ser utilizado en grupos.');
        }

        if (!global.db.data.chats[chat]) global.db.data.chats[chat] = { rolls: {} };

        logger(m, conn);
        await cmd.run(conn, m, args, usedPrefix, commandName, text, usedPrefix);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};