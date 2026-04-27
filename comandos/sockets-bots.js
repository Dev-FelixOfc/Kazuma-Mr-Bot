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
            const moodSessionsPath = path.resolve('./sesiones_moods');
            
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants.map(p => p.id.split('@')[0]);

            let mainBotNumber = '';
            let globalSubs = 0;
            let globalMoods = 1; 
            let localSubs = 0;
            let localMoods = 0;
            
            let subBotsList = '';
            let moodBotsList = '';
            let mainBotLine = '';
            let mentions = [];

            if (await fs.pathExists(mainSessionPath)) {
                const files = await fs.readdir(mainSessionPath);
                if (files.find(f => f === 'creds.json')) {
                    const creds = await fs.readJson(path.join(mainSessionPath, 'creds.json'));
                    mainBotNumber = creds.me.id.split(':')[0].replace(/\D/g, '');
                }
            }

            if (mainBotNumber && participants.includes(mainBotNumber)) {
                mainBotLine = `  ➪ *[Mood ${config.botName}]* » @${mainBotNumber}\n`;
                mentions.push(`${mainBotNumber}@s.whatsapp.net`);
                localMoods++;
            }

            if (await fs.pathExists(moodSessionsPath)) {
                const moodFolders = await fs.readdir(moodSessionsPath);
                for (const folder of moodFolders) {
                    const fullPath = path.join(moodSessionsPath, folder);
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    if (!num) continue;

                    const hasCreds = await fs.pathExists(path.join(fullPath, 'creds.json'));
                    if (hasCreds) {
                        globalMoods++;
                        if (num !== mainBotNumber && participants.includes(num)) {
                            moodBotsList += `  ➪ *[Mood SubMood]* » @${num}\n`;
                            mentions.push(`${num}@s.whatsapp.net`);
                            localMoods++;
                        }
                    }
                }
            }

            if (await fs.pathExists(subSessionsPath)) {
                const folders = await fs.readdir(subSessionsPath);
                for (const folder of folders) {
                    const fullPath = path.join(subSessionsPath, folder);
                    if (!(await fs.stat(fullPath)).isDirectory() || folder.startsWith('.')) continue;

                    const num = folder.replace(/\D/g, '');
                    if (!num) continue;

                    const hasCreds = await fs.pathExists(path.join(fullPath, 'creds.json'));
                    if (hasCreds) globalSubs++;

                    if (num !== mainBotNumber && participants.includes(num)) {
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
                        localSubs++;
                    }
                }
            }

            const header = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*`;
            const totalLocal = localMoods + localSubs;

            const stats = `\n\n*❁ Mood » ${globalMoods}*\n*❀ Subs » ${globalSubs}*\n\n*❀ En este grupo (${totalLocal}):*`;

            const textoFinal = `${header}${stats}\n${mainBotLine}${moodBotsList}${subBotsList}\n\n> ¡Sistemas operativos y estables en esta comunidad!`;

            if (totalLocal === 0) {
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