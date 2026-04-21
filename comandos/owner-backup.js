import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const backupCommand = {
    name: 'backup',
    alias: ['test', 'backup'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* \`Error\`\nSin base de datos.`);
            }

            const dbContent = fs.readFileSync(dbPath, 'utf-8');
            const texto = `*${config.visuals.emoji3}* \`BACKUP ECONOMÍA\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Archivo:* economy.json\n\n\`\`\`${dbContent}\`\`\``;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el backup.`);
        }
    }
};

export default backupCommand;
