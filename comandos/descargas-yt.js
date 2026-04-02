/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

// Almacén temporal para los resultados de búsqueda
let ytSearchDB = {};

const ytCommand = {
    name: 'yt',
    alias: ['ytmp4', 'play', 'ytsearch', 'download'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command, prefix }) => {
        const from = m.key.remoteJid;
        const apiKey = config.apiYT;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;

        // 1. LÓGICA DE DESCARGA DIRECTA (#ytmp4 o #play)
        if (command === 'ytmp4' || command === 'play') {
            if (!text) {
                return await conn.sendMessage(from, { 
                    text: `*${e1} ${config.bienvenidas.bienvenida1}*\n\n> Por favor, ingresa un enlace de YouTube válido para descargar.`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - DOWNLOADER',
                            body: 'Error: Falta Enlace',
                            thumbnailUrl: config.visuals.img1, 
                            sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                            mediaType: 1,
                            renderLargerThumbnail: false, // Miniatura chiquita como en tu ping
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });
            }

            try {
                const res = await fetch(`https://nex-magical.vercel.app/download/video?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
                const json = await res.json();
                if (!json.status) throw 'Error en API';

                const { title, duration, size } = json.result.info;
                const videoUrl = json.result.url;

                await conn.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `*${e1} TÍTULO:* ${title}\n*⌛ DURACIÓN:* ${duration}\n*📦 PESO:* ${size}\n\n> ${config.botName} | Developed by Félix`,
                    fileName: `${title}.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m });

            } catch (error) {
                m.reply(`*${e1} Error:* No se pudo procesar el enlace. Verifica la URL.`);
            }
        }

        // 2. LÓGICA DE BÚSQUEDA (#yt o #ytsearch)
        if (command === 'yt' || command === 'ytsearch') {
            if (!text) {
                return await conn.sendMessage(from, { 
                    text: `*${e2} ${config.bienvenidas.bienvenida2}*\n\n> Ingresa el nombre del video que deseas buscar en YouTube.`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - SEARCH',
                            body: 'Error: Falta Texto',
                            thumbnailUrl: config.visuals.img1,
                            sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });
            }

            try {
                const res = await fetch(`https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`);
                const json = await res.json();
                if (!json.status || !json.result.length) throw 'Sin resultados';

                ytSearchDB[from] = json.result.map(v => v.link);

                let txt = `*${e2} ${config.bienvenidas.bienvenida2}*\n\n*🔍 RESULTADOS DE:* ${text.toUpperCase()}\n${config.visuals.line.repeat(20)}\n\n`;
                
                json.result.slice(0, 10).forEach((v, i) => {
                    txt += `*#${i + 1}* - ${v.title}\n*⌛:* ${v.duration}\n\n`;
                });
                
                txt += `${config.visuals.line.repeat(20)}\n*${e1} Responde a este mensaje con el número del video para descargarlo.*`;

                await conn.sendMessage(from, { 
                    image: { url: config.visuals.img2 }, // Imagen grande configurada
                    caption: txt,
                    contextInfo: {
                        externalAdReply: {
                            title: 'YOUTUBE SEARCH RESULTS',
                            body: `Resultados para: ${text}`,
                            thumbnailUrl: config.visuals.img1,
                            mediaType: 1,
                            renderLargerThumbnail: true, // Para la búsqueda sí usamos imagen grande
                            showAdAttribution: false
                        }
                    }
                }, { quoted: m });

            } catch (error) {
                m.reply(`*${e1} Error:* No se encontraron resultados.`);
            }
        }
    }
};

// Exportamos el before para detectar la respuesta al menú de búsqueda
export const before = async (conn, m) => {
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text.includes('RESULTADOS DE:')) return;

    const from = m.key.remoteJid;
    const chatData = ytSearchDB[from];
    if (!chatData) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= chatData.length) return;

    const link = chatData[index];
    const prefix = config.prefix;

    // Ejecutamos la descarga del link seleccionado
    await ytCommand.run(conn, m, { text: link, command: 'ytmp4', prefix });
};

export default ytCommand;