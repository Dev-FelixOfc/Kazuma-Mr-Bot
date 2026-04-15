/* KAZUMA MISTER BOT - ANTI-LINK (ONLY WHATSAPP LINKS) */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const antiLinkHandler = async (conn, m) => {
    if (!m.key.remoteJid.endsWith('@g.us') || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.sender || m.key.participant;

    if (!fs.existsSync(databasePath)) return;
    const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    if (!db[from]?.antilink) return;

    const body = m.message?.conversation || 
                 m.message?.extendedTextMessage?.text || 
                 m.message?.imageMessage?.caption || 
                 m.message?.videoMessage?.caption || "";
    
    const bodyLower = body.toLowerCase();

    // --- LÓGICA DE DETECCIÓN EXCLUSIVA PARA WHATSAPP ---
    // Solo se activa si contiene 'whatsapp.com' o 'wa.me'
    if (bodyLower.includes('whatsapp.com') || bodyLower.includes('wa.me')) {
        
        // --- EXCEPCIONES PERMITIDAS ---
        // 1. Tu GitHub
        if (bodyLower.includes('github.com/dev-felixofc/kazuma-mr-bot')) return;
        
        // 2. Tu Canal oficial
        if (bodyLower.includes('whatsapp.com/channel/0029vb6sgwdjkk73qelu0j0n')) return;
        
        // 3. El enlace de invitación del propio grupo actual
        const code = await conn.groupInviteCode(from).catch(() => null);
        if (code && bodyLower.includes(`chat.whatsapp.com/${code}`)) return;

        // --- VALIDAR SI ES ADMIN (Los admins pueden enviar lo que sea) ---
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (isAdmin) return;

        // --- ACCIÓN DE SANCIÓN ---
        await conn.sendMessage(from, { delete: m.key });
        await conn.sendMessage(from, { 
            text: `*❁* \`Anti-Link WhatsApp\` *❁*\n\nEl usuario *@${sender.split('@')[0]}* ha sido eliminado. En este grupo están prohibidos los enlaces de grupos o contactos ajenos a Kazuma.\n\n> Solo se permiten enlaces oficiales del desarrollador.`,
            mentions: [sender]
        });
        
        // Expulsar al usuario
        await conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
};

export default antiLinkHandler;