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
            
            // Lógica exacta de Rob para detectar al objetivo
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.\n\n> ¡Indica a quién quieres enviarle dinero!`);

            const receiver = targetJid.split('@')[0];

            // BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* \`Operación Inválida\`\n\nNo puedes enviarte dinero a ti mismo. ¡Eso sería trampa!\n\n> ¡Intenta regalárselo a alguien más!`);
            }

            // Extraer la cantidad: Filtramos los argumentos para ignorar el número del receptor
            let amount = args.find(a => {
                let clean = a.replace(/[^0-9]/g, '');
                return clean.length > 0 && clean !== receiver; // Ignora el número si es igual al del receptor
            });
            
            amount = parseInt(amount?.replace(/[^0-9]/g, ''));

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención\n\n> ¡Asegúrate de escribir bien la cifra!`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            const senderBank = db[sender]?.bank || 0;

            // Verificación de saldo en BANCO
            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Necesitas más capital para esta transferencia!`);
            }

            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            // Ejecución de la transferencia
            db[sender].bank -= amount;
            db[receiver].bank = (db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡El dinero ha llegado a su destino de banco a banco!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el proceso.`);
        }
    }
};

export default payCommand;
