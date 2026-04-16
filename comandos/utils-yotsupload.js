/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        // 1. DETECCIÓN MEJORADA DE MULTIMEDIA
        // Buscamos el mensaje real, ya sea el actual o al que estás respondiendo
        const quoted = m.quoted ? m.quoted : m;
        
        // Esta línea es la clave para que no te diga "Falta Archivo"
        const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';

        if (!/image|video|webp/.test(mime)) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nResponde a una imagen o video corto para convertirlo en enlace.\n\n> Ejemplo: Envía una imagen y pon *${usedPrefix}${commandName}*`);
        }

        try {
            // 2. PRIMER AVISO
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            // 3. DESCARGA Y PREPARACIÓN (Igual a la lógica del scraper de tu amigo)
            const media = await quoted.download();
            const formData = new FormData();
            
            // Usamos el campo 'file' que es el que espera tu servidor según la foto del código
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1]}`,
                contentType: mime 
            });

            // 4. SOLICITUD A TU HOSTING
            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            const data = await res.json();

            // 5. VERIFICACIÓN DE RESPUESTA
            if (!res.ok || (!data.fileUrl && !data.url)) {
                return m.reply('*❁* `Error en Servidor` *❁*\n\nTu API no devolvió un enlace. Verifica que PM2 no tenga errores en el host.');
            }

            const finalUrl = data.fileUrl || data.url;

            // 6. MENSAJE FINAL (Estética Félix OFC)
            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply('*❁* \`Error Crítico\` *❁*\n\nNo se pudo conectar con el servidor. Revisa si el host está activo.');
        }
    }
};

export default yotsubaUploadCommand;