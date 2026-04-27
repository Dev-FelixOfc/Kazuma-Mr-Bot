import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            const start = Date.now();

            const pingMsg = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji2}* \`Verificando conexión...\`` 
            }, { quoted: m });

            const end = Date.now();
            const latencia = end - start;

            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const subPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
            const moodPath = path.resolve(`./sesiones_moods/${botNumber}/settings.json`);

            let displayShortName = config.botName;

            if (await fs.pathExists(subPath)) {
                const localData = await fs.readJson(subPath);
                if (localData.shortName) displayShortName = localData.shortName;
            } else if (await fs.pathExists(moodPath)) {
                const localData = await fs.readJson(moodPath);
                if (localData.shortName) displayShortName = localData.shortName;
            }

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`${displayShortName.toUpperCase()} PING\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Velocidad:* ${latencia} ms\n*${config.visuals.emoji} Estado:* Online\n\n> *${config.visuals.emoji2}* \`SISTEMA OPERATIVO\``,
                edit: pingMsg.key 
            });

        } catch (err) {
            console.error(err);
        }
    }
};

export default pingCommand;