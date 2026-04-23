import fetch from 'node-fetch';

const tiktokCommand = {
    name: 'tt',
    alias: ['tiktok', 'ttdl', 'playtt'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta búsqueda o enlace\` *❁*\n\nIngresa un nombre de usuario, descripción o enlace de TikTok.`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/tiktok.com/gi);
        
        try {
            await m.reply(`*✿︎* \`Procesando TikTok\` *✿︎*\n\nKazuma está buscando el contenido solicitado...`);

            let videoData;

            if (isUrl) {
                const res = await fetch(`https://nex-magical.vercel.app/download/tiktok?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
                const json = await res.json();
                if (!json.status) throw new Error('Link inválido');
                videoData = json.result.data;
            } else {
                const res = await fetch(`https://nex-magical.vercel.app/search/tiktok?q=${encodeURIComponent(text)}&apikey=${apiKey}`);
                const json = await res.json();
                if (!json.status || !json.result.length) return m.reply('*❁* `Sin resultados` *❁*');
                videoData = json.result[0];
            }

            const infoText = `*» (❍ᴥ❍ʋ) \`TIKTOK DOWNLOAD\` «*
*✿︎ Usuario:* \`${videoData.author.nickname || videoData.author.unique_id}\`
*✿︎ Descripción:* \`${videoData.title || 'Sin descripción'}\`

> Enviando video...`;

            await conn.sendMessage(m.key.remoteJid, { image: { url: videoData.cover || videoData.origin_cover }, caption: infoText }, { quoted: m });

            const finalVideo = videoData.hdplay || videoData.play;

            await conn.sendMessage(m.key.remoteJid, { 
                video: { url: finalVideo }, 
                caption: `*✿︎* \`${videoData.title || 'TikTok Video'}\`\n\n> By Kazuma-Mr-Bot`,
                mimetype: 'video/mp4',
                fileName: `tiktok.mp4`
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            m.reply('*❁* `Error` *❁*\n\nNo se pudo obtener el video en este momento.');
        }
    }
};

export default tiktokCommand;