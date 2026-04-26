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
            const myJid = conn.user.id.split(':')[0].split(':')[0].replace(/\D/g, '');
            const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
            
            if (fs.existsSync(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[m.chat]) {
                    const primaryNumber = db[m.chat].replace(/\D/g, '');
                    if (myJid !== primaryNumber) return;
                }
            }

            const mainSessionPath = path.resolve('./sesion_bot');
            const subSessionsPath = path.resolve('./sesiones_subbots');
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id.split('@')[0]);

            let mainBotNumber = '';
            let totalSubs = 0;
            let subBotsList = '';
            let mainBotLine = '';
            let mentions = [];

            if (await fs.pathExists(mainSessionPath)) {
                const files = await fs.readdir(mainSessionPath);
                const credsFile = files.find(f => f === 'creds.json');
                if (credsFile) {
                    const creds = await fs.readJson(path.join(mainSessionPath, 'creds.json'));
                    mainBotNumber = creds.me.id.split(':')[0].replace(/\D/g, '');
                }
            }

            if (mainBotNumber && participants.includes(mainBotNumber)) {
                mainBotLine = `  ➪ *[Mood ${config.botName}]* » @${mainBotNumber}\n`;
                mentions.push(`${mainBotNumber}@s.whatsapp.net`);
            }

            if (await fs.pathExists(subSessionsPath)) {
                const folders = await fs.readdir(subSessionsPath);

                for (const folder of folders) {
                    const fullPath = path.join(subSessionsPath, folder);
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    
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

                        subBotsList += `  ➪ *[Sub ${subName}]* » @${num}\n`;
                        mentions.push(`${num}@s.whatsapp.net`);
                        totalSubs++;
                    }
                }
            }

            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            const totalMostrados = (mainBotLine ? 1 : 0) + totalSubs;
            const stats = `\n\n*❁ Mood » ${mainBotLine ? '1' : '0'}*\n*❀ Subs en este grupo » ${totalSubs}*\n\n*❀ En este grupo (${totalMostrados}):*`;
            
            const textoFinal = `${header}${stats}\n${mainBotLine}${subBotsList}\n\n> ¡Sistemas operativos y estables en esta comunidad!`;

            if (!mainBotLine && !subBotsList) {
                return m.reply(`*${config.visuals.emoji2}* No hay sockets de mi sistema en este grupo.`);
            }

            await conn.sendMessage(m.chat, { 
                text: textoFinal.trim(),
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al filtrar los sockets.`);
        }
    }
};