import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const birthPath = path.resolve('./config/database/profile/birthdays.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

const profileCommand = {
    name: 'profile',
    alias: ['perfil'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const group = m.chat;
            const mentions = [targetJid];

            const genres = fs.existsSync(genrePath) ? JSON.parse(fs.readFileSync(genrePath, 'utf-8')) : {};
            const casados = fs.existsSync(marryPath) ? JSON.parse(fs.readFileSync(marryPath, 'utf-8')) : {};
            const ecoDB = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};
            const gachaDB = fs.existsSync(gachaPath) ? JSON.parse(fs.readFileSync(gachaPath, 'utf-8')) : {};
            const birthDB = fs.existsSync(birthPath) ? JSON.parse(fs.readFileSync(birthPath, 'utf-8')) : {};
            const rpgDB = fs.existsSync(rpgPath) ? JSON.parse(fs.readFileSync(rpgPath, 'utf-8')) : {};

            const genero = genres[user] || 'No definido';
            const pareja = casados[user] ? `@${casados[user]}` : 'Soltero/a';
            const edad = birthDB[user]?.age || 'No definida';
            const cumple = birthDB[user]?.birth || 'No definido';

            if (casados[user]) mentions.push(casados[user] + '@s.whatsapp.net');

            const wallet = Number(ecoDB[user]?.wallet) || 0;
            const bank = Number(ecoDB[user]?.bank) || 0;

            const userPjs = Object.values(gachaDB).filter(pj => pj.owner === user);
            const totalPjs = userPjs.length;

            const userRpg = rpgDB[group]?.[user] || { minerals: {}, rank: 'Novato de las Cuevas' };
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const minerals = userRpg.minerals || {};

            let pp;
            try { 
                pp = await conn.profilePictureUrl(targetJid, 'image'); 
            } catch { 
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; 
            }

            let txt = `*${config.visuals.emoji3} \`PERFIL DE USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✿︎ Usuario:* @${user}\n\n`;
            txt += `*✿︎ Género:* ${genero}\n`;
            txt += `*✿︎ Edad:* ${edad}\n`;
            txt += `*✿︎ Cumpleaños:* ${cumple}\n`;
            txt += `*✿︎ Pareja:* ${pareja}\n\n`;
            
            txt += `*✿︎ INFO ECONOMY* ✿︎\n`;
            txt += `> ⴵ Cartera: *¥${wallet.toLocaleString()}*\n`;
            txt += `> ⴵ Banco: *¥${bank.toLocaleString()}*\n`;
            txt += `> ⴵ Patrimonio: *¥${(wallet + bank).toLocaleString()}*\n\n`;

            txt += `*✿︎ INFO GACHA* ✿︎\n`;
            txt += `> ⴵ Colección: *${totalPjs} personajes*\n\n`;

            txt += `*✿︎ INFO RPG ✿︎*\n`;
            txt += `> ⴵ Rango: *${rank}*\n`;
            txt += `> ⴵ Diamantes: *${minerals.diamantes || 0}*\n`;
            txt += `> ⴵ Rubíes: *${minerals.rubies || 0}*\n`;
            txt += `> ⴵ Oro: *${minerals.oro || 0}*\n`;
            txt += `> ⴵ Gemas: *${(Number(minerals.esmeraldas || 0) + Number(minerals.zafiros || 0) + Number(minerals.amatistas || 0) + Number(minerals.perlas || 0))}*`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;