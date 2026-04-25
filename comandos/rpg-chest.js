import { config } from '../config.js';
import { chestPhrases } from './frases/rpg/chest.js';
import fs from 'fs-extra';
import path from 'path';

const rpgDbPath = path.resolve('./config/database/rpg/rpg.json');
const economyDbPath = path.resolve('./config/database/economy/economy.json');

const chestCommand = {
    name: 'cofre',
    alias: ['chest', 'baul', 'botin'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            if (!m.isGroup) return m.reply(`*${config.visuals.emoji2}* Este comando solo puede ser usado en grupos.`);

            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const cooldown = 10 * 60 * 1000; 

            const botNumber = conn.user.id.split(':')[0];
            const settingsPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
            let displayShortName = config.botName;

            if (fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.shortName) displayShortName = localData.shortName;
            }

            if (!fs.existsSync(rpgDbPath)) fs.outputJsonSync(rpgDbPath, {});
            if (!fs.existsSync(economyDbPath)) fs.outputJsonSync(economyDbPath, {});

            let rpgDb = await fs.readJson(rpgDbPath);
            let ecoDb = await fs.readJson(economyDbPath);

            if (!rpgDb[group]) rpgDb[group] = {};
            if (!rpgDb[group][user]) {
                rpgDb[group][user] = { 
                    minerals: { diamantes: 0, rubies: 0, esmeraldas: 0, zafiros: 0, amatistas: 0, perlas: 0, oro: 0 }, 
                    lastChest: 0 
                };
            }

            const now = Date.now();
            const timePassed = now - (rpgDb[group][user].lastChest || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Cofre vacío! Debes esperar **${min}m ${sec}s** para buscar otro en este grupo.`);
            }

            const rewards = {
                diamantes: Math.floor(Math.random() * 6),
                rubies: Math.floor(Math.random() * 8),
                esmeraldas: Math.floor(Math.random() * 7),
                zafiros: Math.floor(Math.random() * 10),
                amatistas: Math.floor(Math.random() * 12),
                perlas: Math.floor(Math.random() * 15),
                oro: Math.floor(Math.random() * 20),
                coins: Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000 
            };

            const randomPhrase = chestPhrases[Math.floor(Math.random() * chestPhrases.length)];

            for (let key in rewards) {
                if (key !== 'coins') {
                    rpgDb[group][user].minerals[key] = (rpgDb[group][user].minerals[key] || 0) + rewards[key];
                }
            }
            rpgDb[group][user].lastChest = now;

            if (!ecoDb[user]) {
                ecoDb[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }
            ecoDb[user].wallet = (ecoDb[user].wallet || 0) + rewards.coins;

            await fs.writeJson(rpgDbPath, rpgDb, { spaces: 2 });
            await fs.writeJson(economyDbPath, ecoDb, { spaces: 2 });

            const textoExito = `*${config.visuals.emoji3}* \`COFRE ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*

${randomPhrase}

💎 *Diamantes:* ${rewards.diamantes}
🌹 *Rubíes:* ${rewards.rubies}
🍃 *Esmeraldas:* ${rewards.esmeraldas}
🔹 *Zafiros:* ${rewards.zafiros}
🔮 *Amatistas:* ${rewards.amatistas}
⚪ *Perlas:* ${rewards.perlas}
📀 *Oro:* ${rewards.oro}

💰 *Extra:* ¥${rewards.coins.toLocaleString()} coins 

> ¡El mar siempre tiene tesoros para quienes saben buscar!`;

            await conn.sendMessage(m.chat, { 
                image: { url: 'https://upload.yotsuba.giize.com/u/nwqLhleW.jpeg' }, 
                caption: textoExito 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al abrir el cofre.`);
        }
    }
};

export default chestCommand;