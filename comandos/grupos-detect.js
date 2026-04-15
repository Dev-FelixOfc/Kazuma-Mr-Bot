/* KAZUMA MISTER BOT - EVENT DETECTOR (FIXED) */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export default async (conn) => {
    // Escucha de participantes (Promote/Demote)
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action, author } = update;
            
            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id]?.detect) return;

            for (let user of participants) {
                const phone = user.split('@')[0];
                // Si no hay author, es porque lo hizo el sistema o un bot
                const actor = author ? author.split('@')[0] : 'un Administrador';
                let aviso = '';

                if (action === 'promote') {
                    aviso = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\nEl usuario *@${phone}* fue promovido a Administrador por *@${actor}*.\n\n> ¡Felicidades por el cargo!`;
                } else if (action === 'demote') {
                    aviso = `*❁* \`Remoción de Cargo\` *❁*\n\nEl usuario *@${phone}* fue degradado de su cargo por *@${actor}*.\n\n> ¡A seguir participando!`;
                }

                if (aviso) {
                    await conn.sendMessage(id, { 
                        text: aviso, 
                        mentions: [user, author].filter(Boolean) 
                    });
                }
            }
        } catch (e) {
            console.error("Error en Detect (Participants):", e);
        }
    });

    // Escucha de cambios de configuración del grupo (StubType)
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.messageStubType) return;
            const chat = m.key.remoteJid;

            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[chat]?.detect) return;

            const actor = m.key?.participant || m.participant || chat;
            const phone = actor.split('@')[0];
            let cambio = '';

            // Mapeo de eventos de Baileys
            const stubTypes = {
                21: `cambió el nombre a: *${m.messageStubParameters[0]}*`,
                22: `actualizó la foto del grupo.`,
                24: `editó la descripción del grupo.`,
                25: `cambió los ajustes: *${m.messageStubParameters[0] == 'on' ? 'Solo Admins' : 'Todos'}* pueden editar.`,
                26: `cambió los ajustes: *${m.messageStubParameters[0] == 'on' ? 'Chat Cerrado' : 'Chat Abierto'}*.`
            };

            cambio = stubTypes[m.messageStubType];

            if (cambio) {
                await conn.sendMessage(chat, { 
                    text: `*✿︎* \`Aviso de Grupo\` *✿︎*\n\n*@${phone}* ${cambio}\n\n> Kazuma detectó el cambio.`,
                    mentions: [actor]
                });
            }
        } catch (e) {
            console.error("Error en Detect (Stub):", e);
        }
    });
};