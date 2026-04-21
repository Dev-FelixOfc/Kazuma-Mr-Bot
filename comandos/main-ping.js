import { config } from '../config.js';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            const start = Date.now();
            // Enviamos un mensaje de espera simple primero
            const { key } = await m.reply(`*${config.visuals.emoji2}* \`Midiendo velocidad...\``);
            const end = Date.now();
            const latencia = end - start;

            const textoPing = `*${config.visuals.emoji3}* \`KAZUMA PING\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji4} Velocidad:* ${latencia} ms\n*${config.visuals.emoji} Estado:* Online`;

            // Usamos la función mágica de tu base
            // Estructura según tu ejemplo: (jid, texto, opciones, mensaje_original)
            await conn.sendContextInfoIndex(m.chat, textoPing, {}, m);

            // Opcional: Borramos el "Midiendo velocidad" para que no estorbe
            await conn.sendMessage(m.chat, { delete: key });

        } catch (err) {
            console.error('Error en comando ping con Index:', err);
            // Si la función fallara por algún motivo de parámetros, intentamos un fallback
            m.reply(`🚀 *Latencia:* ${Date.now() - start} ms`);
        }
    }
};

export default pingCommand;
