import fs from 'fs';
import path from 'path';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'preferencias.json');

const setPrimary = {
    name: 'setprimary',
    alias: ['principal', 'solotu'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args) => {
        const from = m.key.remoteJid;
        
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }

        // Lógica mejorada para detectar el bot (Mención o Respuesta)
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const participant = m.message?.extendedTextMessage?.contextInfo?.participant;
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        let targetJid = mentionedJid || participant;

        if (!targetJid) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Error de asignación\` *❁*\n\nDebes mencionar a un Bot o responder a su mensaje para nombrarlo primario.\n\n> ¡Asegúrate de elegir al socket correcto!` 
            }, { quoted: m });
        }

        const targetNumber = targetJid.split('@')[0];
        const mainNumber = conn.user.id.split(':')[0];
        const sessionsPath = path.resolve('./sesiones_subbots');
        
        const isMain = targetNumber === mainNumber;
        const isSub = fs.existsSync(path.join(sessionsPath, targetNumber));

        if (!isMain && !isSub) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Bot no encontrado\` *❁*\n\nEl número \`${targetNumber}\` no parece ser un Bot activo.\n\n> ¡Solo puedes nombrar a bots vinculados!` 
            }, { quoted: m });
        }

        let db = {};
        if (fs.existsSync(databasePath)) {
            try {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            } catch (e) {
                db = {};
            }
        }

        db[from] = targetNumber;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Configuración Exitosa\` *✿︎*\n\nSe ha elegido al socket *${targetNumber}* como bot primario del grupo.\n\n> ¡Desde ahora, solo este bot responderá aquí!` 
        }, { quoted: m });
    }
};

export default setPrimary;