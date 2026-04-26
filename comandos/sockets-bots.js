import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots', 'lista'],
    category: 'sockets',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const mainSessionPath = path.resolve('./sesion_bot');
            const subSessionsPath = path.resolve('./sesiones_subbots');
            
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id.split('@')[0]);

            let mainBotNumber = '';
            let totalSubs = 0;
            let subBotsList = '';
            let mainBotLine = '';
            let mentions = [];

            // 1. DETECTAR QUIÉN ES EL PRINCIPAL DESDE LOS ARCHIVOS
            if (await fs.pathExists(mainSessionPath)) {
                const files = await fs.readdir(mainSessionPath);
                const credsFile = files.find(f => f === 'creds.json');
                if (credsFile) {
                    const creds = await fs.readJson(path.join(mainSessionPath, 'creds.json'));
                    mainBotNumber = creds.me.id.split(':')[0];
                }
            }

            // Si el principal está en el grupo, lo listamos con el nombre del config
            if (mainBotNumber && participants.includes(mainBotNumber)) {
                mainBotLine = `  ➪ *[Principal ${config.botName}]* » @${mainBotNumber}\n`;
                mentions.push(`${mainBotNumber}@s.whatsapp.net`);
            }

            // 2. DETECTAR SUBS EN EL GRUPO
            if (await fs.pathExists(subSessionsPath)) {
                const folders = await fs.readdir(subSessionsPath);

                for (const folder of folders) {
                    const fullPath = path.join(subSessionsPath, folder);
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    
                    // Solo si está en el grupo y NO es el principal detectado arriba
                    if (num && num !== mainBotNumber && participants.includes(num)) {
                        let subName = config.botName; 
                        const subSettingsPath = path.join(fullPath, 'settings.json');

                        if (await fs.pathExists(subSettingsPath)) {
                            try {
                                const subData = await fs.readJson(subSettingsPath);
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

            // 3. CONSTRUCCIÓN DEL MENSAJE
            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            const stats = `\n\n*❁ Principal » ${mainBotLine ? '1' : '0'}*\n*❀ Subs en este grupo » ${totalSubs}*\n\n*❀ EN ESTE GRUPO:*`;
            
            const textoFinal = `${header}${stats}\n${mainBotLine}${subBotsList}\n\n> ¡Sistemas operativos y estables en esta comunidad!`;

            if (!mainBotLine && !subBotsList) {
                return m.reply(`*${config.visuals.emoji2}* No hay sockets de mi sistema en este grupo.`);
            }

            await conn.sendMessage(m.chat, { 
                text: textoFinal.trim(),
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error('Error en comando sockets:', e);
            m.reply(`*${config.visuals.emoji2}* Error al filtrar los sockets.`);
        }
    }
};