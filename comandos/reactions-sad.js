import { config } from '../config.js';

const sadCommand = {
    name: 'sad',
    alias: ['triste', 'llorar'],
    category: 'reactions',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const reactionVideos = [
                'https://pin.it/2gzLaOAJ0',
                'https://pin.it/5HZ0ARFBO',
                'https://pin.it/1yBLEkDoo',
                'https://pin.it/20As0fGKc',
                'https://pin.it/6lXnC8Yw0',
                'https://pin.it/5yXwczHaA',
                'https://pin.it/25N43ou3G'
            ];

            const videoRandom = reactionVideos[Math.floor(Math.random() * reactionVideos.length)];

            let self = m.sender;
            let target = null;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                target = m.quoted.sender;
            }

            let texto = "";
            let mentions = [self];

            if (target && target !== self) {
                mentions.push(target);
                texto = `*${config.visuals.emoji3}* @${self.split('@')[0]} está triste porque @${target.split('@')[0]} le hizo algo... *${config.visuals.emoji2}*`;
            } else {
                texto = `*${config.visuals.emoji3}* @${self.split('@')[0]} se encuentra muy triste. *${config.visuals.emoji2}*`;
            }

            await conn.sendMessage(m.chat, { 
                video: { url: videoRandom }, 
                caption: texto,
                mimetype: 'video/mp4',
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al enviar la reacción.`);
        }
    }
};

export default sadCommand;