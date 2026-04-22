import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const paths = {
    economy: path.resolve('./config/database/economy/economy.json'),
    gacha: path.resolve('./config/database/gacha/gacha_list.json')
};

const backupCommand = {
    name: 'backup',
    alias: ['test'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const type = args[0]?.toLowerCase();

            if (!type || !paths[type]) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nDebes especificar la base de datos:\n> #test economy\n> #test gacha`);
            }

            const dbPath = paths[type];

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* \`Error\`\nEl archivo de ${type} no existe.`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');
            const texto = `*${config.visuals.emoji3}* \`BACKUP ${type.toUpperCase()}\` *${config.visuals.emoji3}*\n\n*Archivo:* ${type}.json\n\n\`\`\`${dbContent}\`\`\``;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al obtener el backup.`);
        }
    }
};

export default backupCommand;