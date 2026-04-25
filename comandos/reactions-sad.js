import { config } from '../config.js';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import axios from 'axios';

const execPromise = promisify(exec);

const sadCommand = {
    name: 'sad',
    alias: ['triste', 'llorar'],
    category: 'reactions',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const reactionVideos = [
                'https://v.pin.it/algun_video_directo.mp4', 
                'https://pin.it/2gzLaOAJ0'
            ];

            const videoUrl = reactionVideos[Math.floor(Math.random() * reactionVideos.length)];
            
            let self = m.sender;
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            let texto = target && target !== self 
                ? `*${config.visuals.emoji3}* @${self.split('@')[0]} está triste porque @${target.split('@')[0]} le hizo algo... *${config.visuals.emoji2}*`
                : `*${config.visuals.emoji3}* @${self.split('@')[0]} se encuentra muy triste. *${config.visuals.emoji2}*`;

            // Descarga y procesamiento para evitar el error de reproducción
            const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'utf-8');
            
            const tempInput = join(tmpdir(), `in_${Date.now()}.mp4`);
            const tempOutput = join(tmpdir(), `out_${Date.now()}.mp4`);
            
            await writeFile(tempInput, buffer);

            // -an quita el audio, -vf asegura que sea compatible con celulares
            await execPromise(`ffmpeg -i ${tempInput} -an -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempOutput}`);

            const videoFinal = await readFile(tempOutput);

            await conn.sendMessage(m.chat, { 
                video: videoFinal, 
                caption: texto,
                mimetype: 'video/mp4',
                mentions: [self, ...(target ? [target] : [])]
            }, { quoted: m });

            await unlink(tempInput);
            await unlink(tempOutput);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error: El link de video no es directo o FFmpeg falló.`);
        }
    }
};

export default sadCommand;