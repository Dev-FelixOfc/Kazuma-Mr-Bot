import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const invPath = path.resolve('./config/database/economy/inventory.json');

const inventoryCommand = {
    name: 'inventario',
    alias: ['inv', 'mochila', 'bag'],
    category: 'rpg',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            
            if (!fs.existsSync(invPath)) {
                return m.reply(`*${config.visuals.emoji2}* Tu mochila está completamente vacía.`);
            }

            const invDb = await fs.readJson(invPath);
            const userInv = invDb[user];

            if (!userInv || Object.keys(userInv).length === 0) {
                return m.reply(`*${config.visuals.emoji2}* Tu mochila está completamente vacía.`);
            }

            // Mapeo de IDs a nombres legibles y emojis
            const itemMap = {
                iman: { nombre: "Imán de Minas", emoji: "🧲" },
                trebol: { nombre: "Trébol de la Suerte", emoji: "🍀" },
                escudo: { nombre: "Escudo de Mazmorra", emoji: "🛡️" },
                amuleto: { nombre: "Amuleto del Apostador", emoji: "🧧" }
            };

            let inventoryText = `*${config.visuals.emoji3}* \`MOCHILA DE AVENTURERO\` *${config.visuals.emoji3}*\n\n`;
            let hasItems = false;

            for (const [id, cantidad] of Object.entries(userInv)) {
                if (cantidad > 0 && itemMap[id]) {
                    hasItems = true;
                    inventoryText += `${itemMap[id].emoji} *${itemMap[id].nombre}*\n`;
                    inventoryText += `> *Cantidad:* ${cantidad}\n\n`;
                }
            }

            if (!hasItems) {
                return m.reply(`*${config.visuals.emoji2}* No tienes objetos consumibles en tu mochila.`);
            }

            inventoryText += `_Puedes adquirir más ítems usando el comando #tienda_`;

            await conn.sendMessage(m.chat, { 
                image: { url: 'https://upload.yotsuba.giize.com/u/JXwecTzS.jpeg' }, 
                caption: inventoryText 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un error al abrir tu inventario.`);
        }
    }
};

export default inventoryCommand;