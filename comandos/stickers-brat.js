import { config } from '../config.js';
import { getDynamicConfig } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import Jimp from 'jimp';

const bratCommand = {
    name: 'brat',
    alias: ['sbrat', 'stickerbrat'],
    category: 'tools',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let text = args.join(' ');
            if (!text) return m.reply(`*${config.visuals.emoji2}* \`Falta Texto\`\n\nEscribe el texto para el sticker.\n\n> Ejemplo: *brat Hola*`);

            const canvas = new Jimp(512, 512, 0xFFFFFFFF);
            const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

            const margin = 20;
            const maxWidth = 512 - (margin * 2);
            const maxHeight = 512 - (margin * 2);

            canvas.print(
                font,
                margin,
                margin,
                {
                    text: text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                },
                maxWidth,
                maxHeight
            );

            const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);

            const dynamicConfig = await getDynamicConfig(conn);
            let userName = m.pushName || 'User';

            let pack = dynamicConfig.stickers.packname;
            let author = dynamicConfig.stickers.packauthor.replace('(userName)', userName);

            let sticker = new Sticker(buffer, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩'],
                quality: 70,
            });

            const stikerBuffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al crear el brat.`);
        }
    }
};

export default bratCommand;