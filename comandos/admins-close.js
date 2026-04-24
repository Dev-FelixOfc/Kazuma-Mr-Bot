import { config } from '../config.js';

const closeGroup = {
    name: 'close',
    alias: ['cerrargroup', 'cerrardatos', 'cerrar'],
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El bot no posee rango de Administrador. Requiero permisos elevados para cerrar las comunicaciones.\n\n> ¡No puedo gestionar el grupo sin los permisos adecuados!`);
            }

            if (groupMetadata.announce) {
                return m.reply(`*${config.visuals.emoji2}* El grupo ya se encuentra en modo restrictivo (cerrado).\n\n> ¡El silencio ya impera en este sector!`);
            }

            await conn.groupSettingUpdate(m.chat, 'announcement');
            
            m.reply(`*${config.visuals.emoji3} \`GRUPO CERRADO\` ${config.visuals.emoji3}*\n\nSe ha activado el modo restrictivo. Solo los administradores pueden enviar mensajes.\n\n> ¡Momento de silencio en el servidor!`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar cerrar el grupo.`);
        }
    }
};

export default closeGroup;