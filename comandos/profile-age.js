import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = path.resolve('./config/database/profile/birthdays.json');

const ageSystem = {
    name: 'setage',
    alias: ['delage', 'edad', 'borraredad'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const cmd = m.body.toLowerCase();
            
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (cmd.includes('delage') || cmd.includes('borraredad')) {
                if (!db[user]) return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay edad registrada.\n\n> ¡La edad es solo un número!`);
                delete db[user];
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return m.reply(`*${config.visuals.emoji3} \`EDAD PURGADA\` ${config.visuals.emoji3}*\n\nEdad eliminada del registro.\n\n> ¡Vuelve a ser joven eternamente!`);
            }

            if (!args[0]) return m.reply(`*${config.visuals.emoji2} \`FALTAN DATOS\` ${config.visuals.emoji2}*\n\nDebes ingresar un número.\n\n> Ejemplo: #setage 22`);

            const age = parseInt(args[0]);
            if (isNaN(age)) return m.reply(`*${config.visuals.emoji2} \`VALOR INVÁLIDO\` ${config.visuals.emoji2}*\n\nIngresa números válidos.`);

            if (age < 8 || age > 85) return m.reply(`*${config.visuals.emoji2} \`RANGO EXCEDIDO\` ${config.visuals.emoji2}*\n\nSolo de 8 a 85 años.\n\n> ¡Estándar biológico Kazuma!`);

            const estimatedYear = 2026 - age;
            db[user] = { birth: `01/01/${estimatedYear}`, age: age };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`*${config.visuals.emoji3} \`EDAD REGISTRADA\` ${config.visuals.emoji3}*\n\nEdad: *${age} años*\n\n> ¡Tu perfil ha sido actualizado!`);

        } catch (e) {
            m.reply('✘ Error al procesar la edad.');
        }
    }
};

export default ageSystem;
