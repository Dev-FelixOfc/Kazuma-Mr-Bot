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
            return m.reply(`*${config.visuals.emoji2}* \`Formato Inválido\`\n\nUsa un enlace válido de canal.`);
        }

        const link = linkMatch[0];

        try {
            const response = await fetch(link);
            const html = await response.text();

            // Buscamos el nombre del canal
            const nameMatch = html.match(/<title>(.*?)<\/title>/);
            let name = nameMatch ? nameMatch[1].replace('WhatsApp Channel', '').trim() : 'No encontrado';

            // Buscamos la cantidad de seguidores en la metadata
            const subsMatch = html.match(/([\d.,KMB]+)\sfollowers/i) || html.match(/([\d.,KMB]+)\sseguidores/i);
            let followers = subsMatch ? subsMatch[1] : 'Oculto o no detectado';

            // Buscamos la imagen de perfil del canal
            const imgMatch = html.match(/property="og:image" content="(.*?)"/);
            let profileImg = imgMatch ? imgMatch[1] : null;

            let info = `📊 \`INFO DESDE LA WEB\` 📊\n\n`;
            info += `📝 *Nombre:* ${name}\n`;
            info += `👥 *Seguidores:* ${followers}\n`;
            info += `🔗 *Link:* ${link}\n\n`;
            info += `> *Nota:* Info obtenida vía scraping para evitar errores de servidor.`;

            if (profileImg) {
                await conn.sendMessage(m.chat, { image: { url: profileImg }, caption: info }, { quoted: m });
            } else {
                await m.reply(info);
            }

        } catch (err) {
            console.error(err);
            m.reply(`*${config.visuals.emoji2}* \`Error de Red\`\n\nNo pude acceder a la web de WhatsApp.`);
        }
    }
};

export default rcanalCommand;