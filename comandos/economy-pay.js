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

            // --- LÓGICA DE DETECCIÓN IGUAL A ROB ---
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.\n\n> ¡Indica a quién quieres enviarle dinero!`);

            const receiver = targetJid.split('@')[0];

            // BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);
            }

            // --- EXTRACCIÓN DE MONTO ---
            // Tomamos el primer argumento que sea puramente números y no sea el ID del receptor
            let amount = args.find(a => {
                let clean = a.replace(/[^0-9]/g, '');
                return clean.length > 0 && clean !== receiver;
            });
            
            amount = parseInt(amount?.replace(/[^0-9]/g, ''));

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención`);
            }

            // LÍMITE MÍNIMO
            if (amount < 1000) {
                return m.reply(`*${config.visuals.emoji2}* El monto mínimo es de ¥1,000.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            // ASEGURAR NÚMEROS
            const senderBank = Number(db[sender]?.bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.`);
            }

            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            // TRANSACCIÓN
            db[sender].bank = Number(db[sender].bank) - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Dinero enviado de banco a banco!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema bancario.`);
        }
    }
};

export default payCommand;
