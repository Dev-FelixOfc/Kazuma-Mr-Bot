import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');

const topPjsCommand = {
    name: 'topchair',
    alias: ['pjetop', 'topwaifu', 'topersonaje'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            let page = 1;
            if (args[0] && !isNaN(args[0])) {
                page = parseInt(args[0]);
            }

            let allPjs = Object.keys(gachaDB).map(id => ({
                id,
                ...gachaDB[id]
            }));

            allPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 10;
            const totalPages = Math.ceil(allPjs.length / itemsPerPage);

            if (page > totalPages || page <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`PÁGINA NO ENCONTRADA\`\n\nSolo existen **${totalPages}** páginas de ranking.`);
            }

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentTop = allPjs.slice(start, end);

            let txt = `*${config.visuals.emoji3} \`RANKING DE PERSONAJES\` ${config.visuals.emoji3}*\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            currentTop.forEach((pj, index) => {
                const ranking = start + index + 1;
                const status = pj.status === 'libre' ? 'Libre' : `@${pj.owner}`;
                txt += `*${ranking}.* ${pj.name}\n`;
                txt += `  > *Valor:* ¥${pj.value.toLocaleString()}\n`;
                txt += `  > *Estado:* ${status}\n\n`;
            });

            const mentions = currentTop
                .filter(pj => pj.status !== 'libre')
                .map(pj => pj.owner + '@s.whatsapp.net');

            txt += `> ¡Usa #rw para intentar conseguir a los mejores!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al generar el top de personajes.`);
        }
    }
};

export default topPjsCommand;