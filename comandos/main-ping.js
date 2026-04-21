import { config } from '../config.js';
import { contextConfig } from '../config/visuals_context.js';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed'],
    category: 'main',
    run: async (conn, m) => {
        try {
            const start = Date.now();
            const { key } = await m.reply(`*${config.visuals.emoji2}* \`Calculando...\``);
            const latencia = Date.now() - start;

            const texto = `*${config.visuals.emoji3}* \`KAZUMA PING\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Latencia:* ${latencia} ms\n*${config.visuals.emoji} Estado:* Operativo`;

            await conn.sendMessage(m.chat, {
                text: texto,
                contextInfo: {
                    externalAdReply: {
                        title: contextConfig.title,
                        body: contextConfig.body,
                        thumbnailUrl: contextConfig.image,
                        sourceUrl: contextConfig.canal,
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: true // Esto fuerza a que se vea mejor
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { delete: key });

        } catch (err) {
            m.reply(`🚀 Latencia: ${Date.now() - start} ms`);
        }
    }
};

export default pingCommand;
