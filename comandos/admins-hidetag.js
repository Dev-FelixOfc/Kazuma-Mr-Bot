import { config } from '../config.js';
import { getDynamicConfig } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const hidetagCommand = {
    name: 'hidetag',
    alias: ['tag', 'mencion', 'notificar'],
    category: 'admins',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id);

            let text = args.join(' ');
            let q = m.quoted ? m.quoted : null;

            if (!q && !text) {
                return m.reply(`*${config.visuals.emoji2}* Responde a algo o escribe un texto para anunciar.\n\n> Ejemplo: *${usedPrefix}${commandName} ¡Hola!*`);
            }

            if (q) {
                const mime = (q.msg || q).mimetype || '';
                
                if (/sticker/.test(mime)) {
                    const dynamic = await getDynamicConfig(conn);
                    const userName = m.pushName || 'User';
                    const pack = dynamic.stickers.packname;
                    const author = dynamic.stickers.packauthor.replace('@(userName)', userName);
                    
                    const content = await q.download();
                    const sticker = new Sticker(content, {
                        pack: pack,
                        author: author,
                        type: StickerTypes.FULL,
                        categories: ['🤩'],
                        quality: 70,
                    });

                    const buffer = await sticker.toBuffer();
                    await conn.sendMessage(m.chat, { sticker: buffer, mentions: participants });
                } else if (mime) {
                    const content = await q.download();
                    let messageOptions = { mentions: participants };

                    if (/image/.test(mime)) messageOptions.image = content;
                    else if (/video/.test(mime)) messageOptions.video = content;
                    else if (/audio/.test(mime)) {
                        messageOptions.audio = content;
                        messageOptions.mimetype = 'audio/mp4';
                        messageOptions.ptt = true;
                    }

                    if (text || q.text) messageOptions.caption = text || q.text;
                    await conn.sendMessage(m.chat, messageOptions);
                } else {
                    await conn.sendMessage(m.chat, { 
                        text: text || q.text || '', 
                        mentions: participants 
                    });
                }
            } else {
                await conn.sendMessage(m.chat, { 
                    text: text, 
                    mentions: participants 
                });
            }

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar el tag.`);
        }
    }
};

export default hidetagCommand;