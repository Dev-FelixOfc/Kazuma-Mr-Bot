/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

const ytVideoCommand = {
    name: 'ytmp4',
    alias: ['play', 'ytvideo', 'video', 'v'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        
        // Key de la API Stellarwa sacada de tu ejemplo
        const apiKey = "api-Bb1JX"; 

        if (!text) {
            return await conn.sendMessage(from, { 
                text: `*${e1} Ingresa un enlace de Youtube.*`,
                contextInfo: {
                    externalAdReply: {
                        title: config.botName,
                        body: 'Youtube Video Downloader',
                        thumbnailUrl: config.visuals.img1, 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false, // Miniatura pequeña como en tu ping
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }

        try {
            // 1. Aviso de búsqueda (puedes cambiar el texto si quieres algo más específico)
            await m.reply(`*${config.visuals.emoji2} Buscando resultados...*`);

            // 2. Solicitud a la API Stellarwa v2
            const apiUrl = `https://api.stellarwa.xyz/dl/ytmp4v2?url=${encodeURIComponent(text)}&key=${apiKey}`;
            const res = await fetch(apiUrl);
            const json = await res.json();

            // Verificamos que la respuesta sea exitosa según tu JSON de ejemplo
            if (!json.status || !json.data || !json.data.dl) {
                return m.reply(`*${e1} Error:* No se pudo obtener el enlace de descarga. Verifica el link.`);
            }

            // Mapeo de los datos del JSON de Diego
            const { title, uploader, views, size, duration, dl } = json.data;

            // 3. Envío del archivo de video
            await conn.sendMessage(from, { 
                video: { url: dl }, 
                caption: `*${e1} TÍTULO:* ${title}\n*👤 CANAL:* ${uploader}\n*👁️ VISTAS:* ${views}\n*⌛ DURACIÓN:* ${duration}\n*📦 PESO:* ${size}\n\n> Kazuma-Bot | Félix Ofc`,
                fileName: `${title}.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m });

        } catch (error) {
            console.error('Error en descargas-ytvideo:', error);
            m.reply(`*${e1} Error:* Hubo un fallo al conectar con la API de Stellarwa.`);
        }
    }
};

export default ytVideoCommand;