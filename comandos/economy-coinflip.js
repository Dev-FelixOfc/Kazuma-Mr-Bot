import { config } from '../config.js';
import { flipFrases } from './frases/flip.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const flipCommand = {
    name: 'coinflip',
    alias: ['flip', 'suerte'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const choice = args[0]?.toLowerCase();

            if (!choice || !['cara', 'cruz'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nElige una opción: *cara* o *cruz*.\n*Ejemplo:* #flip cara`);
            }

            if (!fs.existsSync(dbPath)) return m.reply('Error: DB no encontrada.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const totalMoney = (Number(db[user].wallet) || 0) + (Number(db[user].bank) || 0);

            if (totalMoney < 5000) {
                return m.reply(`*${config.visuals.emoji2}* \`POCO CAPITAL\`\n\nNecesitas al menos ¥5,000 en total para apostar.`);
            }

            const bet = 1000;
            const luck = Math.random(); 
            const win = luck < 0.3; // 30% de probabilidad de ganar
            const result = win ? choice : (choice === 'cara' ? 'cruz' : 'cara');

            if (win) {
                db[user].wallet = (Number(db[user].wallet) || 0) + bet;
                const frase = flipFrases.win[Math.floor(Math.random() * flipFrases.win.length)];
                
                await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji3}* \`¡GANASTE!\` *${config.visuals.emoji2}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Cartera:* ¥${db[user].wallet.toLocaleString()}`
                }, { quoted: m });
            } else {
                if (db[user].wallet >= bet) {
                    db[user].wallet -= bet;
                } else {
                    db[user].bank = (Number(db[user].bank) || 0) - bet;
                }
                
                const frase = flipFrases.lose[Math.floor(Math.random() * flipFrases.lose.length)];
                
                await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji2}* \`PERDISTE\` *${config.visuals.emoji2}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Balance actualizado.*`
                }, { quoted: m });
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la apuesta.`);
        }
    }
};

export default flipCommand;
