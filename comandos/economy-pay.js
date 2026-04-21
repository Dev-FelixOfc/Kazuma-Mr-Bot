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

            // 1. Detección de objetivo (Lógica Rob)
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];
            if (!targetJid && args[0] && args[0].includes('@')) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.`);

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            // 2. Extracción de cantidad (MEJORADA)
            // Filtramos args para encontrar el monto real ignorando menciones
            let amount = args.map(v => v.replace(/[^0-9]/g, '')).find(v => v.length > 0 && v !== receiver && v.length < 11);
            amount = parseInt(amount);

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención`);
            }

            if (amount < 1000) return m.reply(`*${config.visuals.emoji2}* El monto mínimo es de ¥1,000.`);

            // 3. Validación de Base de Datos
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            const senderBank = Number(db[sender]?.bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Te faltan ¥${(amount - senderBank).toLocaleString()}!`);
            }

            // 4. Ejecución
            if (!db[receiver]) db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 } };

            db[sender].bank = senderBank - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Dinero enviado correctamente!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la transferencia.`);
        }
    }
};

export default payCommand;
