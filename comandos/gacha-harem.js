import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');

const haremCommand = {
    name: 'harem',
    alias: ['inventario', 'mis-pjs'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            // 1. Determinar de quién es el harem
            let targetJid = m.sender; // Por defecto el que usa el comando
            
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetId = targetJid.split('@')[0].split(':')[0];
            const isMe = targetJid === m.sender;

            // 2. Leer base de datos de gacha
            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            // 3. Filtrar personajes que pertenecen al usuario
            let misPjs = [];
            for (let id in gachaDB) {
                if (gachaDB[id].owner === targetId) {
                    misPjs.push(gachaDB[id]);
                }
            }

            // 4. Si no tiene personajes
            if (misPjs.length === 0) {
                if (isMe) {
                    return m.reply(`*${config.visuals.emoji2}* Aún no tienes personajes reclamados en tu inventario.\n\n> ¡Usa el comando #rw y luego #c para conseguir personajes épicos!`);
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `*${config.visuals.emoji2}* El usuario @${targetId} no tiene personajes reclamados.\n\n> ¡Se recomienda el comando #rw para conseguir!`,
                        mentions: [targetJid]
                    }, { quoted: m });
                }
            }

            // 5. Ordenar por valor (Mayor a Menor)
            misPjs.sort((a, b) => b.value - a.value);

            // 6. Construir el mensaje
            let txt = `*${config.visuals.emoji3} \`HAREM DEL USUARIO\` ${config.visuals.emoji3}*\n`;
            txt += `» @${targetId}\n\n`;

            misPjs.forEach((pj) => {
                txt += `› ${pj.name}\n`;
            });

            txt += `\n> ¡Sigue reclamando más personajes para que seas el que más tiene!`;

            // 7. Enviar
            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al mostrar el harem.`);
        }
    }
};

export default haremCommand;