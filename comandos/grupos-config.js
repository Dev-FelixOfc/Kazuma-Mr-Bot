import fs from 'fs';
import path from 'path';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['enable', 'disable', 'on', 'off', 'detect'],
    category: 'grupo',
    isOwner: false,
    noPrefix: false, // Se puede usar con prefijo #on o #detect
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;

        // Si el comando fue directo (ej: #detect), la función es 'detect'
        // Si se usó #config detect, la función es el primer argumento
        const feature = (commandName === 'config' || commandName === 'enable' || commandName === 'disable' || commandName === 'on' || commandName === 'off') 
            ? args[0]?.toLowerCase() 
            : commandName;

        // Determinamos la acción (on/off)
        let action = '';
        if (['on', 'enable', 'off', 'disable'].includes(commandName)) {
            action = commandName;
        } else {
            action = args[1]?.toLowerCase() || args[0]?.toLowerCase();
        }

        // Lista de funciones soportadas (iremos ampliando aquí)
        const validFeatures = ['detect']; 
        
        if (!feature || !validFeatures.includes(feature)) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Configuración de Grupo\` *❁*\n\nDebes especificar una función válida para configurar.\n\n*✿︎ Funciones disponibles:* \`${validFeatures.join(', ')}\`\n\n> Ejemplo: *${usedPrefix}${validFeatures[0]} on*` 
            }, { quoted: m });
        }

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Estado Faltante\` *❁*\n\n¿Qué deseas hacer con la función *${feature}*?\n\n*✿︎ Opciones:* \`on / off\`\n\n> Ejemplo: *${usedPrefix}${feature} on*` 
            }, { quoted: m });
        }

        const isEnable = ['on', 'enable'].includes(action);

        // Manejo de Carpeta y JSON
        if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });
        let db = fs.existsSync(databasePath) ? JSON.parse(fs.readFileSync(databasePath, 'utf-8')) : {};

        if (!db[from]) db[from] = {};
        db[from][feature] = isEnable;

        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Ajuste Actualizado\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ha sido **${isEnable ? 'ACTIVADA' : 'DESACTIVADA'}** con éxito.\n\n> ¡El sistema Kazuma ahora está en modo ${isEnable ? 'vigilante' : 'reposo'}!` 
        }, { quoted: m });
    }
};

export default configOnOff;