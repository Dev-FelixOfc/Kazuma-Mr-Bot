import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir', 'dar'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender.split('@')[0];
            const targetJid = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
            const amount = parseInt(args[0]);

            if (!targetJid || isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nUso: #pay 5000 (mención/responder)\n\n> ¡Asegúrate de indicar una cifra válida!`);
            }

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[sender] || (db[sender].bank || 0) < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nNo tienes esa cantidad en tu banco.\n\n> ¡Deposita primero para poder transferir!`);
            }

            if (!db[receiver]) db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };

            db[sender].bank -= amount;
            db[receiver].bank += (db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\nHas enviado ¥${amount.toLocaleString()} al banco de @${receiver}.\n\n> ¡La economía se mueve gracias a ti!`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la transferencia.`);
        }
    }
};

export default payCommand;