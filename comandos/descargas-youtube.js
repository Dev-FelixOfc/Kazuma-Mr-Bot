import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import { config } from '../config.js';

const youtubeCommand = {
    name: 'play',
    alias: ['play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica', 'ytv', 'yta'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* \`Falta Texto o Enlace\` *${config.visuals.emoji2}*\n\nIngresa un nombre o un enlace de YouTube.`);

        try {
            // 1. Búsqueda con yt-search
            const yt_search = await yts(text);
            const video = yt_search.videos[0];
            if (!video) return m.reply(`*${config.visuals.emoji2}* \`Sin Resultados\``);

            const isVideo = ['play2', 'video', 'playdoc2', 'ytv'].includes(commandName);
            const type = isVideo ? 'VIDEO' : 'AUDIO';

            // 2. Mensaje de espera con tus textos y config
            const infoBot = `┏━━━━✿︎ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ${type} ✿︎━━━━╮
┃ ✐ *Título:* \`${video.title}\`
┃ ✐ *Duración:* \`${video.timestamp}\`
┃ ✐ *Estado:* \`Enviando archivo...\`
╰━━━━━━━━━━━━━━━━━━━╯`;

            await conn.sendMessage(m.chat, { 
                image: { url: video.thumbnail }, 
                caption: infoBot 
            }, { quoted: m });

            // 3. Lista de APIs de respaldo (Lógica Fallback)
            const apis = [
                { url: `https://api.siputzx.my.id/api/d/ytmp4?url=${video.url}`, path: 'dl' },
                { url: `https://api.zenkey.my.id/api/download/yt${isVideo ? 'mp4' : 'mp3'}?apikey=zenkey&url=${video.url}`, path: 'result.download.url' },
                { url: `https://api.dorratz.com/v3/ytdl?url=${video.url}`, path: 'medias' }
            ];

            let mediaBuffer = null;
            let success = false;

            for (const api of apis) {
                try {
                    const res = await axios.get(api.url, { timeout: 15000 });
                    let dlUrl = null;

                    // Extracción dinámica según la API
                    if (api.path === 'medias') {
                        dlUrl = res.data.medias?.find(item => item.extension === (isVideo ? 'mp4' : 'mp3'))?.url;
                    } else {
                        // Acceso a propiedades anidadas (result.download.url)
                        dlUrl = api.path.split('.').reduce((obj, key) => obj?.[key], res.data);
                    }

                    if (dlUrl) {
                        const fileRes = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
                        mediaBuffer = Buffer.from(fileRes.data);
                        success = true;
                        break;
                    }
                } catch (e) {
                    console.log(`Fallo en API: ${api.url}`);
                    continue;
                }
            }

            if (!success) throw new Error("Fallback failed");

            // 4. Envío según el comando
            const isDoc = ['play3', 'play4', 'playdoc', 'playdoc2'].includes(commandName);
            const commonOptions = { quoted: m, contextInfo: { mentionedJid: [m.sender] } };

            if (isDoc) {
                await conn.sendMessage(m.chat, { 
                    document: mediaBuffer, 
                    mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
                    fileName: `${video.title}.${isVideo ? 'mp4' : 'mp3'}`,
                    caption: `> Descargado por ${config.botName}`
                }, commonOptions);
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { 
                    video: mediaBuffer, 
                    mimetype: 'video/mp4',
                    caption: `*✿︎ Video:* \`${video.title}\`\n> Descargado por ${config.botName}`
                }, commonOptions);
            } else {
                await conn.sendMessage(m.chat, { 
                    audio: mediaBuffer, 
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, commonOptions);
            }

        } catch (error) {
            console.error(error);
            m.reply(`*${config.visuals.emoji2}* \`Error Crítico\` *${config.visuals.emoji2}*\n\nNo se pudo obtener el archivo de ninguna fuente.`);
        }
    }
};

export default youtubeCommand;