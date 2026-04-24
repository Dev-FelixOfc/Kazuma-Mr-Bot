import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const delBirth = {
    name: 'delbirth',
    alias: ['borrarcumple'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Sin registros.`);
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay fecha para borrar.`);

            delete db[user];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            m.reply(`*${config.visuals.emoji3} \`REGISTRO PURGADO\` ${config.visuals.emoji3}*\n\nFecha eliminada.\n\n> ¡Has vuelto a ser un ser sin tiempo!`);
        } catch (e) {
            m.reply('✘ Error al purgar cronología.');
        }
    }
};

export default delBirth;