import { config } from '../config.js';

const reactCanalCommand = {
    name: 'reactcanal',
    alias: ['rcanal', 'reaccionar'],
    category: 'owner',
    isOwner: true,
    noPrefix: true, // Agregado como pediste

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        // Limpiamos el link por si viene con texto extra
        const linkMatch = text.match(/https:\/\/whatsapp\.com\/channel\/[a-zA-Z0-9]+/);
        const emoji = args.find(a => !a.includes('http')); // Busca el primer argumento que no sea link

        if (!linkMatch || !emoji) {
            return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nEjemplo: ${usedPrefix}rcanal https://whatsapp.com/channel/XXXX 🔥`);
        }

        const link = linkMatch[0];

        try {
            // Obtener metadata y asegurar que el bot reconozca el canal
            let res = await conn.newsletterMetadata('url', link).catch(() => null);
            if (!res) return m.reply(`*${config.visuals.emoji2}* No pude obtener información del canal. ¿El link es correcto?`);
            
            let jidCanal = res.id;

            // Traer el último mensaje
            let messages = await conn.fetchMessagesFromNewsletter(jidCanal, 1);
            if (!messages || messages.length === 0) return m.reply(`*${config.visuals.emoji2}* El canal parece estar vacío.`);

            let lastMsg = messages[0];

            await conn.sendMessage(jidCanal, {
                react: {
                    text: emoji,
                    key: { remoteJid: jidCanal, id: lastMsg.id, fromMe: false }
                }
            });

            m.reply(`*${config.visuals.emoji}* Reaccioné con ${emoji} al último mensaje.`);

        } catch (err) {
            console.error(err);
            m.reply(`*${config.visuals.emoji2}* Error: El canal no permite reacciones o el bot no tiene acceso.`);
        }
    }
};

export default reactCanalCommand;