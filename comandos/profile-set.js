import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/profiles.json');

const profileSettings = {
    name: 'profile-set',
    alias: ['setbirth', 'delbirth', 'setgenre', 'delgenre', 'setpjfavorite'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = {};

            const cmd = m.body.split(' ')[0].toLowerCase().replace('#', '');

            if (cmd === 'setbirth') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Indica tu fecha (Ej: 15/05).`);
                db[user].birth = args[0];
                m.reply(`*${config.visuals.emoji3}* Cumpleaños guardado: *${args[0]}*`);
            } else if (cmd === 'delbirth') {
                delete db[user].birth;
                m.reply(`*${config.visuals.emoji3}* Cumpleaños eliminado.`);
            } else if (cmd === 'setgenre') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* Indica tu género.`);
                db[user].genre = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* Género establecido.`);
            } else if (cmd === 'delgenre') {
                delete db[user].genre;
                m.reply(`*${config.visuals.emoji3}* Género eliminado.`);
            } else if (cmd === 'setpjfavorite') {
                if (!args[0]) return m.reply(`*${config.visuals.emoji2}* ¿Cuál es tu personaje favorito?`);
                db[user].favPj = args.join(' ');
                m.reply(`*${config.visuals.emoji3}* Ahora *${db[user].favPj}* es tu favorito.`);
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al guardar ajustes.`);
        }
    }
};

export default profileSettings;
