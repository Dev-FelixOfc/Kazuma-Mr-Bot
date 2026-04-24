import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const haremShop = {
    name: 'haremshop',
    alias: ['gachashop', 'tienda'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!fs.existsSync(shopPath)) return m.reply(`*${config.visuals.emoji2}* No hay personajes en venta.`);

            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
            let items = Object.values(shopDB);

            if (items.length === 0) return m.reply(`*${config.visuals.emoji2}* El mercado está vacío.`);

            let page = args[0] ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            const pageSize = 10;
            const totalPages = Math.ceil(items.length / pageSize);
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const currentItems = items.slice(start, end);

            if (currentItems.length === 0) return m.reply(`*${config.visuals.emoji2}* Página no encontrada.`);

            let txt = `*${config.visuals.emoji3} \`MERCADO DE PERSONAJES\` ${config.visuals.emoji3}*\n`;
            txt += `*Página:* ${page} de ${totalPages}\n\n`;

            currentItems.forEach((item, i) => {
                txt += `*${start + i + 1}.* ${item.name} (\`${item.id}\`)\n`;
                txt += `  ᗒ *Vendedor:* @${item.seller}\n`;
                txt += `  ᗒ *Precio:* ¥${item.salePrice.toLocaleString()}\n\n`;
            });

            txt += `> ¡Para comprar personajes, usa el comando  #buy (ID)!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: currentItems.map(i => i.seller + '@s.whatsapp.net') 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al cargar el mercado.`);
        }
    }
};

export default haremShop;