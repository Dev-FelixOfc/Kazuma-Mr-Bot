import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execPromise = promisify(exec);

const updateCommand = {
    name: 'update',
    alias: ['actualizar', 'gitpull', 'up'],
    category: 'tools',
    isOwner: false, // Ahora cualquiera puede activarlo
    isGroup: false,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            await conn.sendMessage(from, { react: { text: '⌚', key: m.key } });

            // Ejecutamos git pull
            const { stdout } = await execPromise('git pull');

            // --- Lógica de "Sin Cambios" ---
            if (stdout.includes('Already up to date')) {
                await conn.sendMessage(from, { react: { text: '⏸️', key: m.key } });
                return await conn.sendMessage(from, { 
                    text: '✅ *Sincronización Completa*\n\nEl repositorio de GitHub y el servidor ya están en la misma versión. No hay cambios pendientes.' 
                }, { quoted: m });
            }

            // Si hay cambios, recargamos comandos
            if (global.loadCommands) {
                await global.loadCommands(); 
            }

            await conn.sendMessage(from, { react: { text: '☑️', key: m.key } });

            let updateMsg = `✅ *Actualización realizada exitosamente*\n\n`;
            updateMsg += `*Detalles del Update:* \n`;
            updateMsg += `\`\`\`${stdout}\`\`\``;

            await conn.sendMessage(from, { text: updateMsg }, { quoted: m });

        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(from, { text: `❌ *Error al actualizar:* \n\n${error.message}` }, { quoted: m });
        }
    }
};

export default updateCommand;