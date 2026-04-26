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

            // 1. Lógica para el Bot Principal
            let mainName = config.botName;
            const mainSettingsPath = path.resolve(`./sesiones_subbots/${mainBotNumber}/settings.json`);
            
            if (await fs.pathExists(mainSettingsPath)) {
                const mainData = await fs.readJson(mainSettingsPath);
                // Prioridad: Nombre Corto > Nombre Largo > Config
                mainName = mainData.shortName || mainData.longName || config.botName;
            }
            mentions.push(`${mainBotNumber}@s.whatsapp.net`);
            
            let mainLine = `  ➪ *[Principal ${mainName}]* » @${mainBotNumber}`;

            // 2. Lógica para los Sub-Bots
            if (await fs.pathExists(sessionsPath)) {
                const folders = (await fs.readdir(sessionsPath));

                for (const folder of folders) {
                    const fullPath = path.join(sessionsPath, folder);
                    const isDirectory = (await fs.stat(fullPath)).isDirectory();
                    
                    if (!isDirectory || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    
                    if (num && num !== mainBotNumber) {
                        let subName = 'Sub-Bot';
                        const subSettingsPath = path.join(fullPath, 'settings.json');

                        if (await fs.pathExists(subSettingsPath)) {
                            try {
                                const subData = await fs.readJson(subSettingsPath);
                                subName = subData.shortName || subData.longName || 'Sub-Bot';
                            } catch (e) {
                                subName = 'Sub-Bot'; 
                            }
                        }

                        subBotsList += `  ➪ *[Sub-Bot ${subName}]* » @${num}\n`;
                        mentions.push(`${num}@s.whatsapp.net`);
                        totalSubs++;
                    }
                }
            }

            // 3. Construcción del Mensaje Final
            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            const stats = `\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ DETALLE:*`;
            
            const textoFinal = `${header}${stats}\n${mainLine}\n${subBotsList}\n\n> ¡Sistemas operativos y estables!`;

            await conn.sendMessage(m.chat, { 
                text: textoFinal.trim(),
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error('Error en comando sockets:', e);
            // No reply aquí para evitar spam si falla algo interno, o un reply simple:
            m.reply(`*${config.visuals.emoji2}* Error al listar los sockets.`);
        }
    }
};