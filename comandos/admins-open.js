import { config } from '../config.js';

const openGroup = {
    name: 'open',
    alias: ['abrirgroup', 'abrirdatos', 'abrir'],
    category: 'admins',
    isAdmin: true,
    isBotAdmin: false,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El bot no posee rango de Administrador. No tengo poder para alterar los ajustes del grupo.\n\n> ¡Solicita el rango si deseas automatizar esta función!`);
            }

            if (!groupMetadata.announce) {
                return m.reply(`*${config.visuals.emoji2}* El grupo ya se encuentra abierto para todos los miembros.\n\n> ¡No es necesario ejecutar la apertura de nuevo!`);
            }

            await conn.groupSettingUpdate(m.chat, 'not_announcement');
            
            m.reply(`*${config.visuals.emoji3} \`GRUPO ABIERTO\` ${config.visuals.emoji3}*\n\nLa restricción ha sido levantada. Todos los miembros pueden enviar mensajes ahora.\n\n> ¡Mantengan el orden y respeten las reglas!`);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al intentar abrir el grupo.`);
        }
    }
};

export default openGroup;