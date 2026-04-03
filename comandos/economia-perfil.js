import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

const profileCommand = {
    name: 'profile',
    alias: ['perfil'],
    category: 'rpg',
    noPrefix: true,
    run: async (conn, m) => {
        const from = m.chat;
        const e1 = config.visuals.emoji;
        const e2 = config.visuals.emoji2;
        const eCoins = config.visuals.emoji5;
        const eCmds = config.visuals.emoji6;
        
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
        const userNumber = who.split('@')[0];
        const dailyFile = path.join(dbPath, userNumber, 'daily.json');

        let pp;
        try {
            pp = await conn.profilePictureUrl(who, 'image');
        } catch {
            pp = 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg';
        }

        let data = { lastDaily: 0, totalCoins: 0, usedCommands: 0 };
        if (fs.existsSync(dailyFile)) data = JSON.parse(fs.readFileSync(dailyFile));

        let lastDailyTxt = "Nunca";
        if (data.lastDaily > 0) {
            const diff = Date.now() - data.lastDaily;
            const dur = moment.duration(diff);
            if (dur.asHours() >= 1) lastDailyTxt = `Hace ${Math.floor(dur.asHours())} hora(s)`;
            else if (dur.asMinutes() >= 1) lastDailyTxt = `Hace ${Math.floor(dur.asMinutes())} minuto(s)`;
            else lastDailyTxt = `Hace ${Math.floor(dur.asSeconds())} segundo(s)`;
        }

        const groupMetadata = m.isGroup ? await conn.groupMetadata(from) : {};
        const participants = m.isGroup ? groupMetadata.participants : [];
        const userPart = participants.find(p => p.id === who);
        const isAdmin = userPart?.admin || userPart?.isSuperAdmin ? 'Admin' : 'User';
        const name = await conn.getName(who);

        const profileText = `*${e2} \`PERFIL DE USUARIO\` ${e2}*\n\n` +
            `Nombre » *${name}*\n` +
            `Rol » *${isAdmin}*\n` +
            `${eCmds} Comandos usados » *${data.usedCommands}*\n\n` +
            `*${e1} \`ECONOMIA\` ${e1}*\n\n` +
            `Último daily » *${lastDailyTxt}*\n` +
            `${eCoins} Coins totales » *${data.totalCoins.toLocaleString()}*\n\n` +
            `> ¡Sigue usando el bot y gana mas coins!`;

        await conn.sendMessage(from, { image: { url: pp }, caption: profileText }, { quoted: m });
    }
};

export default profileCommand;