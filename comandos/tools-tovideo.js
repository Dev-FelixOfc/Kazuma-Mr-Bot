import { config } from '../config.js';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

const toGifCommand = {
    name: 'togif',
    alias: ['tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            if (!/webp/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* Responde a un sticker animado.`);
            }

            let img = await q.download();
            if (!img) return m.reply(`*${config.visuals.emoji2}* Error al descargar.`);

            await m.reply(`*${config.visuals.emoji3}* Convirtiendo sticker animado...`);

            const filename = `${Date.now()}`;
            const tempWebp = join(tmpdir(), `${filename}.webp`);
            const tempMp4 = join(tmpdir(), `${filename}.mp4`);

            await writeFile(tempWebp, img);

            // Comando optimizado para stickers animados con transparencia
            // -vsync 0 evita errores de frames faltantes
            // -vf "format=yuv420p" asegura que WhatsApp lo lea
            const ffmpegCmd = `ffmpeg -v error -i ${tempWebp} -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p" -c:v libx264 -preset ultrafast -crf 20 -an -vsync 0 ${tempMp4}`;

            try {
                await execPromise(ffmpegCmd);
                
                const videoBuffer = await readFile(tempMp4);

                await conn.sendMessage(m.chat, { 
                    video: videoBuffer, 
                    caption: `*${config.visuals.emoji}* ¡Listo!`,
                    gifPlayback: true 
                }, { quoted: m });

            } catch (ffmpegErr) {
                console.error('Error de FFmpeg:', ffmpegErr);
                m.reply(`*${config.visuals.emoji2}* Error técnico: Asegúrate de tener **FFmpeg** instalado en tu servidor.`);
            } finally {
                // Borrar archivos siempre, incluso si falla
                await unlink(tempWebp).catch(() => {});
                await unlink(tempMp4).catch(() => {});
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error inesperado.`);
        }
    }
};

export default toGifCommand;
