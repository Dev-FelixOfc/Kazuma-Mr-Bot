import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');

const delGenreCommand = {
    name: 'delgenre',
    alias: ['borrargenero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));

            if (!genres[user]) {
                return m.reply(`*${config.visuals.emoji2}* No tienes ningún género establecido.`);
            }

            delete genres[user];
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));

            m.reply(`*${config.visuals.emoji3}* Tu género ha sido eliminado. Recuerda que para casarte o permanecer en regla deberás establecer uno nuevo.`);

        } catch (e) {
            m.reply('Error al eliminar el género.');
        }
    }
};

export default delGenreCommand;