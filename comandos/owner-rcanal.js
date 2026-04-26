import fetch from 'node-fetch';
import { config } from '../config.js';

const rcanalCommand = {
    name: 'rcanal',
    alias: ['testcanal', 'infocanal'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/);
        
        if (!linkMatch) {
            return m.reply(`*${config.visuals.emoji2}* Proporciona un enlace válido.`);
        }

        const link = linkMatch[0];

        try {
            const response = await fetch(link);
            const html = await response.text();

            const nameMatch = html.match(/<title>(.*?)<\/title>/);
            let name = nameMatch ? nameMatch[1].replace('WhatsApp Channel', '').trim() : 'No encontrado';

            const subsMatch = html.match(/([\d.,KMB]+)\sfollowers/i) || html.match(/([\d.,KMB]+)\sseguidores/i);
            let followers = subsMatch ? subsMatch[1] : 'Oculto';

            const imgMatch = html.match(/property="og:image" content="(.*?)"/);
            let profileImg = imgMatch ? imgMatch[1] : null;

            let info = `📊 *INFO DEL CANAL*\n\n`;
            info += `📝 *Nombre:* ${name}\n`;
            info += `👥 *Seguidores:* ${followers}\n`;
            info += `🔗 *Link:* ${link}\n`;

            if (profileImg) {
                await conn.sendMessage(m.chat, { image: { url: profileImg }, caption: info }, { quoted: m });
            } else {
                await m.reply(info);
            }

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Error al conectar con la web.`);
        }
    }
};

export default rcanalCommand;
