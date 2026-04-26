import { config } from '../config.js';
import { menuCategories } from '../config/menu.js';
import fs from 'fs-extra';
import path from 'path';

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

            const botNumber = conn.user.id.split(':')[0];
            const settingsPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);

            let displayLongName = config.botName;

            if (fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.longName) {
                    displayLongName = localData.longName;
                }
            }

            let header = `¡Hola! Soy ${displayLongName} (${botType}).\n\n`;
            let subHeader = input && menuCategories[input] 
                ? `*☞︎︎︎ Aqui está mi lista de comandos para \`${input.toUpperCase()}\` ☜︎︎︎*\n\n`
                : `*☞︎︎︎ Aqui está mi lista de comandos ☜︎︎︎*\n\n`;

            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ kazuma.giize.com/Dev-FelixOfc
┃ ✐ *Commands* »
┃ kazuma.giize.com/commands
┃ ✐ *Upload* »
┃ upload.yotsuba.giize.com
┃ ✐ *Official channel* »
┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯`;

            let finalBody = "";

            if (!input) {
                finalBody = Object.values(menuCategories).join('\n\n');
            } else if (menuCategories[input]) {
                finalBody = menuCategories[input];
            } else {
                return m.reply(`*${config.visuals.emoji2}* \`Categoría no encontrada\`\n\n*Las categorías disponibles son* »\n${Object.keys(menuCategories).map(c => `> ➪ ${c}`).join('\n')}`);
            }

            let textoMenu = `${header}${subHeader}${infoBot}\n\n${finalBody}`;
            textoMenu = textoMenu.replace(/\${prefix}/g, prefix);

            await conn.sendMessage(m.chat, { 
                image: { url: config.visuals.img1 }, 
                caption: textoMenu
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;