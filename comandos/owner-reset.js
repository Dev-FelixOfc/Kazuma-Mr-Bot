import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const resetCommand = {
    name: 'borrar',
    alias: ['resetdb', 'clearout'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const folder = args[0];
            let file = args[1];

            if (!folder || !file) {
                return m.reply(`*${config.visuals.emoji2} \`PARÁMETROS INCOMPLETOS\` ${config.visuals.emoji2}*\n\nEspecifica carpeta y archivo para resetear.\n\n> Ejemplo: #borrar economy economy`);
            }

            // Limpia la extensión para evitar el error de doble .json
            file = file.replace(/\.json$/i, '');

            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2} \`ARCHIVO NO ENCONTRADO\` ${config.visuals.emoji2}*\n\nLa ruta \`config/database/${folder}/${file}.json\` no existe.`);
            }

            // Estructura inicial (Puedes ajustar esto si reseteas algo que no sea economía)
            const initialData = {
                "573508941325": {
                    "wallet": 999999999,
                    "bank": 999999999,
                    "daily": { "lastClaim": 0, "streak": 0 },
                    "crime": { "lastUsed": 0 }
                }
            };

            // Escribir los datos iniciales en la ruta especificada
            fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`SISTEMA RESETEADO\` *${config.visuals.emoji3}*\n\n*Archivo:* ${file}.json\n*Estado:* Limpio y restaurado.\n\n> ¡El sistema ha sido purgado correctamente!`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error crítico al intentar resetear el archivo.`);
        }
    }
};

export default resetCommand;