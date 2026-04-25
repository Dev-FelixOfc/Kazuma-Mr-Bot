import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const economyPath = path.resolve('./config/database/economy/economy.json');

const addCoins = {
    name: 'addcoins',
    alias: ['darcoins', 'regalarcoins', 'givemoney'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,
    isGroup: false,

    run: async (conn, m, args) => {
        try {
            let targetJid = null;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Falta Usuario\`\n\nMenciona a alguien o responde a su mensaje.`);
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const monto = parseInt(args.find(arg => !isNaN(arg)));

            if (!monto || monto <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Monto Inválido\`\n\nIngresa una cantidad válida para enviar los coins.`);
            }

            if (!fs.existsSync(economyPath)) {
                return m.reply(`*${config.visuals.emoji2}* Base de datos no encontrada.`);
            }

            let ecoDb = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));

            if (!ecoDb[user]) {
                ecoDb[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            ecoDb[user].bank = (Number(ecoDb[user].bank) || 0) + monto;

            fs.writeFileSync(economyPath, JSON.stringify(ecoDb, null, 2), 'utf-8');

            const texto = `*${config.visuals.emoji3}* \`MONEDAS ENVIADAS\` *${config.visuals.emoji3}*\n\n*❁ Usuario:* @${user}\n*❁ Cantidad:* \`¥${monto.toLocaleString()}\`\n*❁ Destino:* \`Banco\`\n\n> El dinero ha sido sumado con éxito.`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [`${user}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error interno.`);
        }
    }
};

export default addCoins;