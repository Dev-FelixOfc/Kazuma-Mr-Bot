/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const command = {
    name: 'sockets',
    alias: ['code', 'bots'],
    category: 'sockets',
    run: async (conn, m) => {
        try {
            const mainNumber = conn.user.id.split(':')[0];
            const sessionsPath = path.resolve('./sesiones_subbots');
            
            let totalSubs = 0;
            let listaBots = `   ➪ https://wa.me/${mainNumber} » (Principal)\n`;

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });
                
                totalSubs = folders.length;
                
                folders.forEach(folder => {
                    const num = folder.replace(/\D/g, '');
                    if (num && num !== mainNumber) {
                        listaBots += `   ➪ https://wa.me/${num} » (Sub-Bot)\n`;
                    }
                });
            }

            const texto = `✿︎ \`LISTA DE BOTS ACTIVOS\` ✿︎\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*📊 LISTA DETALLADA:*\n${listaBots}`;

            await conn.sendMessage(m.chat, { 
                text: texto.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BOTS STATUS',
                        body: 'Red de Bots Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error en comando sockets:", e);
        }
    }
};

export default command;