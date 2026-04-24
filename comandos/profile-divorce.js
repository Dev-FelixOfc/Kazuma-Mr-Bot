import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const marryPath = path.resolve('./config/database/profile/casados.json');

const divorce = {
    name: 'divorce',
    alias: ['divorcio', 'separarse'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(marryPath)) return m.reply(`*${config.visuals.emoji2}* Sin registros de vínculos.`);
            
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));
            if (!casados[user]) return m.reply(`*${config.visuals.emoji2}* No existe un vínculo activo.`);

            const pareja = casados[user];
            delete casados[user];
            delete casados[pareja];
            fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*☹︎ DIVORCIO CONFIRMADO ☹︎*\n\n@${user} ha decidido terminar el matrimonio. Ahora ambos están solteros.`, 
                mentions: [m.sender, pareja + '@s.whatsapp.net'] 
            }, { quoted: m });
        } catch (e) {
            m.reply('✘ Error al disolver el vínculo.');
        }
    }
};

export default divorce;