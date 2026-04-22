import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const tarjetasPath = path.resolve('./config/database/economy/targets.json');
const economyPath = path.resolve('./config/database/economy/economy.json');

const claimCard = {
    name: 'claim',
    alias: ['usartarjeta', 'tarjeta'],
    category: 'economy',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        const senderJid = m.sender.split('@')[0].split(':')[0];
        const inputCode = args[0];

        if (!inputCode) {
            return m.reply(`*${config.visuals.emoji2}* \`Falta Código\` *${config.visuals.emoji2}*\n\nPor favor, ingresa el código de tu tarjeta.\n\n> Ejemplo: *${usedPrefix}claim KZM-0000-XX*`);
        }

        if (!fs.existsSync(tarjetasPath)) {
            return m.reply(`*${config.visuals.emoji2}* El sistema de tarjetas no está disponible.`);
        }

        if (!fs.existsSync(economyPath)) {
            return m.reply(`*${config.visuals.emoji2}* El sistema de economía no está disponible.`);
        }

        try {
            let dbCards = JSON.parse(fs.readFileSync(tarjetasPath, 'utf-8'));
            const cardIndex = dbCards.tarjetas.findIndex(t => t.codigo === inputCode);

            if (cardIndex === -1) {
                return m.reply(`*${config.visuals.emoji2}* \`Código Inválido\`\n\nEse código de tarjeta no existe.`);
            }

            const card = dbCards.tarjetas[cardIndex];

            if (card.usada) {
                return m.reply(`*${config.visuals.emoji2}* \`Tarjeta Agotada\`\n\nEsta tarjeta ya fue reclamada.`);
            }

            let ecoDb = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));

            if (!ecoDb[senderJid]) {
                ecoDb[senderJid] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const montoFinal = Number(card.monto);
            ecoDb[senderJid].bank = Number(ecoDb[senderJid].bank || 0) + montoFinal;

            dbCards.tarjetas[cardIndex].usada = true;
            dbCards.tarjetas[cardIndex].reclamadaPor = senderJid;
            dbCards.tarjetas[cardIndex].fechaReclamo = new Date().toISOString();

            fs.writeFileSync(economyPath, JSON.stringify(ecoDb, null, 2), 'utf-8');
            fs.writeFileSync(tarjetasPath, JSON.stringify(dbCards, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TARJETA RECLAMADA\`\n\n*❁* Código: \`${card.codigo}\`\n*❁* Monto: \`¥${montoFinal.toLocaleString()}\`\n\n> El dinero ha sido depositado exitosamente en tu **Banco**.`,
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            m.reply(`*${config.visuals.emoji2}* Error interno al procesar la transacción.`);
        }
    }
};

export default claimCard;
