/* KURAYAMI TEAM - ID EXTRACTOR ESM
   Estrategia: Detección de identidad en contexto (JID/LID)
   Desarrollado por Félix OFC
*/

export default {
    name: 'quiensoy',
    alias: ['number', 'id', 'miid'],
    category: 'info',
    noPrefix: true, // Prioridad absoluta para que responda siempre

    run: async (conn, m, { config }) => {
        try {
            // Capturamos el remitente exacto que envía el evento
            const userNumber = m.sender; 
            const pureNumber = userNumber.split('@')[0];

            const texto = `
★ DETECTOR DE IDENTIDAD ★

*Tu ID completo:* ${userNumber}

*Tu número/identidad limpia:* ${pureNumber}

> ¡Usa esta información con cabeza!`.trim();

            await conn.sendMessage(m.chat, { 
                text: texto,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA IDENTITY SCAN',
                        body: 'Extrayendo metadatos del remitente...',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', // Tu imagen de preferencia
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

            // Log en consola para que lo copies desde el panel sin errores
            console.log('\n' + '─'.repeat(30));
            console.log(' [🆔] IDENTIDAD DETECTADA:', userNumber);
            console.log('─'.repeat(30) + '\n');

        } catch (err) {
            console.error('Error en el detector de número:', err);
        }
    }
};