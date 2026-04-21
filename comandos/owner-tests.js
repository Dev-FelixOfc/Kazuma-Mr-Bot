export default {
    name: 'tests',
    alias: ['tests', 'pruebats'],
    category: 'main',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            await conn.sendMessage(m.chat, { 
                text: 'El mensaje se ve.',
                contextInfo: {
                    externalAdReply: {
                        title: 'PRUEBA DE AUTO-LECTURA',
                        body: 'Validando respuesta del bot',
                        thumbnailUrl: 'https://upload.yotsuba.giize.com/u/a4NBj9rH.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        } catch (e) {
            console.error("Error en comando tests:", e);
        }
    }
};
