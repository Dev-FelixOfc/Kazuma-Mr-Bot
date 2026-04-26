import fetch from 'node-fetch';
import yts from 'yt-search';

const youtubeCommand = {
    name: 'play',
    alias: ['play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica', 'ytv', 'yta'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*🤔 ¿Qué estás buscando?*\n*Ingrese el nombre o enlace de la canción*\n\n*Ejemplo:*\n${usedPrefix + commandName} emilia 420`);

        try {
            // 1. Búsqueda
            const yt_search = await yts(text);
            const video = yt_search.videos[0];
            if (!video) return m.reply('*❁* `Sin Resultados` *❁*');

            const tipoDescarga = ['play', 'musica', 'audio', 'yta'].includes(commandName) ? 'audio' : 'video';
            
            // 2. Mensaje de espera (Caption estilo LoliBot pero con tus textos)
            const infoBot = `┏━━━━✿︎ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ✿︎━━━━╮
┃ ✐ *Título:* ${video.title}
┃ ✐ *Duración:* ${video.timestamp}
┃ ✐ *Estado:* Enviando ${tipoDescarga}...
╰━━━━━━━━━━━━━━━━━━━╯`;

            await conn.sendMessage(m.chat, { 
                image: { url: video.thumbnail }, 
                caption: infoBot 
            }, { quoted: m });

            // 3. Lógica de APIs (Fallback)
            // He dejado las APIs que no requieren librerías locales para que te funcione de una
            const isVideo = ['play2', 'video', 'playdoc2', 'ytv'].includes(commandName);
            const downloadType = isVideo ? 'video' : 'audio';

            const apis = [
                `https://api.siputzx.my.id/api/d/ytmp4?url=${video.url}`,
                `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${video.url}`,
                `https://api.dorratz.com/v3/ytdl?url=${video.url}`
            ];

            let mediaBuffer = null;
            let success = false;

            for (const api of apis) {
                try {
                    const res = await fetch(api);
                    const data = await res.json();
                    let dlUrl = data.dl || data.result?.download?.url || data.medias?.find(m => m.extension === (isVideo ? 'mp4' : 'mp3'))?.url;

                    if (dlUrl) {
                        const fileRes = await fetch(dlUrl);
                        if (fileRes.ok) {
                            mediaBuffer = await fileRes.buffer();
                            success = true;
                            break;
                        }
                    }
                } catch (e) {
                    console.log(`Fallo en API: ${api}`);
                    continue;
                }
            }

            if (!success) throw new Error("Todas las APIs fallaron");

            // 4. Envío de archivos (Documento o Multimedia)
            const isDoc = ['play3', 'play4', 'playdoc', 'playdoc2'].includes(commandName);

            if (isDoc) {
                await conn.sendMessage(m.chat, { 
                    document: mediaBuffer, 
                    mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
                    fileName: `${video.title}.${isVideo ? 'mp4' : 'mp3'}`,
                    caption: `> Descargado por Kazuma Mister Bot`
                }, { quoted: m });
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { 
                    video: mediaBuffer, 
                    mimetype: 'video/mp4',
                    caption: `🔰 Título: ${video.title}`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { 
                    audio: mediaBuffer, 
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: m });
            }

        } catch (error) {
            console.error(error);
            m.reply('❌ No se pudo procesar la descarga con ninguna de las APIs disponibles.');
        }
    }
};

export default youtubeCommand;