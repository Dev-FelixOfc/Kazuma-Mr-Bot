import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const mainNumber = conn.user.id.split(':')[0];
            const sessionsPath = path.resolve('./sesiones_subbots');

            let totalSubs = 0;
            let listaBots = `  ➪ *[wa.me/${mainNumber}]* » *Principal*\n`;

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });

                totalSubs = folders.length;

                folders.forEach(folder => {
                    const num = folder.replace(/\D/g, '');
                    if (num && num !== mainNumber) {
                        listaBots += `  ➪ *[wa.me/${num}]* » *Sub-Bot*\n`;
                    }
                });
            }

            const texto = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ DETALLE:*\n${listaBots}\n> *${config.visuals.emoji2}* \`RED DE BOTS ONLINE\``;

            await conn.sendMessage(m.chat, { text: texto.trim() }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};