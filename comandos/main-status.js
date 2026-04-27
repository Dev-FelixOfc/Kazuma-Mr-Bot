import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

const statusCommand = {
    name: 'status',
    alias: ['botinfo', 'infobot'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            const uptimeSeconds = process.uptime();
            const d = Math.floor(uptimeSeconds / (3600 * 24));
            const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
            const m_time = Math.floor((uptimeSeconds % 3600) / 60);
            const s = Math.floor(uptimeSeconds % 60);
            const uptimeDisplay = `${d}d ${h}h ${m_time}m ${s}s`;

            const totalRam = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
            const usedRam = ((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(1);

            const cpus = os.cpus();
            const cpuModel = cpus[0].model.replace(/CPU|@|inc.|Processor|Core\(TM\)|i[0-9]-/g, '').trim();
            const cpuCores = cpus.length; 

            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const subPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
            const moodPath = path.resolve(`./sesiones_moods/${botNumber}/settings.json`);

            let shortName = config.botName;
            let longName = config.botName;

            let settingsData = null;
            if (await fs.pathExists(subPath)) {
                settingsData = await fs.readJson(subPath);
            } else if (await fs.pathExists(moodPath)) {
                settingsData = await fs.readJson(moodPath);
            }

            if (settingsData) {
                if (settingsData.shortName) shortName = settingsData.shortName;
                if (settingsData.longName) longName = settingsData.longName;
            }

            const textoStatus = `*${config.visuals.emoji3}* \`SISTEMA ${longName.toUpperCase()}\` *${config.visuals.emoji3}*

✿︎ Bot ᗒ *${shortName}*
❁ Uptime ᗒ *${uptimeDisplay}*
❀ Comandos ᗒ *${global.totalCommandsUsed || 0}*

ᗣ RAM ᗒ *${usedRam}GB / ${totalRam}GB*
⁂ CPU ᗒ *${cpuCores} vCores*
𖧷 Model ᗒ *${cpuModel}*

> *${config.visuals.emoji2}* \`DEVELOPED BY FÉLIX OFC\``.trim();

            await conn.sendMessage(m.chat, { text: textoStatus }, { quoted: m });

        } catch (err) {
            console.error(err);
        }
    }
};

export default statusCommand;