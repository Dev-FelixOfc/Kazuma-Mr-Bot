/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
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
    noPrefix: true, 

    run: async (conn, m) => {
        const from = m.chat;

        try {
            // 1. Obtener el ID del bot principal y el del grupo
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const groupMetadata = await conn.groupMetadata(from).catch(() => ({ participants: [] }));
            const participants = groupMetadata.participants.map(p => p.id) || [];

            // 2. Escaneo SEGURO de carpetas
            const sessionsPath = path.resolve('./sesiones_subbots');
            let sessionFolders = [];
            if (fs.existsSync(sessionsPath)) {
                try {
                    sessionFolders = fs.readdirSync(sessionsPath).filter(f => {
                        const p = path.join(sessionsPath, f);
                        return fs.statSync(p).isDirectory() && !f.startsWith('.');
                    });
                } catch (e) { sessionFolders = []; }
            }

            let mentionsJid = [];
            let listaFinal = "";
            let totalEnGrupo = 0;

            // 3. AGREGAR AL PRINCIPAL (Siempre primero si está en el grupo)
            // Si por alguna razón no detecta participantes, igual lo ponemos para que el comando no salga vacío
            if (participants.length === 0 || participants.includes(mainBotJid)) {
                mentionsJid.push(mainBotJid);
                listaFinal += `   *➪ @${mainBotJid.split('@')[0]}* » (Principal)\n`;
                totalEnGrupo++;
            }

            // 4. AGREGAR SUBS (Solo si existen carpetas)
            for (const folder of sessionFolders) {
                const rawNumber = folder.replace(/\D/g, '');
                if (!rawNumber) continue;
                
                const subJid = `${rawNumber}@s.whatsapp.net`;
                
                // Si el sub está en el grupo y no es el principal
                if (participants.includes(subJid) && subJid !== mainBotJid) {
                    mentionsJid.push(subJid);
                    listaFinal += `   *➪ @${rawNumber}* » (Sub-Bot)\n`;
                    totalEnGrupo++;
                }
            }

            // 5. MENSAJE FINAL
            const texto = `
✿︎ \`LISTA DE SOCKETS ACTIVOS\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots Totales » ${sessionFolders.length}*

*⌨︎ Nodos en este grupo » ${totalEnGrupo}*

${listaFinal}
`.trim();

            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentionsJid,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Supervisión de Nodos Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            // Si llega aquí, es que algo muy raro pasó, pero lo imprimimos para saber qué es
            console.log("ERROR EN SOCKETS:", err);
            m.reply("⚠️ El motor de sockets encontró un problema técnico.");
        }
    }
};

export default listSocketsCommand;
