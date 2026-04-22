import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const user = targetJid.split('@')[0].split(':')[0];

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const total = (userData.wallet || 0) + (userData.bank || 0);

            const texto = `*${config.visuals.emoji3}* \`ESTADO FINANCIERO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Cartera:* ¥${(userData.wallet || 0).toLocaleString()}\n*${config.visuals.emoji4} Banco:* ¥${(userData.bank || 0).toLocaleString()}\n*${config.visuals.emoji2} Total:* ¥${total.toLocaleString()}\n\n> *Usuario:* @${user}`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [`${user}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al consultar el balance.`);
        }
    }
};

export default balanceCommand;