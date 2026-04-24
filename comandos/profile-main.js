import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const birthPath = path.resolve('./config/database/profile/birthdays.json');

const profileCommand = {
    name: 'profile',
    alias: ['perfil', 'me'],
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
            const mentions = [targetJid];

            const genres = fs.existsSync(genrePath) ? JSON.parse(fs.readFileSync(genrePath, 'utf-8')) : {};
            const casados = fs.existsSync(marryPath) ? JSON.parse(fs.readFileSync(marryPath, 'utf-8')) : {};
            const ecoDB = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};
            const gachaDB = fs.existsSync(gachaPath) ? JSON.parse(fs.readFileSync(gachaPath, 'utf-8')) : {};
            const birthDB = fs.existsSync(birthPath) ? JSON.parse(fs.readFileSync(birthPath, 'utf-8')) : {};

            const genero = genres[user] || 'No definido';
            const pareja = casados[user] ? `@${casados[user]}` : 'Soltero/a';
            const edad = birthDB[user]?.age || 'No definida';
            const cumple = birthDB[user]?.birth || 'No definido';

            if (casados[user]) mentions.push(casados[user] + '@s.whatsapp.net');

            const wallet = Number(ecoDB[user]?.wallet) || 0;
            const bank = Number(ecoDB[user]?.bank) || 0;
            const totalPjs = Object.values(gachaDB).filter(pj => pj.owner === user).length;

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
            txt += `> ⴵ Personajes: *${totalPjs}*\n`;
            txt += `> ⴵ Cartera: *¥${wallet.toLocaleString()}*\n`;
            txt += `> ⴵ Banco: *¥${bank.toLocaleString()}*\n`;
            txt += `> ⴵ Patrimonio: *¥${(wallet + bank).toLocaleString()}*`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;