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
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0];
            const isOwner = config.owner.includes(m.sender);

            if (botNumber !== user && !isOwner) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2}* Solo el dueño de este socket puede personalizar su banner.` 
                }, { quoted: m });
            }

            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || q.mediaType || '';

            if (!mime || !/image/.test(mime)) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2}* Responde a una imagen con el comando para establecer tu banner.` 
                }, { quoted: m });
            }

            await conn.sendMessage(from, { text: `*${config.visuals.emoji3}* \`GUARDANDO CONFIGURACIÓN...\`` }, { quoted: m });

            const media = await q.download();
            if (!media) throw new Error('No se pudo descargar la imagen.');

            const link = await uploadToYotsuba(media, mime);
            const fullLink = `https://upload.yotsuba.giize.com${link}`;

            const sessionsPath = path.resolve('./sesiones_subbots');
            const userSettingsPath = path.join(sessionsPath, botNumber, 'settings.json');

            if (!fs.existsSync(path.join(sessionsPath, botNumber))) {
                return await conn.sendMessage(from, { text: `*${config.visuals.emoji2}* Carpeta de sesión no encontrada.` }, { quoted: m });
            }

            let localConfig = {};
            if (fs.existsSync(userSettingsPath)) {
                localConfig = await fs.readJson(userSettingsPath);
            }

            localConfig.banner = fullLink;
            localConfig.lastUpdate = Date.now();

            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            const socketName = localConfig.shortName || config.botName;

            const successMsg = `*${config.visuals.emoji3} \`BANNER ACTUALIZADO\` ${config.visuals.emoji3}*\n\nSe ha cambiado el banner para el socket *${socketName}*.\n\n*🚀 Enlace:* ${fullLink}\n\n> ¡Ajuste aplicado correctamente!`;

            await conn.sendMessage(from, { text: successMsg }, { quoted: m });

            if (from !== m.sender) {
                await conn.sendMessage(m.sender, { text: successMsg });
            }

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { text: `*${config.visuals.emoji2}* Error al procesar el banner.` }, { quoted: m });
        }
    }
};

export default setBanner;