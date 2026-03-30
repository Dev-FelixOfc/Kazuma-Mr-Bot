import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'bots',
    alias: ['sockets', 'subbots'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: true, // Se enfoca en grupos para mostrar quiénes están presentes

    run: async (conn, m, { participants }) => {
        const from = m.key.remoteJid;

        try {
            // 1. Conteo de archivos de sesión (Sub-Bots totales)
            const sessionsPath = path.resolve('./sesiones_subbots');
            let totalSubBots = 0;
            if (fs.existsSync(sessionsPath)) {
                totalSubBots = fs.readdirSync(sessionsPath).length;
            }

            // 2. Identificar bots en este grupo
            // Obtenemos todos los números de los sub-bots activos en memoria
            const activeSubBotsJids = Array.from(global.subBots.keys()); 
            // Añadimos el bot principal a la lista de búsqueda
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // Filtramos los participantes del grupo que coincidan con nuestra red
            const botsInGroup = participants.filter(p => 
                p.id === mainBotJid || activeSubBotsJids.includes(p.id)
            );

            const countInGroup = botsInGroup.length;

            // 3. Construir lista de menciones
            let mentions = [];
            let listaMenciones = "";
            
            botsInGroup.forEach((bot, index) => {
                const jid = bot.id;
                mentions.push(jid);
                listaMenciones += `➪ @${jid.split('@')[0]}\n`;
            });

            // 4. Armar el mensaje final
            const texto = `
✿︎ \`Lista de Sockets activos\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots » ${totalSubBots}*

*⌨︎ En este grupo » ${countInGroup}*

${listaMenciones}
`.trim();

            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentions, // Importante para que las @ funcionen
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Lista de nodos conectados',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando bots:', err);
        }
    }
};

export default listSocketsCommand;