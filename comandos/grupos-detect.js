import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const databasePath = path.resolve('./jsons/grupos.json');

export default async (conn) => {
    // 1. Escuchar cambios de participantes (Promote/Demote)
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            const { id, participants, action, author } = anu;
            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id] || !db[id].detect) return;

            const metadata = await conn.groupMetadata(id).catch(() => null);
            if (!metadata) return;

            for (const user of participants) {
                const phone = user.split('@')[0];
                const actor = author ? author.split('@')[0] : 'Sistema';
                let text = '';

                if (action === 'promote') {
                    text = `*✿︎* \`Nuevo Administrador\` *✿︎*\n\n*@${phone}* ha sido promovido a Administrador por *@${actor}*.\n\n> ¡Felicidades por el nuevo cargo!`;
                } else if (action === 'demote') {
                    text = `*❁* \`Remoción de Cargo\` *❁*\n\n*@${phone}* ha sido degradado de Administrador por *@${actor}*.\n\n> ¡Esperamos que sigas aportando al grupo!`;
                }

                if (text) {
                    await conn.sendMessage(id, { text, mentions: [user, author].filter(Boolean) });
                }
            }
        } catch (err) {
            console.log(chalk.gray(`[DETECT ERROR] -> ${err}`));
        }
    });

    // 2. Escuchar cambios en ajustes del grupo (Nombre, Enlace, etc)
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.messageStubType) return;
            const id = m.key.remoteJid;
            
            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id] || !db[id].detect) return;

            const actor = m.key?.participant || m.participant || m.key?.remoteJid;
            const phone = actor.split('@')[0];
            let msg = '';

            switch (m.messageStubType) {
                case 21: msg = `cambió el nombre del grupo a: *${m.messageStubParameters[0]}*`; break;
                case 22: msg = `cambió el icono del grupo.`; break;
                case 23: msg = `restableció el enlace del grupo.`; break;
                case 24: msg = `cambió la descripción del grupo.`; break;
                case 25: msg = `cambió los ajustes: *${m.messageStubParameters[0] == 'on' ? 'Solo Admins' : 'Todos'}* pueden editar el grupo.`; break;
                case 26: msg = `cambió los ajustes: *${m.messageStubParameters[0] == 'on' ? 'Cerrar Chat' : 'Abrir Chat'}*.`; break;
            }

            if (msg) {
                await conn.sendMessage(id, { 
                    text: `*✿︎* \`Aviso de Grupo\` *✿︎*\n\n*@${phone}* ${msg}\n\n> Ajuste detectado por Kazuma.`, 
                    mentions: [actor] 
                });
            }
        } catch (err) {
            console.log(chalk.gray(`[STUB ERROR] -> ${err}`));
        }
    });
};

// Info para que tu cargador de comandos no se confunda
export const config = {
    name: 'grupos-detect',
    category: 'grupo',
    type: 'event'
};