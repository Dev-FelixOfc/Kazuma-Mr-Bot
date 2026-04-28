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

            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';
            const text = args.join(' ') || (m.quoted ? m.quoted.text : '');

            if (!mime && !text) {
                return m.reply(`*${config.visuals.emoji2}* Responde a un mensaje o escribe un texto para anunciar.\n\n> Ejemplo: *${usedPrefix}${commandName} ¡Hola!*`);
            }

            if (m.quoted) {
                await conn.sendMessage(m.chat, { 
                    forward: m.quoted.fakeObj, 
                    contextInfo: { 
                        mentionedJid: participants 
                    } 
                });
            } else {
                await conn.sendMessage(m.chat, { 
                    text: text, 
                    mentions: participants 
                });
            }

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al reenviar la mención.`);
        }
    }
};

export default hidetagCommand;