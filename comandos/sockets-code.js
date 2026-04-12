import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, args }) => {
        const from = m.key.remoteJid;

        if (!args[0]) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *Número faltante*\n\nUso: *${prefix}code 1849XXXXXXX*\n(Ingresa el número tal cual lo pondrías en la consola)` 
            }, { quoted: m });
        }

        // Limpieza total: Solo números.
        let targetNumber = args[0].replace(/[^0-9]/g, '');

        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            // 1. Aviso de inicio de proceso
            const msgEspera = await conn.sendMessage(from, { 
                text: `⏳ *Iniciando vinculación para:* \`${targetNumber}\`...\n\n> Esperando respuesta del servidor de WhatsApp...`,
            }, { quoted: m });

            // 2. Levantar el socket
            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            // Escuchador para el éxito de la conexión
            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* Vinculaste un socket con éxito.\n*@${targetNumber}*\n> ¡Disfruta de la conexión con el bot!`
                    });
                }
            });

            // 3. Pequeña espera de 3 segundos
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 4. Solicitar el Pairing Code
            let code = await sock.requestPairingCode(targetNumber);

            if (!code) throw new Error("No se pudo generar el código");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            // 5. Enviar instrucciones y el código final
            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con número de teléfono > ingresa el código.\n\n\`Nota\` » El código es válido por *60 segundos*.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - CÓDIGO GENERADO',
                        body: `Número: ${targetNumber}`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });

            // Borrar el "Generando..."
            await conn.sendMessage(from, { delete: msgEspera.key });

            cooldowns.set(from, now);

            // 6. Auto-borrado de seguridad
            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error al generar sub-bot:', err);
            await conn.sendMessage(from, { 
                text: `❌ *Error de Vinculación*\n\nWhatsApp rechazó la solicitud para el número *${targetNumber}*. \n\n*Posibles causas:*\n1. El número no tiene el código de país.\n2. Ya tienes una sesión abierta con ese número.\n3. Intentaste demasiadas veces (espera 24h).` 
            });
        }
    }
};

export default codeCommand;