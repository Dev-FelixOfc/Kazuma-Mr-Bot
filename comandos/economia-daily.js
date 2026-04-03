import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    run: async (conn, m) => {
        const e1 = config.visuals.emoji;
        const user = m.sender.split('@')[0];
        const userDir = path.join(dbPath, user);
        const dailyFile = path.join(userDir, 'daily.json');

        // Crear carpeta si no existe
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0, usedCommands: 0 };
        if (fs.existsSync(dailyFile)) data = JSON.parse(fs.readFileSync(dailyFile));

        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 horas

        if (now - data.lastDaily < cooldown) {
            const remaining = cooldown - (now - data.lastDaily);
            const h = Math.floor(remaining / 3600000);
            const m_time = Math.floor((remaining % 3600000) / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            
            return conn.sendMessage(m.chat, { 
                image: { url: config.visuals.img1 },
                caption: `*${e1}* Espera *${h}h ${m_time}m ${s}s* para volver a reclamar una recompensa diaria.\n\n> ¡No creas que me dejaré engañar!` 
            }, { quoted: m });
        }

        const coinsGained = data.nextReward;
        data.totalCoins += coinsGained;
        data.lastDaily = now;
        data.nextReward = coinsGained * 2; // El doble para la próxima
        data.usedCommands += 1;

        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const txt = `*${e1} \`RECOMPENSA DIARIA\` ${e1}*\n\n` +
                    `Coins añadidos: *${coinsGained.toLocaleString()}*\n` +
                    `Próxima recompensa: *${data.nextReward.toLocaleString()}*\n\n` +
                    `> ¡Vuelve mañana y gana coins como un genio!`;

        await conn.sendMessage(m.chat, { image: { url: config.visuals.img1 }, caption: txt }, { quoted: m });
    }
};

export default dailyCommand;