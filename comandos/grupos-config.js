import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['detect', 'antilink'], 
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;
        let feature = '';
        let action = '';

        if (commandName === 'config') {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } 
        else if (commandName === 'detect') {
            feature = 'detect';
            action = args[0]?.toLowerCase();
        }
        else if (commandName === 'antilink') {
            feature = 'antilink';
            action = args[0]?.toLowerCase();
        }

        const validFeatures = ['detect', 'antilink'];
        if (!validFeatures.includes(feature)) {
            return m.reply(`*❁* \`Opción Inválida\` *❁*\n\nUsa:\n*✿︎* \`${usedPrefix}detect on/off\`\n*✿︎* \`${usedPrefix}antilink on/off\``);
        }

        if (!action || !['on', 'off'].includes(action)) {
            return m.reply(`*❁* \`Falta Estado\` *❁*\n\nEspecifica si quieres activar o desactivar *${feature}*.\n\n> Ejemplo: *${usedPrefix}${feature} on*`);
        }

        const enabled = (action === 'on');

        try {
            if (!fs.existsSync(path.resolve('./jsons'))) {
                fs.mkdirSync(path.resolve('./jsons'), { recursive: true });
            }

            let db = {};
            if (fs.existsSync(databasePath)) {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            }

            if (!db[from]) db[from] = { detect: true, antilink: true };
            
            db[from][feature] = enabled;

            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

            const statusText = enabled ? 'Activada' : 'Desactivada';
            await conn.sendMessage(from, { 
                text: `*✿︎* \`Ajuste de Grupo\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ha sido *${statusText}*.\n\n> ¡No uses esto de manera abusiva!` 
            }, { quoted: m });

        } catch (err) {
            console.error('Error en Config:', err);
            m.reply('❌ Error al guardar en el archivo JSON.');
        }
    }
};

export default configOnOff;