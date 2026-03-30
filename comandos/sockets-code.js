import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

// Mapa para gestionar el tiempo de espera (Cooldown)
const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: false, // Solo se puede usar en chat privado como pediste

    run: async (conn, m, { prefix, senderNumber }) => {
        const from = m.key.remoteJid;

        // 1. Verificar Cooldown (1 minuto)
        const now = Date.now();
        const cooldownAmount = 60 * 1000;
        if (cooldowns.has(from)) {
            const expirationTime = cooldowns.get(from) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 1000);
                return await conn.sendMessage(from, { 
                    text: `[✿︎] Debes esperar un poco para volver a ser socket.\n> ¡Vuelve en *${timeLeft} segundos* para intentar de nuevo!`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - COOLDOWN',
                            body: 'Espera un momento...',
                            thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });
            }
        }

        // 2. Iniciar proceso de vinculación
        try {
            // Instrucciones con imagen pequeña
            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con numero de telefono > ingresa el codigo.\n\n\`Nota\` » El código es válido por *60 segundos*.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'INSTRUCCIONES DE CONEXIÓN',
                        body: 'Sigue los pasos para ser Sub-Bot',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // Iniciamos el socket (esto activará el pedido de código en Baileys)
            const sock = await startSubBot(from, conn);

            // Solicitamos el Pairing Code
            let code = await sock.requestPairingCode(senderNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            // Enviamos el código (sin contexto de imagen, solo el código)
            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });

            // Activamos el cooldown
            cooldowns.set(from, now);

            // 3. Lógica de borrado automático a los 60 segundos
            setTimeout(async () => {
                try {
                    // Borrar mensajes para todos
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                    
                    // Avisar que el tiempo expiró
                    await conn.sendMessage(from, { 
                        text: `⚠️ *Tiempo expirado:* El código ha caducado. Si no lograste vincularte, inténtalo de nuevo en unos segundos.` 
                    });
                } catch (e) {
                    console.log('Error al borrar mensajes de code:', e.message);
                }
            }, 60000);

        } catch (err) {
            console.error('Error en comando code:', err);
            await conn.sendMessage(from, { text: '❌ Ocurrió un error al generar el código. Inténtalo más tarde.' });
        }
    }
};

export default codeCommand;