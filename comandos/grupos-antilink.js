/* KAZUMA MISTER BOT - ANTI-LINK SYSTEM */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const antiLinkHandler = async (conn, m) => {
    // Solo actuar en grupos y si no es un mensaje del propio bot
    if (!m.key.remoteJid.endsWith('@g.us') || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.sender || m.key.participant;

    // 1. Verificar si AntiLink está activo en el JSON
    if (!fs.existsSync(databasePath)) return;
    const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    if (!db[from]?.antilink) return;

    // 2. Extraer el texto de cualquier tipo de mensaje (texto, imagen con texto, etc.)
    const body = m.message?.conversation || 
                 m.message?.extendedTextMessage?.text || 
                 m.message?.imageMessage?.caption || 
                 m.message?.videoMessage?.caption || "";
    
    // Regex para detectar enlaces con o sin http, y dominios comunes
    const linkRegex = /((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\?\=\&\%\#]*)?)/gi;
    
    if (linkRegex.test(body)) {
        // --- EXCEPCIONES PERMITIDAS ---
        
        // A. GitHub Oficial
        if (body.includes('github.com/Dev-FelixOfc/Kazuma-Mr-Bot')) return;
        
        // B. Canal Oficial
        if (body.includes('whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N')) return;

        // C. Link del propio grupo (Dinámico)
        const code = await conn.groupInviteCode(from).catch(() => null);
        if (code && body.includes(`chat.whatsapp.com/${code}`)) return;

        // --- ACCIÓN CONTRA USUARIOS (NO ADMINS) ---
        
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        
        // Si es admin, lo dejamos pasar
        if (isAdmin) return;

        // 1. Borrar el mensaje infractor
        await conn.sendMessage(from, { delete: m.key });

        // 2. Notificar la expulsión con tu estilo
        await conn.sendMessage(from, { 
            text: `*❁* \`Anti-Link Detectado\` *❁*\n\nEl usuario *@${sender.split('@')[0]}* ha sido eliminado por enviar enlaces externos.\n\n> ¡En Kazuma solo se permiten enlaces oficiales!`,
            mentions: [sender]
        });

        // 3. Eliminar del grupo
        await conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
};

export default antiLinkHandler;