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
            let q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';

            if (!m.quoted && !text) {
                return m.reply(`*${config.visuals.emoji2}* Responde a un mensaje o escribe un texto.\n\n> Ejemplo: *${usedPrefix}${commandName} anuncio*`);
            }

            if (m.quoted && mime) {
                await conn.copyNForward(m.chat, m.quoted.fakeObj, false, { contextInfo: { mentionedJid: participants } });
            } else {
                let messageText = text || (m.quoted ? (m.quoted.text || m.quoted.caption || m.quoted.description) : '');
                
                if (!messageText) return m.reply(`*${config.visuals.emoji2}* No se encontró texto para el tag.`);

                await conn.sendMessage(m.chat, { 
                    text: messageText, 
                    mentions: participants 
                });
            }

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar el tag.`);
        }
    }
};

export default hidetagCommand;