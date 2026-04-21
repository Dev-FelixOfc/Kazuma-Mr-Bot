import { config } from '../config.js'; // Importamos la configuración

export default {
    name: 'tests',
    alias: ['test', 'prueba'],
    category: 'main',
    noPrefix: true, // Se ejecuta escribiendo solo "tests"

    run: async (conn, m) => {
        try {
            // Usamos la URL que ya tienes configurada como img1 en config.js
            const imagenUrl = config.visuals.img1;
            const texto = '✿︎ \`El mensaje se ve.\` ✿︎\n\n> Validación de auto-respuesta activa en red Yotsuba.';

            await conn.sendMessage(m.chat, { 
                image: { url: imagenUrl }, // Cargamos la imagen desde la config
                caption: texto,
                // Agregamos contextInfo ligero para estética pero sin formato de anuncio
                contextInfo: {
                    showAdAttribution: false,
                    forwardingScore: 0,
                    isForwarded: false
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error en comando tests:", e);
        }
    }
};
