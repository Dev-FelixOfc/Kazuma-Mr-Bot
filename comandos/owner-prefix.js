import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const jsonDir = path.resolve('./jsons');
const prefixPath = path.join(jsonDir, 'prefix.json');

const prefixCommand = {
    name: 'setprefix',
    alias: ['prefix', 'prefijo'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

            const newPrefix = args[0];
            const availablePrefixes = config.allPrefixes || ['#', '!', '.'];

            if (!newPrefix || !availablePrefixes.includes(newPrefix)) {
                return m.reply(`*${config.visuals.emoji2}* \`Prefijo Inválido\`\n\nDebes elegir uno de los permitidos: \`${availablePrefixes.join(' ')}\`\n\n> Ejemplo: #setprefix !`);
            }

            const data = { selected: newPrefix };
            fs.writeFileSync(prefixPath, JSON.stringify(data, null, 2));

            await m.reply(`*${config.visuals.emoji3}* \`PREFIJO ACTUALIZADO\`\n\nAhora el bot solo responderá al prefijo: \`${newPrefix}\` (y comandos sin prefijo).`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al establecer el prefijo.`);
        }
    }
};

export default prefixCommand;
