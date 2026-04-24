import { config } from '../config.js';

const testWelcome = {
    name: 'testwelcome',
    category: 'admins',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        const user = m.sender;
        let txt = `*${config.visuals.emoji3} \`WELCOME USER\` ${config.visuals.emoji3}*\n`;
        txt += `› @${user.split('@')[0]}\n\n`;
        txt += `» ¡Un nuevo alma se ha unido a nuestra travesía! Esperamos que tu estancia en este sector sea legendaria y llena de gloria.\n\n`;
        txt += `> ${config.visuals.emoji} Usa el comando #help para ver mi lista de comandos.\n`;
        txt += `> *${config.visuals.emoji4}* kazuma.giize.com`;

        await conn.sendMessage(m.chat, {
            image: { url: config.img1 },
            caption: txt,
            mentions: [user]
        }, { quoted: m });
    }
};

export default testWelcome;