/* KURAYAMI TEAM- SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'bots',
    alias: ['sockets', 'subbots', 'nodos'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: true, 

    run: async (conn, m) => {
        const from = m.chat;

        try {
            // 1. Obtener metadatos del grupo y participantes (Soporte LID)
            const groupMetadata = await conn.groupMetadata(from);
            // Creamos una lista limpia de JIDs de participantes, filtrando si son LIDs o JIDs normales
            const participants = groupMetadata.participants.map(p => p.id);

            // 2. Conteo de archivos de sesión (Sub-Bots totales en disco)
            const sessionsPath = path.resolve('./sesiones_subbots');
            let totalSubBots = 0;
            if (fs.existsSync(sessionsPath)) {
                totalSubBots = fs.readdirSync(sessionsPath).filter(f => !f.startsWith('.')).length;
            }

            // 3. Identificar Sockets de la red Kurayami en este grupo
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const activeSubBotsJids = Array.from(global.subBots?.keys() || []); 

            // Filtramos participantes que coincidan con el principal o los subbots activos
            const botsInGroup = groupMetadata.participants.filter(p => 
                p.id === mainBotJid || activeSubBotsJids.includes(p.id) || (p.lid && activeSubBotsJids.includes(p.lid))
            );

            // 4. Construir lista de menciones y cuerpo del mensaje
            let mentionsJid = [];
            let listaMenciones = "";

            botsInGroup.forEach((bot) => {
                const jid = bot.id; 
                mentionsJid.push(jid);
                // Usamos el JID real para la mención visual
                listaMenciones += `   ➪ @${jid.split('@')[0]}\n`;
            });

            // 5. Armar el mensaje final con estética Gótica/Neon
            const texto = `
✿︎ \`LISTA DE SOCKETS ACTIVOS\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots » ${totalSubBots}*

*⌨︎ Nodos en este grupo » ${botsInGroup.length}*

${listaMenciones || "_No hay más nodos en este grupo._"}
`.trim();

            // 6. Envío con ContextInfo para que la mención brille en azul
            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentionsJid, // Array de JIDs para que WhatsApp active el @
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Supervisión de Nodos Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false // Mantenemos el estilo limpio que querías
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando bots:', err);
            m.reply('❌ Error al escanear la red de sockets.');
        }
    }
};

export default listSocketsCommand;