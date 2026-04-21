import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/daily.json');

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = m.sender.split('@')[0];
            const now = Date.now();
            
            if (!fs.existsSync(path.dirname(dbPath))) {
                fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { coins: 0, lastDaily: 0, streak: 0 };
            }

            const userData = db[user];
            const cooldown = 24 * 60 * 60 * 1000;
            const timePassed = now - userData.lastDaily;

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                
                return m.reply(`*${config.visuals.emoji2}* \`Espera un poco\` *${config.visuals.emoji2}*\n\nYa has reclamado tu recompensa hoy.\n\n*${config.visuals.emoji5} Vuelve en:* ${hours}h ${minutes}m`);
            }

            if (timePassed < cooldown * 2) {
                userData.streak += 1;
            } else {
                userData.streak = 1;
            }

            const reward = 30000 + (userData.streak * 5000);
            const nextReward = 30000 + ((userData.streak + 1) * 5000);

            userData.coins += reward;
            userData.lastDaily = now;

            db[user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const textoDaily = `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA\` *${config.visuals.emoji3}*\n\n¡Has reclamado tu recompensa de hoy!\n*${config.visuals.emoji2} Ganaste:* ¥${reward.toLocaleString()} Coins\n*${config.visuals.emoji4} Racha:* Día ${userData.streak}\n\n> Sigue así, mañana ganarás: *¥${nextReward.toLocaleString()}*`;

            await conn.sendMessage(m.chat, {
                text: textoDaily,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA ECONOMY',
                        body: `Billetera: ¥${userData.coins.toLocaleString()} Coins`,
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\nHubo un fallo al procesar tu recompensa.`);
        }
    }
};

export default dailyCommand;