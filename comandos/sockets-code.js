import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, args }) => {
        const from = m.key.remoteJid;

        // 1. Validar que puso el número
        if (!args[0]) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *Uso Incorrecto*\n\nPor favor, ingresa el número de teléfono con el código de país.\n\nEjemplo: *${prefix}code 1849XXXXXXX*` 
            }, { quoted: m });
        }

        // Limpiar el número de caracteres extra
        let targetNumber = args[0].replace(/[^0-9]/g, '');

        // 2. Cooldown para evitar spam
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) {
            const timeLeft = Math.round(((cooldowns.get(from) + 60000) - now) / 1000);
            return await conn.sendMessage(from, { text: `[✿︎] Debes esperar *${timeLeft}s* para reintentar.` });
        }

        try {
            // Mensaje de instrucciones
            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con número de teléfono > ingresa el código.\n\n\`Nota\` » El código es válido por *60 segundos*.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'INSTRUCCIONES DE CONEXIÓN',
                        body: `Solicitando código para: ${targetNumber}`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // Iniciamos la instancia del sub-bot con el número manual
            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            // Pedir el código directamente al número colocado
            let code = await sock.requestPairingCode(targetNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;

            // Enviamos el código solo
            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });

            cooldowns.set(from, now);

            // Borrado automático
            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error en comando code:', err);
            await conn.sendMessage(from, { 
                text: `❌ *Error:* No se pudo generar el código para el número *${targetNumber}*.\n\nVerifica que el número sea correcto y tenga el formato internacional.` 
            });
        }
    }
};

export default codeCommand;
