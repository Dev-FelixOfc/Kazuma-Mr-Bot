import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots', 'lista'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const sessionsPath = path.resolve('./sesiones_subbots');
            const mainBotNumber = conn.user.id.split(':')[0];

            let totalSubs = 0;
            let subBotsList = '';
            let mentions = [];

            // --- LÓGICA PARA EL BOT PRINCIPAL ---
            let mainName = config.botName; // Valor por defecto del config
            const mainSettingsPath = path.resolve(`./sesiones_subbots/${mainBotNumber}/settings.json`);
            
            if (await fs.pathExists(mainSettingsPath)) {
                const mainData = await fs.readJson(mainSettingsPath);
                mainName = mainData.shortName || mainData.longName || config.botName;
            }
            mentions.push(`${mainBotNumber}@s.whatsapp.net`);
            let mainLine = `  ➪ *[Principal ${mainName}]* » @${mainBotNumber}`;

            // --- LÓGICA PARA LOS SUB-BOTS ---
            if (await fs.pathExists(sessionsPath)) {
                const folders = await fs.readdir(sessionsPath);

                for (const folder of folders) {
                    const fullPath = path.join(sessionsPath, folder);
                    
                    // Validar que sea carpeta y no sea la del principal ni archivos ocultos
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    
                    if (num && num !== mainBotNumber) {
                        // Todos los sub-bots empiezan con el nombre del config por si no tienen settings.json
                        let subName = config.botName; 
                        const subSettingsPath = path.join(fullPath, 'settings.json');

                        if (await fs.pathExists(subSettingsPath)) {
                            try {
                                const subData = await fs.readJson(subSettingsPath);
                                // Prioridad: Corto > Largo > Config
                                subName = subData.shortName || subData.longName || config.botName;
                            } catch (e) {
                                subName = config.botName; 
                            }
                        }

                        subBotsList += `  ➪ *[Sub-Bot ${subName}]* » @${num}\n`;
                        mentions.push(`${num}@s.whatsapp.net`);
                        totalSubs++;
                    }
                }
            }

            // --- CONSTRUCCIÓN DEL MENSAJE ---
            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            const stats = `\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ DETALLE:*`;
            
            const textoFinal = `${header}${stats}\n${mainLine}\n${subBotsList}\n\n> ¡Sistemas operativos y estables!`;

            await conn.sendMessage(m.chat, { 
                text: textoFinal.trim(),
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error('Error en comando sockets:', e);
            m.reply(`*${config.visuals.emoji2}* Error al listar los sockets.`);
        }
    }
};