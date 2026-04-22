import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const tarjetasPath = path.resolve('./config/database/economy/targets.json');

const claimCard = {
    name: 'target',
    alias: ['usartarjeta', 'tarjeta'],
    category: 'economy',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        const user = m.sender;
        const inputCode = args[0];

        if (!inputCode) {
            return m.reply(`*${config.visuals.emoji2}* \`Falta Código\` *${config.visuals.emoji2}*\n\nPor favor, ingresa el código de tu tarjeta.\n\n> Ejemplo: *${usedPrefix}target KZM-0000-XX*`);
        }

        if (!fs.existsSync(tarjetasPath)) {
            return m.reply(`*${config.visuals.emoji2}* El sistema de tarjetas no está disponible o la ruta es incorrecta.`);
        }

        try {
            let dbCards = JSON.parse(fs.readFileSync(tarjetasPath, 'utf-8'));
            const cardIndex = dbCards.tarjetas.findIndex(t => t.codigo === inputCode);

            if (cardIndex === -1) {
                return m.reply(`*${config.visuals.emoji2}* \`Código Inválido\`\n\nEse código de tarjeta no existe en nuestro sistema.`);
            }

            const card = dbCards.tarjetas[cardIndex];

            if (card.usada) {
                return m.reply(`*${config.visuals.emoji2}* \`Tarjeta Agotada\`\n\nEsta tarjeta ya fue reclamada anteriormente.`);
            }

            if (!global.db.data.users[user]) {
                global.db.data.users[user] = { money: 0, bank: 0, lastClaim: 0 };
            }

            const montoFinal = card.monto;
            global.db.data.users[user].bank += montoFinal;

            dbCards.tarjetas[cardIndex].usada = true;
            dbCards.tarjetas[cardIndex].reclamadaPor = user;
            dbCards.tarjetas[cardIndex].fechaReclamo = new Date().toISOString();

            fs.writeFileSync(tarjetasPath, JSON.stringify(dbCards, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*✿︎* \`Transacción Exitosa\` *✿︎*\n\n*❁* Tarjeta: \`${card.codigo}\`\n*❁* Cuenta origen: \`${card.cuenta}\`\n*❁* Monto: \`$${montoFinal.toLocaleString()}\`\n\n> El dinero ha sido depositado en tu **Banco**.`,
            }, { quoted: m });

        } catch (err) {
            console.error('Error al procesar tarjeta:', err);
            m.reply('Error interno al procesar el reclamo.');
        }
    }
};

export default claimCard;