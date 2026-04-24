import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');

const delGenre = {
    name: 'delgenre',
    alias: ['borrargenero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(genrePath)) return m.reply(`*${config.visuals.emoji2}* Sin registros.`);
            
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));
            if (!genres[user]) return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo posees un género establecido para borrar.\n\n> ¡Usa #setgenre para registrarte!`);

            delete genres[user];
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));
            m.reply(`*${config.visuals.emoji3} \`GÉNERO PURGADO\` ${config.visuals.emoji3}*\n\nTu identidad ha sido eliminada de la base de datos 🗑️\n\n> ¡Puedes volver a elegir un género cuando gustes!`);
        } catch (e) {
            m.reply('✘ Error al purgar identidad.');
        }
    }
};

export default delGenre;
