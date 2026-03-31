/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'sockets',
    alias: ['sockets', 'bots', 'subbots'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: false, 
    noPrefix: true, 

    run: async (conn, m) => {
        const from = m.chat;

        try {
            // 1. Identificar al Principal
            const mainNumber = conn.user.id.split(':')[0];
            const mainLink = `https://wa.me/${mainNumber}`;

            // 2. Escaneo de la carpeta de sesiones para los Subs
            const sessionsPath = path.resolve('./sesiones_subbots');
            let subLinks = [];
            let totalSubs = 0;

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    // Solo contamos carpetas reales que no sean archivos ocultos
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });

                totalSubs = folders.length;

                // Convertimos cada carpeta (número) en un enlace directo
                subLinks = folders.map(folder => {
                    const rawNumber = folder.replace(/\D/g, '');
                    return rawNumber ? `   ➪ https://wa.me/${rawNumber} » (Sub-Bot)` : null;
                }).filter(link => link !== null);
            }

            // 3. Construcción del mensaje (Estilo Limpio Kurayami)
            let texto = `✿︎ \`LISTA DE BOTS ACTIVOS\` ✿︎\n\n`;
            texto += `*❁ Principal » 1*\n`;
            texto += `*❀ Subs Totales » ${totalSubs}*\n\n`;
            
            texto += `*📊 LISTA DETALLADA:*\n`;
            texto += `   ➪ ${mainLink} » (Principal)\n`;
            
            if (subLinks.length > 0) {
                texto += subLinks.join('\n');
            } else {
                texto += `\n_No hay Sub-Bots vinculados actualmente._`;
            }

            // 4. Envío con la estética de Kazuma
            await conn.sendMessage(from, { 
                text: texto.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BOTS STATUS',
                        body: 'Lista de bots activos en la red',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el comando sockets:', err);
            await conn.sendMessage(from, { text: "⚠️ Ocurrió un error al listar los bots." });
        }
    }
};

export default listSocketsCommand;