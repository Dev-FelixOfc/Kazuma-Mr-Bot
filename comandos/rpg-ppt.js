import { config } from '../config.js';
import { pptPhrases } from './frases/rpg/ppt.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const invPath = path.resolve('./config/database/economy/inventory.json');

const pptCommand = {
    name: 'ppt',
    alias: ['juego', 'piedrapapelotijera'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const choice = args[0]?.toLowerCase();
            const betInput = args[1];
            
            if (!fs.existsSync(invPath)) fs.outputJsonSync(invPath, {});
            let invDb = await fs.readJson(invPath);
            const tieneAmuleto = invDb[user]?.amuleto > 0;

            const minBet = 4000;
            const maxBet = tieneAmuleto ? 30000 : 15000;
            const cooldown = 5 * 60 * 1000; 

            if (!choice || !['piedra', 'papel', 'tijera'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2}* Uso: *${usedPrefix}ppt (piedra/papel/tijera) (apuesta)*`);
            }

            const bet = parseInt(betInput);
            if (isNaN(bet) || bet < minBet || bet > maxBet) {
                return m.reply(`*${config.visuals.emoji2}* Apuesta inválida (Min: ¥4,000 / Max: ¥${maxBet.toLocaleString()}).`);
            }

            let ecoDb = await fs.readJson(ecoPath);
            const now = Date.now();
            if ((now - (ecoDb[user]?.lastPpt || 0)) < cooldown) return m.reply(`*${config.visuals.emoji2}* Espera al cooldown.`);

            const totalMoney = (ecoDb[user]?.wallet || 0) + (ecoDb[user]?.bank || 0);
            if (totalMoney < bet) return m.reply(`*${config.visuals.emoji2}* Saldo insuficiente.`);

            const isWin = Math.random() < 0.95; 
            let botChoice, result;

            if (isWin) {
                result = 'win';
                botChoice = choice === 'piedra' ? 'tijera' : choice === 'papel' ? 'piedra' : 'papel';
            } else {
                result = 'lose';
                botChoice = choice === 'piedra' ? 'papel' : choice === 'papel' ? 'tijera' : 'piedra';
            }

            if (tieneAmuleto) {
                invDb[user].amuleto -= 1;
                await fs.writeJson(invPath, invDb, { spaces: 2 });
            }

            if (result === 'lose') {
                if (ecoDb[user].wallet >= bet) ecoDb[user].wallet -= bet;
                else {
                    const remaining = bet - ecoDb[user].wallet;
                    ecoDb[user].wallet = 0;
                    ecoDb[user].bank -= remaining;
                }
            } else ecoDb[user].wallet += bet;

            ecoDb[user].lastPpt = now;
            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

            const emojiMap = { piedra: '🗿', papel: '📄', tijera: '✂️' };
            m.reply(`*${config.visuals.emoji3} \`PPT\` ${tieneAmuleto ? '(AMULETO)' : ''}*\n👤 Tú: ${emojiMap[choice]}\n🤖 Bot: ${emojiMap[botChoice]}\n> ${result === 'win' ? 'Ganaste' : 'Perdiste'} ¥${bet.toLocaleString()}`);
        } catch (e) { console.error(e); }
    }
};

export default pptCommand;