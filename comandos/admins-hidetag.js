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

            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';
            let text = args.join(' ');

            if (!m.quoted && !text) {
                return m.reply(`*${config.visuals.emoji2}* Responde a algo o escribe un texto para anunciar.\n\n> Ejemplo: *${usedPrefix}${commandName} ¡Hola!*`);
            }

            if (m.quoted) {
                let content = await m.quoted.download();
                let messageOptions = { mentions: participants };

                if (/image/.test(mime)) messageOptions.image = content;
                else if (/video/.test(mime)) messageOptions.video = content;
                else if (/sticker/.test(mime)) messageOptions.sticker = content;
                else if (/audio/.test(mime)) {
                    messageOptions.audio = content;
                    messageOptions.mimetype = 'audio/mp4';
                    messageOptions.ptt = true;
                }
                else {
                    messageOptions.text = m.quoted.text || '';
                }

                if (m.quoted.text && !/sticker|audio/.test(mime)) {
                    messageOptions.caption = m.quoted.text;
                }

                await conn.sendMessage(m.chat, messageOptions);
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