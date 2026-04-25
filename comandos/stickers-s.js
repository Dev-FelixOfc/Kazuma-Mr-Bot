import { config } from '../config.js';
import { configPriority } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const stickerCommand = {
    name: 'sticker',
    alias: ['s', 'stiker', 'wm'],
    category: 'tools',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            if (!/image|video|webp/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* \`Falta Multimedia\`\n\nResponde a una imagen o video.`);
            }

            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* Error al descargar el archivo.`);

            let userName = m.pushName || 'User';
            let botName = config.botName || 'Kazuma Bot';

            let pack = configPriority.stickers.packname;
            let author = configPriority.stickers.packauthor
                .replace('(botName)', botName)
                .replace('(userName)', userName);

            let sticker = new Sticker(img, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: m.id,
                quality: 70,
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar.`);
        }
    }
};

export default stickerCommand;