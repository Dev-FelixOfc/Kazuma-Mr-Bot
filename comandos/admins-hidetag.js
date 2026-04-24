import { config } from '../config.js';

const hidetagCommand = {
    name: 'hidetag',
    alias: ['tag', 'mencionar'],
    category: 'admins',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, { text }) => {
        try {
            // Obtener el texto directamente del cuerpo del mensaje si 'text' llega vacío
            // Esto soluciona el problema de detección cuando noPrefix está activo
            let mensaje = text;
            
            if (!mensaje && m.body) {
                // Eliminamos el comando del inicio del texto para obtener solo el mensaje
                const commandUsed = m.body.split(' ')[0];
                mensaje = m.body.slice(commandUsed.length).trim();
            }

            // Si aún no hay mensaje, intentamos sacar el texto de un mensaje citado
            if (!mensaje && m.quoted) {
                mensaje = m.quoted.text || m.quoted.caption || '';
            }

            if (!mensaje && !m.quoted) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa un mensaje o responde a uno para hacer el hidetag.`);
            }

            const participants = await conn.groupMetadata(m.chat).then(v => v.participants);
            const users = participants.map(u => u.id);

            if (m.quoted) {
                await conn.sendMessage(m.chat, { 
                    forward: m.quoted.fakeObj, 
                    mentions: users 
                });
            } else {
                await conn.sendMessage(m.chat, { 
                    text: mensaje, 
                    mentions: users 
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar el hidetag.`);
        }
    }
};

export default hidetagCommand;
