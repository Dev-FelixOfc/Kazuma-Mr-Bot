Sigue fallando, este es el de Rob 

import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');
const robCooldowns = new Map();

const robCommand = {
    name: 'rob',
    alias: ['robar', 'robe'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const thief = m.sender.split('@')[0];

            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien para robarle.\n\n> ¡Elige a tu víctima con cuidado!`);

            const victim = targetJid.split('@')[0];
            if (thief === victim) return m.reply(`*${config.visuals.emoji2}* No puedes robarte a ti mismo.`);

            const now = Date.now();
            if (robCooldowns.has(thief) && (now < robCooldowns.get(thief) + 3600000)) {
                const rem = robCooldowns.get(thief) + 3600000 - now;
                return m.reply(`*${config.visuals.emoji2}* \`Agitamiento\`\n\nDebes esperar ${Math.floor(rem / 60000)}m.\n\n> ¡Mantente bajo perfil un tiempo!`);
            }

            const lastActive = global.lastMessageMap?.get(targetJid) || 0;
            if ((now - lastActive) < 1800000) {
                return m.reply(`*${config.visuals.emoji2}* \`Objetivo Alerta\`\n\nSolo puedes robar a quienes lleven más de 30 min inactivos.\n\n> ¡Busca a alguien que esté distraído!`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[victim] || (db[victim].wallet || 0) <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cero Ganancia\`\n\nEste usuario no tiene dinero en su cartera.\n\n> ¡Inténtalo con otra billetera!`);
            }

            const amountToSteal = Math.min(db[victim].wallet, 10000);
            if (!db[thief]) db[thief] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };

            db[victim].wallet -= amountToSteal;
            db[thief].wallet += amountToSteal;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            robCooldowns.set(thief, now);

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`ASALTO EXITOSO\` *${config.visuals.emoji3}*\n\nHas logrado robarle a @${victim}.\n*${config.visuals.emoji} Botín:* ¥${amountToSteal.toLocaleString()}\n\n> ¡Escapa antes de que se den cuenta!`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el asalto.`);
        }
    }
};

export default robCommand;