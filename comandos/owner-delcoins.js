import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const economyPath = path.resolve('./config/database/economy/economy.json');

const removeCoins = {
    name: 'removecoins',
    alias: ['quitarcoins', 'delcoins', 'removerdinero'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        try {
            let targetJid = null;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Usuario Requerido\`\n\nMenciona a alguien o responde a su mensaje.`);
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const montoAQuitar = parseInt(args.find(arg => !isNaN(arg)));

            if (!montoAQuitar || montoAQuitar <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Monto Inválido\`\n\nIngresa una cantidad válida para poder enviar los coins.`);
            }

            if (!fs.existsSync(economyPath)) {
                return m.reply(`*${config.visuals.emoji2}* Base de datos no encontrada.`);
            }

            let ecoDb = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));

            if (!ecoDb[user] || ((ecoDb[user].wallet || 0) + (ecoDb[user].bank || 0)) <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Usuario Sin Fondos\`\n\nEl usuario @${user} no tiene dinero para retirar.`, { mentions: [`${user}@s.whatsapp.net`] });
            }

            let wallet = Number(ecoDb[user].wallet || 0);
            let bank = Number(ecoDb[user].bank || 0);
            let restatante = montoAQuitar;

            if (wallet >= restatante) {
                wallet -= restatante;
                restatante = 0;
            } else {
                restatante -= wallet;
                wallet = 0;
            }

            if (restatante > 0) {
                if (bank >= restatante) {
                    bank -= restatante;
                    restatante = 0;
                } else {
                    bank = 0;
                    restatante = 0;
                }
            }

            ecoDb[user].wallet = wallet;
            ecoDb[user].bank = bank;

            fs.writeFileSync(economyPath, JSON.stringify(ecoDb, null, 2), 'utf-8');

            const texto = `*${config.visuals.emoji3}* \`SANCIÓN ECONÓMICA\` *${config.visuals.emoji3}*\n\n*❁ Usuario:* @${user}\n*❁ Monto Retirado:* \`¥${montoAQuitar.toLocaleString()}\`\n\n*${config.visuals.emoji} Cartera:* ¥${wallet.toLocaleString()}\n*${config.visuals.emoji4} Banco:* ¥${bank.toLocaleString()}\n\n> Los fondos han sido confiscados correctamente.`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [`${user}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error interno al procesar la sanción.`);
        }
    }
};

export default removeCoins;
