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

            if (!/webp/.test(mime)) return m.reply(`*${config.visuals.emoji2}* Responde a un sticker animado.`);

            let img = await q.download();
            if (!img) return;

            const filename = `${Date.now()}`;
            const tempWebp = join(tmpdir(), `${filename}.webp`);
            const tempMp4 = join(tmpdir(), `${filename}.mp4`);

            await writeFile(tempWebp, img);

            try {
                await execPromise(`ffmpeg -i ${tempWebp} -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p" -c:v libx264 -preset ultrafast -crf 20 -an -vsync 0 ${tempMp4}`);
                
                const videoBuffer = await readFile(tempMp4);

                await conn.sendMessage(m.chat, { 
                    video: videoBuffer, 
                    gifPlayback: true,
                    caption: `*${config.visuals.emoji}*` 
                }, { quoted: m });

            } catch (ffmpegErr) {
                console.error(ffmpegErr);
                m.reply(`*${config.visuals.emoji2}* Error de conversión. Verifica FFmpeg en el host.`);
            } finally {
                await unlink(tempWebp).catch(() => {});
                await unlink(tempMp4).catch(() => {});
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error interno.`);
        }
    }
};

export default toGifCommand;