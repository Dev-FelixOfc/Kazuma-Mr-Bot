import { config } from '../config.js';
import { pptPhrases } from './frases/rpg/ppt.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');

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
            const minBet = 4000;
            const maxBet = 15000;
            const cooldown = 5 * 60 * 1000; 

            if (!choice || !['piedra', 'papel', 'tijera'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2} \`Usa el comando correctamente\` {config.visuals.emoji2}*\n\n➪ *Uso correcto* »\n> ✿︎ *${usedPrefix}ppt (piedra/papel/tijera) (cantidad)*\n> ✿︎Ejemplo: *${usedPrefix}ppt piedra 5000*`);
            }

            const bet = parseInt(betInput);
            if (!betInput || isNaN(bet) || bet <= 0) {
                return m.reply(`*${config.visuals.emoji2}* Debes ingresar una cantidad válida para apostar.`);
            }

            if (bet < minBet || bet > maxBet) {
                return m.reply(`*${config.visuals.emoji2}* La apuesta debe estar entre *¥${minBet.toLocaleString()}* y *¥${maxBet.toLocaleString()}* coins.`);
            }

            if (!fs.existsSync(ecoPath)) fs.outputJsonSync(ecoPath, {});
            let ecoDb = await fs.readJson(ecoPath);

            if (!ecoDb[user]) {
                ecoDb[user] = { wallet: 0, bank: 0, lastPpt: 0 };
            }

            const now = Date.now();
            const timePassed = now - (ecoDb[user].lastPpt || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Tranquilo apostador! Podrás volver a jugar en *${min}m ${sec}s*.`);
            }

            const totalMoney = (ecoDb[user].wallet || 0) + (ecoDb[user].bank || 0);
            if (totalMoney < bet) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero para apostar *¥${bet.toLocaleString()}*.\n\n> Usa comandos como \`work\`, \`crime\` o \`mine\` para ganar dinero.`);
            }

            const isWin = Math.random() < 0.95; 
            let botChoice;
            let result;

            if (isWin) {
                result = 'win';
                botChoice = choice === 'piedra' ? 'tijera' : choice === 'papel' ? 'piedra' : 'papel';
            } else {
                result = 'lose';
                botChoice = choice === 'piedra' ? 'papel' : choice === 'papel' ? 'tijera' : 'piedra';
            }

            const phrase = pptPhrases[result][Math.floor(Math.random() * pptPhrases[result].length)];

            if (result === 'lose') {
                if (ecoDb[user].wallet >= bet) {
                    ecoDb[user].wallet -= bet;
                } else {
                    const remaining = bet - (ecoDb[user].wallet || 0);
                    ecoDb[user].wallet = 0;
                    ecoDb[user].bank = (ecoDb[user].bank || 0) - remaining;
                }
            } else {
                ecoDb[user].wallet = (ecoDb[user].wallet || 0) + bet;
            }

            ecoDb[user].lastPpt = now;
            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

            const emojiMap = { piedra: '🗿', papel: '📄', tijera: '✂️' };
            const textoFinal = `*${config.visuals.emoji3}* \`DUELO DE PPT\` *${config.visuals.emoji3}*

👤 *Tú:* ${choice.toUpperCase()} ${emojiMap[choice]}
🤖 *Bot:* ${botChoice.toUpperCase()} ${emojiMap[botChoice]}

> ${phrase}

${result === 'win' ? `💰 *Ganaste:* ¥${bet.toLocaleString()}` : `📉 *Perdiste:* ¥${bet.toLocaleString()}`}
✨ *Saldo Total:* ¥${(ecoDb[user].wallet + (ecoDb[user].bank || 0)).toLocaleString()}`;

            await m.reply(textoFinal);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de PPT.`);
        }
    }
};

export default pptCommand;