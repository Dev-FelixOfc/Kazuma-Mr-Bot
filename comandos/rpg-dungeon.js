import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';
import { checkRankUpdate } from './rpg-avisos.js';

const rpgDbPath = path.resolve('./config/database/rpg/rpg.json');
const dungeonDbPath = path.resolve('./config/database/rpg/dungeon.json');
const economyDbPath = path.resolve('./config/database/economy/economy.json');

const dungeonCommand = {
    name: 'mazmorra',
    alias: ['dungeon', 'explorar'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const cooldown = 15 * 60 * 1000; 

            const botNumber = conn.user.id.split(':')[0];
            const settingsPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
            let displayShortName = config.botName;

            if (fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.shortName) displayShortName = localData.shortName;
            }

            if (!fs.existsSync(rpgDbPath)) fs.outputJsonSync(rpgDbPath, {});
            if (!fs.existsSync(dungeonDbPath)) fs.outputJsonSync(dungeonDbPath, {});
            if (!fs.existsSync(economyDbPath)) fs.outputJsonSync(economyDbPath, {});

            let rpgDb = await fs.readJson(rpgDbPath);
            let dungeonDb = await fs.readJson(dungeonDbPath);
            let ecoDb = await fs.readJson(economyDbPath);

            if (!dungeonDb[group]) dungeonDb[group] = {};
            if (!dungeonDb[group][user]) {
                dungeonDb[group][user] = { 
                    materials: { hierro: 0, obsidiana: 0, huesos: 0, pergaminos: 0 }, 
                    lastDungeon: 0 
                };
            }

            const now = Date.now();
            const timePassed = now - (dungeonDb[group][user].lastDungeon || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Tus heridas aún no sanan! Podrás volver a la mazmorra en **${min}m ${sec}s**.`);
            }

            const rewards = {
                hierro: Math.floor(Math.random() * 12),
                obsidiana: Math.floor(Math.random() * 5),
                huesos: Math.floor(Math.random() * 15),
                pergaminos: Math.floor(Math.random() * 3),
                coins: Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000 
            };

            for (let key in rewards) {
                if (key !== 'coins') {
                    dungeonDb[group][user].materials[key] = (dungeonDb[group][user].materials[key] || 0) + rewards[key];
                }
            }
            dungeonDb[group][user].lastDungeon = now;

            if (!ecoDb[user]) {
                ecoDb[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }
            ecoDb[user].wallet = (ecoDb[user].wallet || 0) + rewards.coins;

            if (rpgDb[group]?.[user]) {
                await checkRankUpdate(conn, m, user, group, rpgDb);
            }

            await fs.writeJson(dungeonDbPath, dungeonDb, { spaces: 2 });
            await fs.writeJson(rpgDbPath, rpgDb, { spaces: 2 });
            await fs.writeJson(economyDbPath, ecoDb, { spaces: 2 });

            const textoExito = `*${config.visuals.emoji3}* \`MAZMORRA ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*

¡Has sobrevivido a las profundidades de la mazmorra! Botín obtenido:

⛓️ *Hierro:* ${rewards.hierro}
🏮 *Obsidiana:* ${rewards.obsidiana}
🦴 *Huesos:* ${rewards.huesos}
📜 *Pergaminos:* ${rewards.pergaminos}

💰 *Tesoro hallado:* ¥${rewards.coins.toLocaleString()} coins 

> ¡El peligro aumenta, pero las recompensas también!`;

            await conn.sendMessage(m.chat, { 
                image: { url: 'https://upload.yotsuba.giize.com/u/9WjNxRhX.jpeg' }, 
                caption: textoExito 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la mazmorra.`);
        }
    }
};

export default dungeonCommand;