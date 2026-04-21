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
            
            // Usamos la lógica de detección que te funcionó en Rob
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            // Extraemos la cantidad de los argumentos (limpiando cualquier texto)
            let amount = args.map(a => a.replace(/[^0-9]/g, '')).find(a => a.length > 0);
            amount = parseInt(amount);

            if (!targetJid || isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nUso: #pay 5000 (mención o responder)\n\n> ¡Asegúrate de indicar una cifra válida!`);
            }

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB no encontrada.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            // Verificación estricta de BANCO
            const senderBank = db[sender]?.bank || 0;

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Banco Insuficiente\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Necesitas más dinero en el banco para regalar!`);
            }

            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            // Movimiento de Banco a Banco
            db[sender].bank -= amount;
            db[receiver].bank = (db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA BANCARIA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Transacción de banco a banco completada!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la transferencia.`);
        }
    }
};

export default payCommand;
