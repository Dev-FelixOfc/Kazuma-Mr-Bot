import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const shopPath = path.resolve('./config/database/gacha/gacha_shop.json');

const sellCommand = {
    name: 'sell',
    alias: ['vender'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const pjId = args[0];
            const price = parseInt(args[1]);

            if (!pjId || isNaN(price)) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n• Usa el comando de la siguiente manera:\n> #sell (ID) (Precio)`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            if (!gachaDB[pjId]) return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe. Revisa bien los datos antes de ingresar un id.`);
            
            const pj = gachaDB[pjId];
            if (pj.owner !== user) return m.reply(`*${config.visuals.emoji2}* ¡Este personaje no te pertenece!`);

            const minPrice = pj.value + 1000;
            if (price < minPrice) {
                return m.reply(`*${config.visuals.emoji2}* El precio mínimo de venta es *¥${minPrice.toLocaleString()}*.`);
            }

            if (!fs.existsSync(shopPath)) fs.writeFileSync(shopPath, JSON.stringify({}));
            let shopDB = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));

            shopDB[pjId] = {
                id: pjId,
                name: pj.name,
                seller: user,
                originalValue: pj.value,
                salePrice: price,
                date: Date.now()
            };

            gachaDB[pjId].status = 'en_venta';

            fs.writeFileSync(shopPath, JSON.stringify(shopDB, null, 2));
            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));

            m.reply(`*${config.visuals.emoji3}* Has puesto a *${pj.name}* en el mercado por *¥${price.toLocaleString()}*.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al poner en venta.`);
        }
    }
};

export default sellCommand;