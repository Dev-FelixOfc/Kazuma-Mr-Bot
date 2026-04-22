import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const cooldowns = new Map();

const rwCommand = {
    name: 'rw',
    alias: ['roll', 'waifu'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();

            if (cooldowns.has(user)) {
                const restante = cooldowns.get(user) + 10 * 60 * 1000 - ahora;
                if (restante > 0) return m.reply(`*${config.visuals.emoji2}* ¡Espera! Faltan ${Math.ceil(restante / 60000)} min.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            
            const saldo = ecoDB[user]?.wallet || 0;
            let keys = Object.keys(gachaDB);

            if (saldo < 45000 && Math.random() > 0.05) {
                keys = keys.filter(id => gachaDB[id].value < 40000);
            }

            const randomId = keys[Math.floor(Math.random() * keys.length)];
            const pj = gachaDB[randomId];

            let caption = `*» (❍ᴥ❍ʋ) \`GACHA ROLL\` «*\n\n`;
            caption += `*ID »* ${randomId}\n`;
            caption += `*Nombre:* ${pj.name}\n`;
            caption += `*Fuente:* ${pj.source}\n`;
            caption += `*Valor:* ¥${pj.value.toLocaleString()}\n`;
            caption += `*Estado:* ${pj.status === 'libre' ? 'Libre' : 'Domado'}\n`;
            if (pj.owner) caption += `*Dueño:* @${pj.owner}\n`;

            const sent = await conn.sendMessage(m.chat, { 
                image: { url: pj.url }, 
                caption: caption,
                mentions: pj.owner ? [pj.owner + '@s.whatsapp.net'] : []
            }, { quoted: m });

            if (!global.db.data.chats[m.chat].rolls) global.db.data.chats[m.chat].rolls = {};
            global.db.data.chats[m.chat].rolls[sent.key.id] = { 
                id: randomId, 
                expiresAt: ahora + 60000 
            };
            
            cooldowns.set(user, ahora);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de gacha.`);
        }
    }
};

export default rwCommand;
