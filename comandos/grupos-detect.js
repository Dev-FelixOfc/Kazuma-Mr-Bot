import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export default async function (conn) {
    // Evento para Promote/Demote
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            const { id, participants, action, author } = anu;
            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id] || !db[id].detect) return;

            for (const user of participants) {
                const phone = user.split('@')[0];
                const actor = author ? author.split('@')[0] : 'un Administrador';
                let text = '';

                if (action === 'promote') {
                    text = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\n*@${phone}* ha sido promovido a Administrador por *@${actor}*.\n\n> ¡Felicidades!`;
                } else if (action === 'demote') {
                    text = `*❁* \`Remoción de Cargo\` *❁*\n\n*@${phone}* ha sido degradado de Administrador por *@${actor}*.\n\n> ¡Ánimo!`;
                }

                if (text) {
                    await conn.sendMessage(id, { text, mentions: [user, author].filter(Boolean) });
                }
            }
        } catch (e) { console.error(e); }
    });

    // Evento para cambios de Nombre/Ajustes
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.messageStubType) return;
        const id = m.key.remoteJid;

        if (!fs.existsSync(databasePath)) return;
        const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
        if (!db[id] || !db[id].detect) return;

        const actor = m.key?.participant || m.participant || m.key?.remoteJid;
        const phone = actor ? actor.split('@')[0] : 'Alguien';
        let msg = '';

        if (m.messageStubType == 21) msg = `cambió el nombre a: *${m.messageStubParameters[0]}*`;
        if (m.messageStubType == 22) msg = `cambió el icono del grupo.`;
        if (m.messageStubType == 24) msg = `cambió la descripción.`;
        if (m.messageStubType == 25) msg = `puso los ajustes en: *${m.messageStubParameters[0] == 'on' ? 'Solo Admins' : 'Todos'}*.`;

        if (msg) {
            await conn.sendMessage(id, { text: `*✿︎* \`Aviso de Grupo\` *✿︎*\n\n*@${phone}* ${msg}`, mentions: [actor].filter(Boolean) });
        }
    });
}