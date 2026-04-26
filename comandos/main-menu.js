import { config } from '../config.js';
import { menuCategories } from '../config/menu.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    isOwner: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#';
            const botType = config.getBotType(conn);
            const input = args[0]?.toLowerCase();

            const user = m.sender.split('@')[0].split(':')[0];
            const group = m.chat;

            const botNumber = conn.user.id.split(':')[0];
            const settingsPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);

            let displayLongName = config.botName;
            let displayBanner = config.visuals.img1;

            if (fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.longName) displayLongName = localData.longName;
                if (localData.banner) displayBanner = localData.banner;
            }

            const ecoDB = fs.existsSync(ecoPath) ? await fs.readJson(ecoPath) : {};
            const rpgDB = fs.existsSync(rpgPath) ? await fs.readJson(rpgPath) : {};

            const wallet = ecoDB[user]?.wallet || 0;
            const userRpg = rpgDB[group]?.[user] || {};
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const diamantes = userRpg.minerals?.diamantes || 0;

            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ kazuma.giize.com/Dev-FelixOfc
┃ ✐ *Commands* »
┃ kazuma.giize.com/commands
┃ ✐ *Upload* »
┃ upload.yotsuba.giize.com
┃ ✐ *Official channel* »
┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮
┃ ✐ *Usuario* »  @${user}
┃ ✐ *Rango* » ${rank}
┃ ✐ *Coins* » ¥${wallet.toLocaleString()}
┃ ✐ *Diamantes* » ${diamantes}
╰━━━━━━━━━━━━━━━━━━━╯`;

            let header = `¡Hola! Soy ${displayLongName} (${botType}).\n\n`;
            let subHeader = "";
            let finalBody = "";

            // LÓGICA DE FILTRADO REAL
            if (!input) {
                // CASO: Solo puso #menu
                subHeader = `*☞︎︎︎ Aqui está mi lista de comandos completa ☜︎︎︎*\n\n`;
                finalBody = Object.values(menuCategories).join('\n\n');
            } else {
                // CASO: Escribió algo después de #menu
                if (menuCategories[input]) {
                    // SI LA CATEGORÍA EXISTE
                    subHeader = `*☞︎︎︎ Aqui está mi lista de comandos para \`${input.toUpperCase()}\` ☜︎︎︎*\n\n`;
                    finalBody = menuCategories[input];
                } else {
                    // SI ESCRIBIÓ BASURA (Como en tu captura "kqjdiwvq")
                    return m.reply(`*${config.visuals.emoji2}* \`Categoría no encontrada\`\n\n*Las categorías disponibles son* »\n${Object.keys(menuCategories).map(c => `> ➪ ${c}`).join('\n')}`);
                }
            }

            let textoMenu = `${header}${subHeader}${infoBot}\n${infoUser}\n\n${finalBody}`;
            textoMenu = textoMenu.replace(/\${prefix}/g, prefix);

            await conn.sendMessage(m.chat, { 
                image: { url: displayBanner }, 
                caption: textoMenu,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;