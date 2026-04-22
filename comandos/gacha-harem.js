import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');

const haremCommand = {
    name: 'harem',
    alias: ['inventario', 'mis-pjs'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let targetJid = m.sender;
            let page = 1;

            if (args.length > 0) {
                const lastArg = args[args.length - 1];
                if (!isNaN(lastArg)) {
                    page = parseInt(lastArg);
                }
            }

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetId = targetJid.split('@')[0].split(':')[0];
            const isMe = targetJid === m.sender;

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            let misPjs = [];
            for (let id in gachaDB) {
                if (gachaDB[id].owner === targetId) {
                    misPjs.push(gachaDB[id]);
                }
            }

            if (misPjs.length === 0) {
                if (isMe) {
                    return m.reply(`*${config.visuals.emoji2}* Aún no tienes personajes reclamados en tu inventario.\n\n> ¡Usa el comando #rw y luego #c para conseguir personajes épicos!`);
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `*${config.visuals.emoji2}* El usuario @${targetId} no tiene personajes reclamados.\n\n> ¡Se recomienda el comando #rw para conseguir!`,
                        mentions: [targetJid]
                    }, { quoted: m });
                }
            }

            misPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 5;
            const totalPages = Math.ceil(misPjs.length / itemsPerPage);

            if (page > totalPages || page <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`PÁGINA NO ENCONTRADA\`\n\nEl usuario solo tiene **${totalPages}** página(s) en su harem.`);
            }

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentPjs = misPjs.slice(start, end);

            let txt = `*${config.visuals.emoji3} \`HAREM DEL USUARIO\` ${config.visuals.emoji3}*\n`;
            txt += `» @${targetId} (${misPjs.length} personajes)\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            currentPjs.forEach((pj) => {
                txt += `› ${pj.name}\n`;
            });

            txt += `\n> ¡Sigue reclamando más personajes para que seas el que más tiene!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al mostrar el harem.`);
        }
    }
};

export default haremCommand;