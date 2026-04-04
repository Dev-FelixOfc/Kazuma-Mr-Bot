import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, command, text) => {
        const from = m.key.remoteJid;
        // Ajuste de emojis según tu config
        const e1 = config.visuals?.emoji || '✨';
        const eCoins = config.visuals?.emoji5 || '🪙';

        const userNumber = m.sender.split('@')[0];
        const userDir = path.join(dbPath, userNumber);
        const dailyFile = path.join(userDir, 'daily.json');

        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0, usedCommands: 0 };
        if (fs.existsSync(dailyFile)) {
            try {
                data = JSON.parse(fs.readFileSync(dailyFile));
            } catch (e) { console.error("Error leyendo DB:", e); }
        }

        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - data.lastDaily < cooldown) {
            const remaining = cooldown - (now - data.lastDaily);
            const h = Math.floor(remaining / 3600000);
            const m_time = Math.floor((remaining % 3600000) / 60000);
            
            return m.reply(`*${e1}* Espera *${h}h ${m_time}m* para volver a reclamar.`);
        }

        data.totalCoins += data.nextReward;
        data.lastDaily = now;
        data.usedCommands += 1;
        // Incremento de recompensa para motivar al usuario
        data.nextReward = Math.floor(data.nextReward * 1.5);

        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const txt = `*${e1} RECOMPENSA DIARIA ${e1}*\n\n` +
                    `${eCoins} Coins ganados: *${(data.nextReward / 1.5).toLocaleString()}*\n` +
                    `💰 Total en cuenta: *${data.totalCoins.toLocaleString()}*\n\n` +
                    `> Vuelve mañana por más.`;

        await conn.sendMessage(from, { text: txt }, { quoted: m });
    }
};

export default dailyCommand;