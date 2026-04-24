import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');

const setGenreCommand = {
    name: 'setgenre',
    alias: ['genero'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const genre = args[0]?.toLowerCase();

            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));

            if (genres[user]) {
                return m.reply(`*${config.visuals.emoji2}* Ya tienes el género *${genres[user]}* establecido. Para cambiarlo, usa #delgenre.`);
            }

            if (genre !== 'hombre' && genre !== 'mujer') {
                return m.reply(`*${config.visuals.emoji2}* Uso: #setgenre hombre o #setgenre mujer`);
            }

            const nuevoGenero = genre === 'hombre' ? 'Hombre' : 'Mujer';
            genres[user] = nuevoGenero;
            fs.writeFileSync(genrePath, JSON.stringify(genres, null, 2));

            if (casados[user]) {
                const pareja = casados[user];
                const generoPareja = genres[pareja];

                if (generoPareja === nuevoGenero) {
                    delete casados[user];
                    delete casados[pareja];
                    fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));

                    const aviso = `*⚠︎ DIVORCIO AUTOMÁTICO ⚠︎*\n\nSe han detectado géneros iguales en el matrimonio. El matrimonio ha sido anulado.`;
                    
                    await conn.sendMessage(m.sender, { text: aviso });
                    await conn.sendMessage(pareja + '@s.whatsapp.net', { text: aviso });
                    
                    return m.reply(`*${config.visuals.emoji3}* Género establecido, pero debido a conflicto con tu pareja, han sido divorciados.`);
                }
            }

            m.reply(`*${config.visuals.emoji3}* Género establecido como: *${nuevoGenero}*`);

        } catch (e) {
            m.reply('Error al procesar el género.');
        }
    }
};

export default setGenreCommand;