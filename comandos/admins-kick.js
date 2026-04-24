import { config } from '../config.js';

const kickCommand = {
    name: 'kick',
    alias: ['sacar', 'ban', 'eliminar'],
    category: 'admins',
    isAdmin: true,
    isBotAdmin: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userToKick = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            if (!userToKick) {
                return m.reply(`*${config.visuals.emoji2} \`ERROR DE OBJETIVO\` ${config.visuals.emoji2}*\n\nDebes mencionar a alguien o responder a su mensaje para ejecutar la purga.\n\n> ¡Indica a quién debemos eliminar del grupo!`);
            }

            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const ownerNumber = config.owner[0][0] + '@s.whatsapp.net';
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const targetData = participants.find(p => p.id === userToKick);
            const isTargetAdmin = targetData?.admin || targetData?.isSuperAdmin;

            if (userToKick === m.sender) {
                return m.reply(`*${config.visuals.emoji2} \`AUTO-PURGA DENEGADA\` ${config.visuals.emoji2}*\n\nNo puedes eliminarte a ti mismo de la existencia.\n\n> ¡Si deseas irte, hazlo manualmente!`);
            }

            if (userToKick === ownerNumber) {
                return m.reply(`*${config.visuals.emoji2} \`JERARQUÍA INVIOLABLE\` ${config.visuals.emoji2}*\n\nHas intentado atacar al Creador. La acción ha sido bloqueada.\n\n> ¡Nadie toca al Owner en este servidor!`);
            }

            if (isTargetAdmin) {
                return m.reply(`*${config.visuals.emoji2} \`PROTECCIÓN DE RANGO\` ${config.visuals.emoji2}*\n\nEl objetivo posee privilegios de Administrador. No puedo procesar esta orden.\n\n> ¡Debes quitarle el rango primero si deseas expulsarlo!`);
            }

            if (userToKick === botNumber) {
                return m.reply(`*${config.visuals.emoji2}* ¿Intentas sacarme a mí? Qué atrevido...`);
            }

            await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');

            m.reply(`*${config.visuals.emoji3} \`PURGA COMPLETADA\` ${config.visuals.emoji3}*\n\nEl usuario @${userToKick.split('@')[0]} ha sido desterrado con éxito.\n\n> ¡El orden ha sido restaurado en el grupo!`, { mentions: [userToKick] });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la expulsión.`);
        }
    }
};

export default kickCommand;