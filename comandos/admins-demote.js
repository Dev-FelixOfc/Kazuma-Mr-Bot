import { config } from '../config.js';

const demoteCommand = {
    name: 'demote',
    alias: ['quitaradmin', 'degradar'],
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El bot no posee rango de Administrador. No puedo revocar privilegios.\n\n> ¡Solicita el rango para gestionar la jerarquía!`);
            }

            let targetJid;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* Debes mencionar a alguien o responder a su mensaje para ejecutar la degradación.\n\n> ¡Indica a quién debemos quitar el rango!`);
            }

            const userToDemote = targetJid.split('@')[0].split(':')[0] + '@s.whatsapp.net';
            const ownerNumber = config.owner[0][0] + '@s.whatsapp.net';
            const groupCreator = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net';

            if (userToDemote === botNumber) {
                return m.reply(`*${config.visuals.emoji2}* No puedo degradarme a mí mismo. Mi propósito es servir, no autodestruirme.\n\n> ¡Acción cancelada por protocolo de seguridad!`);
            }

            if (userToDemote === ownerNumber) {
                return m.reply(`*${config.visuals.emoji2}* El Creador del bot posee una jerarquía absoluta. No puedes quitarle sus privilegios.\n\n> ¡Intento de rebelión detectado y bloqueado!`);
            }

            if (userToDemote === groupCreator) {
                return m.reply(`*${config.visuals.emoji2}* No se puede degradar al dueño original del grupo. Su autoridad es raíz.\n\n> ¡No tengo permiso para tocar al Fundador!`);
            }

            const participants = groupMetadata.participants;
            const targetData = participants.find(p => p.id === userToDemote);

            if (!targetData?.admin) {
                return m.reply(`*${config.visuals.emoji2}* El usuario seleccionado no es Administrador.\n\n> ¡No hay privilegios que revocar!`);
            }

            await conn.groupParticipantsUpdate(m.chat, [userToDemote], 'demote');

            const allMembers = participants.map(p => p.id);
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`DEGRADACIÓN COMPLETADA\` ${config.visuals.emoji3}*\n\nEl usuario @${userToDemote.split('@')[0]} ha sido despojado de sus privilegios.\n\n> ¡El equilibrio ha sido restaurado!`,
                mentions: allMembers
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la degradación.`);
        }
    }
};

export default demoteCommand;
