/* KURAYAMI TEAM - DIAGNÓSTICO ELITE 
   Prueba de Reconocimiento de Dueño (JID/LID)
*/

export default {
    name: 'prueba',
    alias: ['testowner', 'check'],
    category: 'owner',
    isOwner: true, // LA PRUEBA DE FUEGO

    run: async (conn, m, { config }) => {
        // Capturamos la identidad exacta que el Handler le pasó al comando
        const identidad = m.sender;
        const tipoId = identidad.endsWith('@lid') ? 'LID (Identidad de Grupo)' : 'JID (Número Estándar)';

        const texto = `
🔱 *DIAGNÓSTICO DE RANGO: ÉXITO* 🔱

¡Te reconozco perfectamente, Félix! El sistema de **Kurayami Host** está operando bajo tu mando.

🌱 *Tu Identidad detectada:* \`${identidad}\`

🌱 *Tipo de Conexión:* ${tipoId}

🌱 *Estado de Poder:* *DUEÑO CONFIRMADO* ✅

> Ahora puedes ejecutar cualquier comando de administración sin restricciones. 😈
`.trim();

        await conn.sendMessage(m.chat, { 
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: 'KURAYAMI TEAM - SECURITY CHECK',
                    body: 'Identidad Dual Verificada',
                    thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        console.log(`[🚀] Prueba de Owner exitosa para: ${identidad}`);
    }
};
