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
                return m.reply(`*${config.visuals.emoji2}* Escribe el texto que deseas anunciar o responde a un mensaje.\n\n> Ejemplo: *${usedPrefix}${commandName} ¡Hola a todos!*`);
            }

            if (q) {
                const mime = (q.msg || q).mimetype || '';
                
                if (mime) {
                    const content = await q.download();
                    let messageOptions = { mentions: participants };

                    if (/image/.test(mime)) messageOptions.image = content;
                    else if (/video/.test(mime)) messageOptions.video = content;
                    else if (/sticker/.test(mime)) messageOptions.sticker = content;
                    else if (/audio/.test(mime)) {
                        messageOptions.audio = content;
                        messageOptions.mimetype = 'audio/mp4';
                        messageOptions.ptt = true;
                    }

                    if (q.text || text) {
                        messageOptions.caption = text || q.text;
                    }

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
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el tag.`);
        }
    }
};

export default hidetagCommand;