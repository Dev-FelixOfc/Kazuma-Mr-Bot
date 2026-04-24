import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const trades = new Map();

const tradeCommand = {
    name: 'trade',
    alias: ['intercambio', 'cambiar'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];

            if (args[0] === 'accept') {
                if (!m.quoted) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de la propuesta para aceptar.`);
                
                const proposal = trades.get(m.quoted.id);
                if (!proposal) return m.reply(`*${config.visuals.emoji2}* Esta propuesta ya no existe o ha caducado.`);
                if (m.sender !== proposal.toJid) return m.reply(`*${config.visuals.emoji2}* Solo la persona mencionada puede aceptar este intercambio.`);

                let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

                const user1 = proposal.from;
                const user2 = user;
                const pj1 = proposal.myPjId;
                const pj2 = proposal.targetPjId;

                if (!gachaDB[pj1] || !gachaDB[pj2] || gachaDB[pj1].owner !== user1 || gachaDB[pj2].owner !== user2) {
                    trades.delete(m.quoted.id);
                    return m.reply(`*${config.visuals.emoji2}* El intercambio falló: uno de los personajes ya no está disponible.`);
                }

                gachaDB[pj1].owner = user2;
                gachaDB[pj2].owner = user1;
                gachaDB[pj1].status = 'domado';
                gachaDB[pj2].status = 'domado';

                fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
                trades.delete(m.quoted.id);

                return m.reply(`*${config.visuals.emoji3}* ¡Intercambio completado!\n\n@${user1} recibió a *${gachaDB[pj2].name}*\n@${user2} recibió a *${gachaDB[pj1].name}*`, {
                    mentions: [user1 + '@s.whatsapp.net', m.sender]
                });
            }

            const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para proponer un cambio.`);

            const target = targetJid.split('@')[0].split(':')[0];
            const [myId, hisId] = args;

            if (!myId || !hisId) return m.reply(`*${config.visuals.emoji2}* Uso: #trade (Tu_ID) (Su_ID) @mención`);

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            if (!gachaDB[myId] || !gachaDB[hisId]) return m.reply(`*${config.visuals.emoji2}* Uno de los IDs no es válido.`);

            if (gachaDB[myId].owner !== user) return m.reply(`*${config.visuals.emoji2}* El personaje *${gachaDB[myId].name}* no es tuyo.`);
            if (gachaDB[hisId].owner !== target) return m.reply(`*${config.visuals.emoji2}* El personaje *${gachaDB[hisId].name}* no es de esa persona.`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE INTERCAMBIO\` ${config.visuals.emoji3}*\n\n@${user} quiere cambiar su *${gachaDB[myId].name}* por tu *${gachaDB[hisId].name}*.\n\n> Tienes *5 minutos* para responder con: *#trade accept*`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

            const proposalId = sent.key.id;
            trades.set(proposalId, { from: user, toJid: targetJid, myPjId: myId, targetPjId: hisId });

            setTimeout(async () => {
                if (trades.has(proposalId)) {
                    trades.delete(proposalId);
                    await conn.sendMessage(m.chat, { 
                        text: `*${config.visuals.emoji2}* El tiempo para el intercambio ha expirado. La propuesta de @${user} ha sido cancelada.`,
                        mentions: [user + '@s.whatsapp.net']
                    }, { quoted: sent });
                }
            }, 300000);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el intercambio.`);
        }
    }
};

export default tradeCommand;
