import { config } from '../config.js';

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
                return m.reply(`*${config.visuals.emoji2}* Responde a un mensaje o escribe un texto.\n\n> Ejemplo: *${usedPrefix}${commandName} anuncio*`);
            }

            if (q) {
                const mime = (q.msg || q).mimetype || '';
                if (mime) {
                    const content = await q.download();
                    let options = { mentions: participants };

                    if (/sticker/.test(mime)) {
                        options.sticker = content;
                    } else if (/image/.test(mime)) {
                        options.image = content;
                        options.caption = text || q.text || '';
                    } else if (/video/.test(mime)) {
                        options.video = content;
                        options.caption = text || q.text || '';
                    } else if (/audio/.test(mime)) {
                        options.audio = content;
                        options.mimetype = 'audio/mp4';
                        options.ptt = true;
                    }

                    await conn.sendMessage(m.chat, options);
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