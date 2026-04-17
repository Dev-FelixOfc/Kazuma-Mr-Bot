import { config } from '../config.js';

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    isAdmin: true, 
    botAdmin: true, 
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, { participants, isGroup }) => {
        if (!isGroup) return;

        if (!m.mentionedJid[0] && !m.quoted) {
            return m.reply(`*${config.visuals.emoji2}* Etiqueta o responde al mensaje de la persona que quieres eliminar.`);
        }

        let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
        
        const groupInfo = await conn.groupMetadata(m.chat);
        const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
        const botId = conn.decodeJid(conn.user.id);

        const participant = groupInfo.participants.find((p) => p.id === victim || p.lid === victim);

        if (!participant) {
            return m.reply(`*${config.visuals.emoji2}* @${victim.split('@')[0]} ya no está en el grupo.`, null, { mentions: [victim] });
        }

        if (victim === botId) {
            return m.reply(`*${config.visuals.emoji3}* No puedo eliminarme a mí mismo.`);
        }

        if (victim === ownerGroup) {
            return m.reply(`*${config.visuals.emoji6}* No puedo eliminar al propietario del grupo.`);
        }

        if (config.owner.includes(victim)) {
            return m.reply(`*${config.visuals.emoji11}* No tengo permitido eliminar a mi **Owner**.`);
        }

        if (participant.admin || participant.isSuperAdmin) {
            return m.reply(`*${config.visuals.emoji6}* No puedo eliminar a @${victim.split('@')[0]} porque es un **Administrador**.`, null, { mentions: [victim] });
        }

        try {
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji7} \`SISTEMA DE MODERACIÓN\` ${config.visuals.emoji7}*\n\nEl usuario @${victim.split('@')[0]} será eliminado del grupo.`,
                mentions: [victim]
            }, { quoted: m });
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');
        } catch (e) {
            return m.reply(`*${config.visuals.emoji2}* Error: ${e.message}`);
        }
    }
};

export default kickCommand;
