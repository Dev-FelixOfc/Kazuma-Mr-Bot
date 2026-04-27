import fs from 'fs-extra';
import path from 'path';
import { config as mainConfig } from './config.js';

export const getDynamicConfig = async (conn) => {
    const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
    
    const subPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
    const moodPath = path.resolve(`./sesiones_moods/${botNumber}/settings.json`);

    let displayBotName = mainConfig.botName; 

    try {
        if (await fs.pathExists(subPath)) {
            const localData = await fs.readJson(subPath);
            if (localData.shortName) displayBotName = localData.shortName;
        } else if (await fs.pathExists(moodPath)) {
            const localData = await fs.readJson(moodPath);
            if (localData.shortName) displayBotName = localData.shortName;
        }
    } catch (e) {}

    return {
        stickers: {
            packname: '✿︎   𝐊𝐚𝐳𝐮𝐦𝐚 𝐁𝐨𝐭   ✿︎\n➪ https://kazuma.giize.com\n\n  ❁ commands »\nhttps://kazuma.giize.com/commands',

            packauthor: `✿︎ Bot »\n✰ ${displayBotName}\n \n      ❁ Usuario »\n   ✰ @(userName)`
        },
        system: {
            priority: true,
            version: '1.1.0'
        }
    };
};