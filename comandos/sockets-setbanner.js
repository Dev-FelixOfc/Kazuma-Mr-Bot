import { config } from '../config.js';
import { uploadToYotsuba } from '../config/UploadFile.js';
import fs from 'fs-extra';
import path from 'path';

const setBanner = {
    name: 'setbanner',
    alias: ['setimg', 'bannerbot'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const from = m.chat;
            const botNumber = conn.user.id.split(':')[0];
            const isMainBot = conn.user.id.includes('session_bot');
            const user = m.sender.split('@')[0].split(':')[0];
            const isPrincipalOwner = config.owner.includes(m.sender);

            const sessionsPath = path.resolve(isMainBot ? './session_bot' : './sesiones_subbots');
            const folderPath = isMainBot ? sessionsPath : path.join(sessionsPath, botNumber);
            const userSettingsPath = path.join(folderPath, 'settings.json');

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) {
                localConfig = await fs.readJson(userSettingsPath);
            }

            const allowedUser = localConfig.owner || botNumber;
            if (user !== allowedUser && !isPrincipalOwner) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Solo el owner asignado puede usar este comando.` }, { quoted: m });
            }

            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || q.mediaType || '';
            if (!/image/.test(mime)) return m.reply(`*${config.visuals.emoji2}* Responde a una imagen.`);

            const media = await q.download();
            const link = await uploadToYotsuba(media, mime);
            const fullLink = `https://upload.yotsuba.giize.com${link}`;

            localConfig.banner = fullLink;
            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            const socketName = localConfig.shortName || config.botName;
            await conn.sendMessage(from, { text: `*${config.visuals.emoji3}* Banner actualizado para *${socketName}*.\n\n${fullLink}` }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};

export default setBanner;