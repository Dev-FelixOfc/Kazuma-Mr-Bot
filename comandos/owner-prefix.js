/* KURAYAMI TEAM - PRUEBA DE PODER ABSOLUTO 
   Lógica: Identidad Inyectada (JID + LID)
*/

export default {
    name: 'prueba',
    alias: ['test', 'verificar'],
    category: 'owner',
    // Mantenemos esto por si el handler ayuda, pero la magia está abajo
    isOwner: true, 

    run: async (conn, m) => {
        // 🛡️ CANDEADO MAESTRO DE IDENTIDAD (TUS DOS LLAVES)
        const misIdentidades = [
            '573508941325@s.whatsapp.net', // Tu JID (Número real)
            '125860308893859@lid'          // Tu LID (Identidad de grupo)
        ];

        const soyYo = misIdentidades.includes(m.sender);

        // Si el que escribe NO es ninguna de tus dos identidades, el bot se calla
        if (!soyYo) return; 

        // Si pasó el filtro, significa que eres tú (en privado o en grupo LID)
        const texto = `
🔱 *CONEXIÓN ESTABLECIDA - KURAYAMI HOST* 🔱

¡Confirmado, Félix! El código te reconoce por inyección directa.

🌱 *ID Actual:* \`${m.sender}\`
🌱 *Estado:* **ADMINISTRADOR SUPREMO** ✅

> El bot ahora ignora cualquier configuración externa y te obedece a ti directamente. 😈
`.trim();

        await conn.sendMessage(m.chat, { 
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: 'SISTEMA DE SEGURIDAD KURAYAMI',
                    body: 'Detección de Identidad Dual Directa',
                    thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        console.log(`[🚀] ¡ACCESO CONCEDIDO A FÉLIX! ID: ${m.sender}`);
    }
};
