import { config } from '../config.js';

const promoteCommand = {
    name: 'promote',
    alias: ['daradmin', 'promover'],
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El bot no posee rango de Administrador. No puedo otorgar privilegios a otros miembros.\n\n> ¡Solicita el rango si deseas automatizar esta función!`);
            }

            let targetJid;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* Debes mencionar a alguien o responder a su mensaje para otorgar el ascenso.\n\n> ¡Indica quién será el nuevo Administrador!`);
            }

            const userToPromote = targetJid.split('@')[0].split(':')[0] + '@s.whatsapp.net';
            const participants = groupMetadata.participants;
            const targetData = participants.find(p => p.id === userToPromote);

            if (targetData?.admin) {
                return m.reply(`*${config.visuals.emoji2}* El usuario seleccionado ya posee el rango de Administrador.\n\n> ¡No es necesario promoverlo de nuevo!`);
            }

            await conn.groupParticipantsUpdate(m.chat, [userToPromote], 'promote');

            const allMembers = participants.map(p => p.id);
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`ASCENSO COMPLETADO\` ${config.visuals.emoji3}*\n\nEl usuario @${userToPromote.split('@')[0]} ahora forma parte de la jerarquía de Administradores.\n\n> ¡Un nuevo poder ha sido otorgado!`,
                mentions: allMembers
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar el ascenso.`);
        }
    }
};

export default promoteCommand;