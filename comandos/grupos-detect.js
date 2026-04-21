export default {
    name: 'tests',
    alias: ['test', 'prueba'],
    category: 'main',
    noPrefix: true, // Permite que se ejecute escribiendo solo "tests"

    run: async (conn, m) => {
        try {
            const texto = 'El mensaje se ve.';

            await conn.sendMessage(m.chat, { 
                text: texto,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - TEST SYSTEM',
                        body: 'Validación de auto-respuesta activa',
                        thumbnailUrl: 'https://upload.yotsuba.giize.com/u/a4NBj9rH.jpg',
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error en comando tests:", e);
        }
    }
};
