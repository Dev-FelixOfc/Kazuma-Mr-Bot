import { config } from '../config.js';

const reactCanalCommand = {
    name: 'rcanal',
    alias: ['testcanal'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        // Limpieza profunda del link para evitar el Bad Request
        const linkPattern = /https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/;
        const match = text.match(linkPattern);
        
        if (!match) {
            return m.reply(`*${config.visuals.emoji2}* \`Error de Formato\`\n\nEl enlace debe ser: https://whatsapp.com/channel/XXXXX`);
        }

        const canalUrl = match[0];

        try {
            // Usamos queryNewsletterMetadata que suele ser más estable para búsquedas rápidas
            const res = await conn.newsletterMetadata('url', canalUrl).catch(async () => {
                // Si falla, intentamos una segunda vía interna de Baileys
                return await conn.query({
                    tag: 'iq',
                    attrs: { display_name: 'WhatsApp', to: '@s.whatsapp.net', type: 'get', xmlns: 'w:mex' },
                    content: [{
                        tag: 'query',
                        attrs: { query_id: '6620195908089573' },
                        content: JSON.stringify({ variables: { newsletter_id: canalUrl.split('/').pop() } })
                    }]
                });
            });

            if (!res) throw new Error("No se obtuvo respuesta del servidor Mex/GraphQL");

            // Extraemos los datos básicos
            const id = res.id || 'No detectado';
            const name = res.name || 'Privado/No encontrado';
            const subs = res.subscribers || 'Ocultos';

            let diagnostic = `📊 *DIAGNÓSTICO DE CANAL*\n\n`;
            diagnostic += `📝 *Nombre:* \`${name}\`\n`;
            diagnostic += `🆔 *JID:* \`${id}\`\n`;
            diagnostic += `👥 *Seguidores:* \`${subs}\`\n`;
            diagnostic += `🎭 *Rol del Bot:* \`${res.role || 'Invitado'}\`\n`;
            
            await m.reply(diagnostic);

            // Intentamos leer el último mensaje para ver si tenemos permisos de lectura
            try {
                const messages = await conn.fetchMessagesFromNewsletter(id, 1);
                if (messages && messages.length > 0) {
                    await m.reply(`✅ *Conexión Exitosa*\nÚltimo mensaje ID: \`${messages[0].id}\``);
                } else {
                    await m.reply(`⚠️ *Aviso:* No se detectaron mensajes (Canal vacío o sin permisos).`);
                }
            } catch (e) {
                await m.reply(`❌ *Error de Lectura:* No tengo permiso para ver mensajes de este canal.`);
            }

        } catch (err) {
            console.error(err);
            // Si sigue saliendo Bad Request, es probable que la versión de Baileys necesite actualizarse
            m.reply(`*${config.visuals.emoji2}* \`Fallo Crítico\`\n\nDetalle: ${err.message}\n> Intenta actualizar Baileys si el error persiste.`);
        }
    }
};

export default reactCanalCommand;