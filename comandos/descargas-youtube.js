/* KAZUMA MISTER BOT - YOUTUBE DOWNLOADER 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Enlace\` *❁*\n\nIngresa un enlace de YouTube para procesar.\n\n> Ejemplo: *${usedPrefix}${commandName} https://youtu.be/...*`);

        // Detectar si el usuario quiere audio o video según el comando usado
        const isVideo = ['playvideo', 'ytv', 'play'].includes(commandName);
        const type = isVideo ? 'video' : 'audio';
        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const apiUrl = `https://nex-magical.vercel.app/download/${type}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            // Aviso de espera inicial
            await m.reply(`*✿︎* \`Buscando Contenido\` *✿︎*\n\nKazuma está extrayendo el ${type === 'video' ? 'Video' : 'Audio'} de YouTube. Por favor, espera...\n\n> ⏳ Solicitando a la API...`);

            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data.status || !data.result.url) {
                return m.reply('*❁* `Error de Descarga` *❁*\n\nLa API no pudo procesar este enlace. Asegúrate de que sea un link válido de YouTube.');
            }

            const downloadUrl = data.result.url;
            const thumb = data.result.info.thumbnail;

            // 1. Enviar Info con miniatura
            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*
> ꕥ Contenido obtenido con éxito.

*✿︎ ID:* \`${data.result.videoId}\`
*✿︎ Formato:* \`${data.result.format}\`
*✿︎ Calidad:* \`${data.result.quality}\`

> En unos instantes recibirás tu archivo...`;

            await conn.sendMessage(m.key.remoteJid, { 
                image: { url: thumb }, 
                caption: infoText 
            }, { quoted: m });

            // 2. Enviar el archivo final
            if (isVideo) {
                await conn.sendMessage(m.key.remoteJid, { 
                    video: { url: downloadUrl }, 
                    caption: `*✿︎ Video:* \`${data.result.videoId}\`\n> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4' 
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.key.remoteJid, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${data.result.videoId}.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            console.error('Error en Descargas YT:', err);
            m.reply('*❁* `Error Crítico` *❁*\n\nOcurrió un error al intentar conectar con la API de descargas.');
        }
    }
};

export default youtubeCommand;