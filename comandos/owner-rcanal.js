import { config } from '../config.js';

const followCanalCommand = {
    name: 'rcanal',
    alias: ['seguir'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return;

        // Extraer el código después de /channel/
        const code = text.split('/channel/')[1]?.split(' ')[0];
        if (!code) return m.reply("❌ Link inválido.");

        try {
            // Intentar seguir por ID/Código directamente
            // Usamos el método interno del socket para newsletters
            await conn.newsletterFollow(code);
            await m.reply(`✅ Siguiendo: ${code}`);
        } catch (err) {
            // Segundo intento: Forzar vía query de mensajes (iq)
            try {
                await conn.query({
                    tag: 'iq',
                    attrs: { 
                        to: '@s.whatsapp.net', 
                        type: 'set', 
                        xmlns: 'w:mex' 
                    },
                    content: [{
                        tag: 'query',
                        attrs: { query_id: '6620195908089573' },
                        content: JSON.stringify({ 
                            variables: { 
                                newsletter_id: code 
                            } 
                        })
                    }]
                });
                await m.reply(`✅ Siguiendo (vía query): ${code}`);
            } catch (e) {
                // Si aquí no responde nada, el problema es tu versión de Baileys
                console.error(e);
                await m.reply("❌ Error total al intentar seguir.");
            }
        }
    }
};

export default followCanalCommand;