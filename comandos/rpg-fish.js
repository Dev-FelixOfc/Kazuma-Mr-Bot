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

            if (!ecoDb[user]) {
                ecoDb[user] = { wallet: 0, bank: 0, lastFish: 0, fishPenalty: false };
            }

            const now = Date.now();
            const lastTime = ecoDb[user].lastFish || 0;
            const currentCooldown = ecoDb[user].fishPenalty ? penaltyCooldown : baseCooldown;
            const timePassed = now - lastTime;

            if (timePassed < currentCooldown) {
                const timeLeft = currentCooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Paciencia! Podrás volver a intentar pescar en **${min}m ${sec}s**.`);
            }

            let isFail = Math.random() < 0.30; 
            const tieneTrebol = invDb[user]?.trebol > 0;

            if (isFail && tieneTrebol) {
                isFail = false;
                invDb[user].trebol -= 1;
                await fs.writeJson(invPath, invDb, { spaces: 2 });
                m.reply(`*🍀 ¡SUERTE DE TRÉBOL!* El amuleto brilló y evitaste perder la carnada.`);
            }

            if (isFail) {
                const failPhrase = fishFailPhrases[Math.floor(Math.random() * fishFailPhrases.length)];
                ecoDb[user].lastFish = now;
                ecoDb[user].fishPenalty = true; 
                await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

                return m.reply(`*${config.visuals.emoji2}* \`¡PERDISTE LA CARNADA!\`\n\n${failPhrase}\n\n> Tu próximo intento tardará **10 minutos** por el fallo.`);
            }

            const fishCaught = Math.floor(Math.random() * 8) + 1;
            const totalEarned = fishCaught * 3000;
            const randomPhrase = fishPhrases[Math.floor(Math.random() * fishPhrases.length)];

            ecoDb[user].wallet = (ecoDb[user].wallet || 0) + totalEarned;
            ecoDb[user].lastFish = now;
            ecoDb[user].fishPenalty = false; 

            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

            const textoExito = `*${config.visuals.emoji3}* \`PESCA EXITOSA\` *${config.visuals.emoji3}*

${randomPhrase}

🎣 *Peces capturados:* ${fishCaught}
💰 *Ganancia total:* ¥${totalEarned.toLocaleString()} coins

> El dinero se guardó en tu cartera. Tu siguiente espera será de **5 minutos**.`;

            await m.reply(textoExito);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de pesca.`);
        }
    }
};

export default fishCommand;