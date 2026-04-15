/* KAZUMA MISTER BOT - CONFIGURACIÓN DE GRUPO */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['on', 'off', 'detect', 'antilink'],
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;
        
        // Mapeo dinámico: si usa #antilink, la función es antilink. Si usa #config, es el primer arg.
        const feature = (commandName === 'config') ? args[0]?.toLowerCase() : 
                        (commandName === 'antilink') ? 'antilink' : 'detect';
        
        const action = (commandName === 'config') ? args[1]?.toLowerCase() : args[0]?.toLowerCase();

        const validFeatures = ['detect', 'antilink'];

        if (!validFeatures.includes(feature)) {
            return m.reply(`*❁* \`Error de Función\` *❁*\n\nFunciones disponibles: \`${validFeatures.join(', ')}\`\n\n> Ejemplo: *${usedPrefix}antilink on*`);
        }

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return m.reply(`*❁* \`Estado Faltante\` *❁*\n\n¿Qué quieres hacer con *${feature}*?\n\n*✿︎ Opciones:* \`on / off\``);
        }

        const enabled = ['on', 'enable'].includes(action);

        if (!fs.existsSync(path.resolve('./jsons'))) fs.mkdirSync(path.resolve('./jsons'));
        let db = fs.existsSync(databasePath) ? JSON.parse(fs.readFileSync(databasePath, 'utf-8')) : {};
        
        if (!db[from]) db[from] = {};
        db[from][feature] = enabled;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Ajuste Aplicado\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ha sido **${enabled ? 'ACTIVADA'}**.\n\n> ¡Kazuma ahora protegerá el grupo contra ${feature === 'antilink' ? 'enlaces externos' : 'cambios de admin'}!` 
        }, { quoted: m });
    }
};

export default configOnOff;