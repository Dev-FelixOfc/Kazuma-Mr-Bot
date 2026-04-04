/* KURAYAMI TEAM - ECONOMY SYSTEM (DAILY)
   Lógica: Cooldown 24h de Base CommonJS
   Estructura: ESM compatible con Pixel Handler
*/

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

// --- HELPERS LÓGICOS ---
const toMs = (h = 0, m = 0, s = 0) => ((h * 3600) + (m * 60) + s) * 1000;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDelta = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' : ');
};

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, command, text) => {
        const from = m.key.remoteJid;
        
        // --- LECTURA DINÁMICA DE CONFIG ---
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;
        const eCoins = config.visuals.emoji5;
        const img = config.visuals.img1;

        const userNumber = m.sender.split('@')[0];
        const userDir = path.join(dbPath, userNumber);
        const dailyFile = path.join(userDir, 'daily.json');

        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0, usedCommands: 0 };
        if (fs.existsSync(dailyFile)) {
            try {
                data = JSON.parse(fs.readFileSync(dailyFile));
            } catch (e) {
                console.error("Error en DB:", e);
            }
        }

        const now = Date.now();
        const cd = toMs(24, 0, 0); // 24 horas

        // --- VALIDACIÓN DE TIEMPO (Lógica Base) ---
        if (now - (data.lastDaily || 0) < cd) {
            const remaining = (data.lastDaily || 0) + cd - now;
            
            return conn.sendMessage(from, { 
                image: { url: img },
                caption: `*${e1}* Espera *${formatDelta(remaining)}* para volver a reclamar una recompensa diaria.\n\n> ¡No creas que me dejaré engañar!` 
            }, { quoted: m });
        }

        // --- RECOMPENSA Y TEXTOS ORIGINALES ---
        const coinsGained = data.nextReward || 1000;
        data.totalCoins = (data.totalCoins || 0) + coinsGained;
        data.lastDaily = now;
        data.nextReward = coinsGained * 2;
        data.usedCommands = (data.usedCommands || 0) + 1;

        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const txt = `*${e1} \`RECOMPENSA DIARIA\` ${e1}*\n\n` +
                    `${eCoins} Coins añadidos: *${coinsGained.toLocaleString()}*\n` +
                    `${e2} Próxima recompensa: *${data.nextReward.toLocaleString()}*\n\n` +
                    `> ¡Vuelve mañana y gana coins como un genio!`;

        await conn.sendMessage(from, { 
            image: { url: img }, 
            caption: txt 
        }, { quoted: m });
    }
};

export default dailyCommand;
