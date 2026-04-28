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
            
            if (!text && m.quoted && m.quoted.text) {
                text = m.quoted.text;
            }

            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Escribe el texto que deseas anunciar.\n\n> Ejemplo: *${usedPrefix}${commandName} ¡Hola a todos!*`);
            }

            await conn.sendMessage(m.chat, { 
                text: text, 
                mentions: participants 
            });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la mención.`);
        }
    }
};

export default hidetagCommand;