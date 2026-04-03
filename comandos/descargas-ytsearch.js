/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

let ytSearchDB = {};

const ytSearchCommand = {
    name: 'ytsearch',
    alias: ['yt', 'yts', 'buscar'],
    category: 'downloads',
    run: async (conn, m, { text }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const apiKey = "api-Bb1JX"; 

        if (!text) return m.reply(`*${e1} Ingresa el nombre del video a buscar.*`);

        try {
            // 1. Mensaje de estado inicial
            await m.reply(`*🔍 Buscando resultados para:* ${text}...`);

            // 2. Solicitud a la API Stellar
            const res = await fetch(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=${apiKey}`);
            const json = await res.json();

            if (!json.status || !json.result || json.result.length === 0) {
                return m.reply(`*${e1} Error:* No se encontraron resultados.`);
            }

            const results = json.result.slice(0, 10);
            ytSearchDB[from] = results.map(v => v.url);

            // 3. Preparar el texto de la lista
            let txt = `*✅ Se encontraron ${results.length} resultados*\n\n`;
            results.forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title}\n*⌛:* ${v.duration} | *👤:* ${v.autor}\n\n`;
            });
            txt += `*${e1} Responde con un número para descargar.*`;

            // 4. Enviar la miniatura del PRIMER resultado como foto normal
            // Usamos la URL del banner del primer video encontrado
            const firstVideoThumb = results[0].banner;

            await conn.sendMessage(from, { 
                image: { url: firstVideoThumb }, 
                caption: txt 
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`*${e1} Error:* Fallo en la conexión con la API.`);
        }
    }
};

export const before = async (conn, m) => {
    if (!m.quoted || !m.quoted.fromMe || !m.text || isNaN(m.text)) return;
    if (!m.quoted.text || !m.quoted.text.includes('Se encontraron')) return;

    const from = m.key.remoteJid;
    const chatData = ytSearchDB[from];
    if (!chatData) return;

    const index = parseInt(m.text.trim()) - 1;
    if (index < 0 || index >= chatData.length) return;

    const link = chatData[index];
    
    // Importamos dinámicamente tu comando de descarga de video
    const { default: videoCmd } = await import('./descargas-ytvideo.js');
    await videoCmd.run(conn, m, { text: link, command: 'ytmp4' });
};

export default ytSearchCommand;
