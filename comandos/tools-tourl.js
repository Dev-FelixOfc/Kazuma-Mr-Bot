import { config } from '../config.js';
import { uploadToYotsuba } from '../config/UploadFile.js';

const tourlCommand = {
    name: 'tourl',
    alias: ['url', 'imglink', 'subir'],
    category: 'tools',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        const from = m.key.remoteJid;

        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const msgType = quoted.mtype || quoted.type || '';

        const isMedia = /image|video|sticker/.test(mime) || 
                        /imageMessage|videoMessage|stickerMessage/.test(msgType);

        if (!isMedia) {
            return m.reply(`*❁* \`Sin Multimedia\` *❁*\n\nNo detecto ninguna imagen o archivo.\n\n*✿︎* Responde a una imagen, sticker o video.\n*✿︎* O envía uno con el comando *${usedPrefix}tourl*`);
        }

        try {
            await m.reply('*✿︎* \`Procesando Multimedia...\` *✿︎*\n\n> Generando enlace en Yotsuba Cloud.');

            const media = await quoted.download();

            if (!media) throw new Error('No se pudo descargar el medio.');

            const link = await uploadToYotsuba(media);

            const textoExito = `*✿︎* \`Carga Exitosa\` *✿︎*\n\n*🚀 Enlace:* ${link}\n\n> Enlace generado para tu archivo multimedia.`;

            await conn.sendMessage(from, { 
                text: textoExito,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - TOURURL SERVICE',
                        body: 'Click para ver en el navegador',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: link,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            m.reply('*❁* \`Error en Servidor\` *❁*\n\nNo se pudo procesar la subida.');
        }
    }
};

export default tourlCommand;