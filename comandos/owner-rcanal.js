import { config } from '../config.js';

const reactCanalCommand = {
    name: 'rcanal',
    alias: ['testcanal', 'infocanal'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/[a-zA-Z0-9]+/);
        
        if (!linkMatch) {
            return m.reply(`*${config.visuals.emoji2}* \`Error de Enlace\`\n\nProporciona un link válido de canal.`);
        }

        const link = linkMatch[0];

        try {
            const res = await conn.newsletterMetadata('url', link);
            
            if (!res) return m.reply(`*${config.visuals.emoji2}* No se pudo obtener metadata.`);

            const { id, name, subscribers, description, role, reaction_codes } = res;

            let info = `📊 \`TEST DE CANAL\` 📊\n\n`;
            info += `📝 *Nombre:* ${name || 'No encontrado'}\n`;
            info += `🆔 *JID:* ${id}\n`;
            info += `👥 *Seguidores:* ${subscribers || 'Oculto/0'}\n`;
            info += `🎭 *Tu Rol:* ${role || 'Ninguno'}\n`;
            info += `✅ *Reacciones Permitidas:* ${reaction_codes?.mode || 'Desconocido'}\n`;
            info += `📌 *Descripción:* ${description?.slice(0, 100) || 'Sin descripción'}...\n\n`;
            
            await m.reply(info);

            const messages = await conn.fetchMessagesFromNewsletter(id, 1);
            
            if (messages && messages.length > 0) {
                const lastMsg = messages[0];
                await m.reply(`✅ *Último Mensaje Detectado:*\nID: \`${lastMsg.id}\`\nTipo: \`${Object.keys(lastMsg.message || {})[0] || 'Desconocido'}\``);
            } else {
                await m.reply(`⚠️ *Aviso:* No se detectaron mensajes recientes en el historial.`);
            }

        } catch (err) {
            console.error(err);
            m.reply(`*${config.visuals.emoji2}* \`Fallo en el Test\`\n\nError: ${err.message}`);
        }
    }
};

export default reactCanalCommand;