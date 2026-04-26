import { config } from '../config.js';
import { chestPhrases } from './frases/rpg/chest.js';
import fs from 'fs-extra';
import path from 'path';
import { checkRankUpdate } from './rpg-avisos.js';

const rpgDbPath = path.resolve('./config/database/rpg/rpg.json');
const economyDbPath = path.resolve('./config/database/economy/economy.json');
const invPath = path.resolve('./config/database/economy/inventory.json');

const chestCommand = {
    name: 'cofre',
    alias: ['chest', 'baul', 'botin'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];

            if (!fs.existsSync(invPath)) fs.outputJsonSync(invPath, {});
            let invDb = await fs.readJson(invPath);
            const tieneEscudo = invDb[user]?.escudo > 0;
            
            const cooldown = tieneEscudo ? 5 * 60 * 1000 : 10 * 60 * 1000; 

            let rpgDb = await fs.readJson(rpgDbPath);
            let ecoDb = await fs.readJson(economyDbPath);

            if (!rpgDb[group]?.[user]) rpgDb[group] = { [user]: { minerals: { diamantes: 0, rubies: 0, esmeraldas: 0, zafiros: 0, amatistas: 0, perlas: 0, oro: 0 }, lastChest: 0, rank: 'Novato' } };

            const now = Date.now();
            const timePassed = now - (rpgDb[group][user].lastChest || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                return m.reply(`*${config.visuals.emoji2}* Espera **${Math.floor(timeLeft / 60000)}m**.`);
            }

            if (tieneEscudo) {
                invDb[user].escudo -= 1;
                await fs.writeJson(invPath, invDb, { spaces: 2 });
            }

            const rewards = { diamantes: Math.floor(Math.random() * 6), rubies: Math.floor(Math.random() * 8), coins: Math.floor(Math.random() * 5000) + 3000 };
            rpgDb[group][user].lastChest = now;
            ecoDb[user].wallet += rewards.coins;

            await fs.writeJson(rpgDbPath, rpgDb, { spaces: 2 });
            await fs.writeJson(economyDbPath, ecoDb, { spaces: 2 });
            
            m.reply(`*📦 COFRE ABIERTO* ${tieneEscudo ? '(ESCUDO ACTIVO)' : ''}\n💰 Monedas: ¥${rewards.coins.toLocaleString()}`);
        } catch (e) { console.error(e); }
    }
};

export default chestCommand;