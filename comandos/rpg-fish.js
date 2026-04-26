import { config } from '../config.js';
import { fishPhrases } from './frases/rpg/fish.js';
import { fishFailPhrases } from './frases/rpg/fish-fail.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const invPath = path.resolve('./config/database/economy/inventory.json');

const fishCommand = {
    name: 'pescar',
    alias: ['fish', 'pesca'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const baseCooldown = 5 * 60 * 1000; 
            const penaltyCooldown = 10 * 60 * 1000; 

            if (!fs.existsSync(ecoPath)) fs.outputJsonSync(ecoPath, {});
            if (!fs.existsSync(invPath)) fs.outputJsonSync(invPath, {});
            let ecoDb = await fs.readJson(ecoPath);
            let invDb = await fs.readJson(invPath);

            if (!ecoDb[user]) ecoDb[user] = { wallet: 0, bank: 0, lastFish: 0, fishPenalty: false };

            const now = Date.now();
            const currentCooldown = ecoDb[user].fishPenalty ? penaltyCooldown : baseCooldown;
            const timePassed = now - (ecoDb[user].lastFish || 0);

            if (timePassed < currentCooldown) {
                const timeLeft = currentCooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Paciencia! Vuelve en **${min}m ${sec}s**.`);
            }

            const tieneTrebol = invDb[user]?.trebol > 0;
            let isFail = Math.random() < 0.30; 

            if (isFail && tieneTrebol) {
                isFail = false;
                invDb[user].trebol -= 1;
                await fs.writeJson(invPath, invDb, { spaces: 2 });
                m.reply(`*🍀 ¡Trébol activado!* Has evitado perder la carnada.`);
            }

            if (isFail) {
                const failPhrase = fishFailPhrases[Math.floor(Math.random() * fishFailPhrases.length)];
                ecoDb[user].lastFish = now;
                ecoDb[user].fishPenalty = true; 
                await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });
                return m.reply(`*${config.visuals.emoji2}* \`¡PERDISTE LA CARNADA!\`\n\n${failPhrase}\n\n> Espera de **10 minutos**.`);
            }

            const fishCaught = Math.floor(Math.random() * 8) + 1;
            const totalEarned = fishCaught * 3000;
            const randomPhrase = fishPhrases[Math.floor(Math.random() * fishPhrases.length)];

            ecoDb[user].wallet = (ecoDb[user].wallet || 0) + totalEarned;
            ecoDb[user].lastFish = now;
            ecoDb[user].fishPenalty = false; 

            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });
            const textoExito = `*${config.visuals.emoji3}* \`PESCA EXITOSA\` *${config.visuals.emoji3}*\n\n${randomPhrase}\n\n🎣 *Peces:* ${fishCaught}\n💰 *Ganancia:* ¥${totalEarned.toLocaleString()} coins`;
            await m.reply(textoExito);
        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en pesca.`);
        }
    }
};

export default fishCommand;