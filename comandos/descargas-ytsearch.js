/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import fetch from 'node-fetch';
import { config } from '../config.js';

if (!global.ytSearchDB) global.ytSearchDB = {};

const ytSearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'yts', 'buscar'],
    category: 'downloader',
    run: async (conn, m, { text }) => {
        const from = m.chat;
        const e1 = config.visuals.emoji;

        if (!text) return m.reply('《✧》Ingresa el nombre del video a buscar.');

        try {
            // 1. Solicitud a la API Stellar
            const res = await fetch(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=api-Bb1JX`);
            const json = await res.json();

            if (!json.status || !json.result || json.result.length === 0) {
                return m.reply('《✧》 Sin resultados.');
            }

            const results = json.result.slice(0, 10);
            global.ytSearchDB[from] = results.map(v => v.url);

            // 2. Texto de la lista
            let txt = `➩ *RESULTADOS DE:* ${text.toUpperCase()}\n\n`;
            results.forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title}\n> ⴵ Duración › ${v.duration}\n> ❖ Canal › ${v.autor}\n\n`;
            });
            txt += `《✧》 *Responde con un número para descargar en MP3.*`;

            // 3. Miniatura del primer resultado como FOTO REAL
            await conn.sendMessage(from, { 
                image: { url: results[0].banner }, 
                caption: txt 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply('《✧》 Error al conectar con el buscador.');
        }
    }
};

export const before = async (conn, m) => {
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('RESULTADOS DE:')) return;

    const from = m.chat;
    const links = global.ytSearchDB[from];
    if (!links) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= links.length) return;

    const selectedLink = links[index];

    try {
        await m.reply('*《✧》 Descargando audio (MP3)...*');
        
        // Descarga usando Stellar en formato MP3
        const res = await fetch(`https://api.stellarwa.xyz/dl/ytdl?url=${encodeURIComponent(selectedLink)}&format=mp3&key=api-Bb1JX`);
        const data = await res.json();

        // Extractor basado en la respuesta de Stellar
        const dlLink = data.result?.download || data.data?.dl;
        
        if (!dlLink) return m.reply('《✧》 Error: No se pudo generar el link de descarga.');

        const audioBuffer = await fetch(dlLink).then(r => r.buffer());

        await conn.sendMessage(from, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            fileName: `audio.mp3` 
        }, { quoted: m });

    } catch (e) {
        m.reply('《✧》 Error al procesar el audio.');
    }
};

export default ytSearchCommand;
