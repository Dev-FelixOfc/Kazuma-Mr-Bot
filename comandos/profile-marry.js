import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const genrePath = path.resolve('./config/database/profile/genres.json');
const marryPath = path.resolve('./config/database/profile/casados.json');
const proposals = new Map();

const marrySystem = {
    name: 'profile-marry',
    alias: ['marry', 'divorce', 'casar', 'divorcio', 'acceptmarry'],
    category: 'profile',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const cmd = m.body.toLowerCase();
            let casados = JSON.parse(fs.readFileSync(marryPath, 'utf-8'));
            let genres = JSON.parse(fs.readFileSync(genrePath, 'utf-8'));

            if (cmd.includes('divorce') || cmd.includes('divorcio')) {
                if (!casados[user]) return m.reply(`*${config.visuals.emoji2}* No existe un vínculo activo.`);
                const pareja = casados[user];
                delete casados[user];
                delete casados[pareja];
                fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                return await conn.sendMessage(m.chat, { 
                    text: `*☹︎ DIVORCIO CONFIRMADO ☹︎*\n\n@${user} ha decidido terminar el matrimonio. Ahora ambos están solteros.`, 
                    mentions: [m.sender, pareja + '@s.whatsapp.net'] 
                }, { quoted: m });
            }

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) return m.reply('✘ Sin propuestas pendientes.');
                const prop = proposals.get(m.quoted.id);
                if (m.sender !== prop.to) return m.reply('✘ No puedes aceptar un pacto ajeno.');
                casados[user] = prop.from;
                casados[prop.from] = user;
                fs.writeFileSync(marryPath, JSON.stringify(casados, null, 2));
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3}* \`VÍNCULO SELLADO\` 💍`, { mentions: [m.sender, prop.fromJid] });
            }

            if (casados[user]) return m.reply(`*${config.visuals.emoji2}* Ya posees un vínculo activo. Usa #divorce.`);

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply('✘ Menciona a tu objetivo.');
            const target = targetJid.split('@')[0].split(':')[0];

            if (casados[target]) return m.reply(`*${config.visuals.emoji2}* El objetivo ya posee un vínculo.`);
            if (!genres[user] || !genres[target]) return m.reply('✘ Ambos requieren definir su identidad (#setgenre).');
            if (genres[user] === genres[target]) return m.reply('✘ Pacto denegado: Se requiere oposición de géneros.');

            const sent = await conn.sendMessage(m.chat, { 
                text: `*💍 PROPUESTA DE MATRIMONIO 💍*\n\n@${user} solicita un pacto eterno. Responde con *#marry accept* para sellarlo.`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: user, fromJid: m.sender, to: targetJid });
        } catch (e) {
            m.reply('✘ Error en el sistema de vínculos.');
        }
    }
};

export default marrySystem;