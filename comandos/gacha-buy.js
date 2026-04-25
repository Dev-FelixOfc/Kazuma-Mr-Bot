import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const buyCommand = {
    name: 'buy',
    alias: ['obtener'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const buyer = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje.`);
            if (!fs.existsSync(shopPath)) return m.reply(`*${config.visuals.emoji2}* El mercado está vacío.`);

            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));

            if (!shopDB[pjId]) return m.reply(`*${config.visuals.emoji2}* Ese personaje no está en venta.`);

            const item = shopDB[pjId];
            const seller = item.seller;
            const price = item.salePrice;

            if (buyer === seller) return m.reply(`*${config.visuals.emoji2}* No puedes comprar tu propio personaje.`);
            if (!ecoDB[buyer] || (ecoDB[buyer].wallet || 0) < price) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu cartera (¥${price.toLocaleString()}).`);
            }

            if (!ecoDB[seller]) ecoDB[seller] = { wallet: 0, bank: 0 };

            ecoDB[buyer].wallet -= price;
            ecoDB[seller].wallet += price;

            gachaDB[pjId].owner = buyer;
            gachaDB[pjId].status = 'domado';

            delete shopDB[pjId];

            fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));

            await m.reply(`*${config.visuals.emoji3}* ¡Compra exitosa!\n\nHas adquirido a *${item.name}* por **¥${price.toLocaleString()}**.`);
            
            conn.sendMessage(seller + '@s.whatsapp.net', { 
                text: `*${config.visuals.emoji3}* ¡Tu personaje *${item.name}* ha sido vendido!\nRecibiste **¥${price.toLocaleString()}** en tu cartera.` 
            });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la compra.`);
        }
    }
};

export default buyCommand;