import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const resetCommand = {
    name: 'borrar',
    alias: ['resetdb', 'clearout'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const initialData = {
                "573508941325": {
                    "wallet": 999999999,
                    "bank": 999999999,
                    "daily": {
                        "lastClaim": 0,
                        "streak": 0
                    },
                    "crime": {
                        "lastUsed": 0
                    }
                }
            };

            fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`LIMPIEZA TOTAL\`\n\nLa base de datos ha sido reseteada. Se eliminaron todos los usuarios duplicados con \`:0\` y el sistema está limpio.\n\n> ¡Ya puedes realizar pruebas con el comando #pay!`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un error al intentar borrar la base de datos.`);
        }
    }
};

export default resetCommand;
