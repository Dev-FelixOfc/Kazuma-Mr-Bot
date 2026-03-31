/* KURAYAMI TEAM

- LID RESOLVER ENGINE 
   Desarrollado para Kazuma Bot
*/

const clusterCache = new Map();
const identityMap = new Map();
const TTL_METADATA = 10000; // 10 segundos

function getFreshMetadata(groupId) {
    const entry = clusterCache.get(groupId);
    if (!entry || Date.now() - entry.timestamp > TTL_METADATA) return null;
    return entry.data;
}

/**
 * Normaliza cualquier ID a formato WhatsApp Standard
 */
export function formatJid(id) {
    if (!id) return null;
    const cleanId = typeof id === 'number' ? id.toString() : id.replace(/\D/g, '');
    return cleanId ? `${cleanId}@s.whatsapp.net` : null;
}

/**
 * Función Maestra: Traduce identificadores LID a JID Reales
 */
export async function syncLid(client, m, chatId) {
    const targetId = m.sender || m.key?.participant || m.key?.remoteJid;
    const input = targetId?.toString().trim();

    if (!input || !chatId?.endsWith('@g.us')) return input;
    if (input.endsWith('@s.whatsapp.net')) return input;
    if (identityMap.has(input)) return identityMap.get(input);

    const lidHash = input.split('@')[0];
    let groupData = getFreshMetadata(chatId);

    if (!groupData) {
        try {
            groupData = await client.groupMetadata(chatId);
            clusterCache.set(chatId, { data: groupData, timestamp: Date.now() });
        } catch {
            return identityMap.set(input, input), input;
        }
    }

    for (const member of groupData.participants || []) {
        const memberLid = member?.id?.split('@')[0]?.trim();
        const memberPhone = formatJid(member?.phoneNumber);
        
        if (!memberLid || !memberPhone) continue;
        if (memberLid === lidHash) {
            return identityMap.set(input, memberPhone), memberPhone;
        }
    }

    return identityMap.set(input, input), input;
}