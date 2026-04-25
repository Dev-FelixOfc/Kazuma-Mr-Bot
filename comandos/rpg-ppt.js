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

            if (!choice || !['piedra', 'papel', 'tijera'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2}* Uso correcto: *${usedPrefix}ppt (piedra/papel/tijera) (cantidad)*\nEjemplo: *${usedPrefix}ppt piedra 5000*`);
            }

            const bet = parseInt(betInput);
            if (!betInput || isNaN(bet) || bet <= 0) {
                return m.reply(`*${config.visuals.emoji2}* Debes ingresar una cantidad válida para apostar.`);
            }

            if (bet < minBet) {
                return m.reply(`*${config.visuals.emoji2}* La apuesta mínima es de **¥${minBet.toLocaleString()}** coins.`);
            }

            if (!fs.existsSync(ecoPath)) fs.outputJsonSync(ecoPath, {});
            let ecoDb = await fs.readJson(ecoPath);

            const userData = ecoDb[user] || { wallet: 0, bank: 0 };
            const totalMoney = (userData.wallet || 0) + (userData.bank || 0);

            if (totalMoney < bet) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero (contando banco y cartera) para apostar **¥${bet.toLocaleString()}**.\n\n> ¡No te rindas! Usa comandos como \`work\`, \`crime\` o \`mine\` para conseguir más coins. ✨`);
            }

            // Lógica de victoria (95% ganar)
            const isWin = Math.random() < 0.95;
            let botChoice;
            let result;

            if (isWin) {
                result = 'win';
                if (choice === 'piedra') botChoice = 'tijera';
                if (choice === 'papel') botChoice = 'piedra';
                if (choice === 'tijera') botChoice = 'papel';
            } else {
                result = 'lose';
                if (choice === 'piedra') botChoice = 'papel';
                if (choice === 'papel') botChoice = 'tijera';
                if (choice === 'tijera') botChoice = 'piedra';
            }

            const phrase = pptPhrases[result][Math.floor(Math.random() * pptPhrases[result].length)];
            
            // Si pierde, se le resta de la cartera (y si no alcanza, del banco)
            if (result === 'lose') {
                if (ecoDb[user].wallet >= bet) {
                    ecoDb[user].wallet -= bet;
                } else {
                    const remaining = bet - ecoDb[user].wallet;
                    ecoDb[user].wallet = 0;
                    ecoDb[user].bank -= remaining;
                }
            } else {
                ecoDb[user].wallet = (ecoDb[user].wallet || 0) + bet;
            }

            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });

            const emojiMap = { piedra: '🗿', papel: '📄', tijera: '✂️' };
            
            const textoFinal = `*${config.visuals.emoji3}* \`DUELO DE PPT\` *${config.visuals.emoji3}*

👤 *Tú:* ${choice.toUpperCase()} ${emojiMap[choice]}
🤖 *Bot:* ${botChoice.toUpperCase()} ${emojiMap[botChoice]}

> ${phrase}

${result === 'win' ? `💰 *Ganaste:* ¥${bet.toLocaleString()}` : `📉 *Perdiste:* ¥${bet.toLocaleString()}`}
✨ *Nuevo saldo total:* ¥${(ecoDb[user].wallet + ecoDb[user].bank).toLocaleString()}`;

            await m.reply(textoFinal);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de PPT.`);
        }
    }
};

export default pptCommand;