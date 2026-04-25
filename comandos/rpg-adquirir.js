import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const invPath = path.resolve('./config/database/economy/inventory.json');

const adquirirCommand = {
    name: 'adquirir',
    alias: ['comprar'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const itemInput = args[0]?.toLowerCase();
            let amount = parseInt(args[1]) || 1; // Si no pone cantidad, por defecto es 1

            if (!itemInput) return m.reply(`*${config.visuals.emoji2}* Indica qué deseas comprar.\nEjemplo: *#adquirir 1 5*`);
            
            if (amount <= 0 || isNaN(amount)) return m.reply(`*${config.visuals.emoji2}* La cantidad debe ser un número válido mayor a 0.`);

            const store = {
                "1": { id: "iman", nombre: "Imán de Minas", precio: 25000 },
                "iman": { id: "iman", nombre: "Imán de Minas", precio: 25000 },
                "2": { id: "trebol", nombre: "Trébol de la Suerte", precio: 40000 },
                "trebol": { id: "trebol", nombre: "Trébol de la Suerte", precio: 40000 },
                "3": { id: "escudo", nombre: "Escudo de Mazmorra", precio: 35000 },
                "escudo": { id: "escudo", nombre: "Escudo de Mazmorra", precio: 35000 },
                "4": { id: "amuleto", nombre: "Amuleto del Apostador", precio: 60000 },
                "amuleto": { id: "amuleto", nombre: "Amuleto del Apostador", precio: 60000 }
            };

            const item = store[itemInput];
            if (!item) return m.reply(`*${config.visuals.emoji2}* Ese artículo no existe en la tienda.`);

            const totalCost = item.precio * amount;

            if (!fs.existsSync(ecoPath)) fs.outputJsonSync(ecoPath, {});
            if (!fs.existsSync(invPath)) fs.outputJsonSync(invPath, {});

            let ecoDb = await fs.readJson(ecoPath);
            let invDb = await fs.readJson(invPath);

            const userData = ecoDb[user] || { wallet: 0, bank: 0 };
            const totalMoney = (userData.wallet || 0) + (userData.bank || 0);

            if (totalMoney < totalCost) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficientes coins para comprar *${amount}x ${item.nombre}*.\nTotal necesario: *¥${totalCost.toLocaleString()}*`);
            }

            // Cobro inteligente: Cartera -> Banco
            let remainingToPay = totalCost;
            if (ecoDb[user].wallet >= remainingToPay) {
                ecoDb[user].wallet -= remainingToPay;
            } else {
                remainingToPay -= ecoDb[user].wallet;
                ecoDb[user].wallet = 0;
                ecoDb[user].bank = (ecoDb[user].bank || 0) - remainingToPay;
            }

            // Actualizar Inventario
            if (!invDb[user]) invDb[user] = { iman: 0, trebol: 0, escudo: 0, amuleto: 0 };
            invDb[user][item.id] = (invDb[user][item.id] || 0) + amount;

            await fs.writeJson(ecoPath, ecoDb, { spaces: 2 });
            await fs.writeJson(invPath, invDb, { spaces: 2 });

            const textoExito = `*${config.visuals.emoji3}* \`ADQUISICIÓN EXITOSA\` *${config.visuals.emoji3}*

Articulo: *${item.nombre}*
📦 *Cantidad:* ${amount}
💰 *Total pagado:* ¥${totalCost.toLocaleString()}
🎒 *Total en inventario:* ${invDb[user][item.id]}

> Los objetos se han guardado en tu mochila.`;

            await m.reply(textoExito);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un error en la transacción.`);
        }
    }
};

export default adquirirCommand;