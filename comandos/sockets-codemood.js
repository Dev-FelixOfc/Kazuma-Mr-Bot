import { startMoodBot } from '../sockets/SubMoods/index.js';
import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const cooldowns = new Map();
const databasePath = path.resolve('./jsons/preferencias.json');

const moodCodeCommand = {
    name: 'codemood',
    alias: ['sockets-moods'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        if (m.isGroup) {
            if (fs.existsSync(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[from]) {
                    const primaryNumber = db[from].replace(/\D/g, '');
                    if (myJid !== primaryNumber) return;
                }
            }
        }

        const tokensPath = path.resolve('./jsons/tokens');
        const inputToken = args[0];
        if (!inputToken) {
            return m.reply(`*${config.visuals.emoji2}* Debes proporcionar un token de 4 dígitos para vincular un SubMood.\n\n> Ejemplo: *#codemood 1234*`);
        }

        const tokenFile = path.join(tokensPath, `${inputToken}.json`);
        if (!(await fs.pathExists(tokenFile))) {
            return m.reply(`*${config.visuals.emoji2}* El token \`${inputToken}\` no es válido o ha expirado.`);
        }

        const targetNumber = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            await fs.remove(tokenFile);

            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`TOKEN VALIDADO\` *${config.visuals.emoji3}*\n\nIniciando vinculación de SubMood para: \`${targetNumber}\`...\n\n> ¡Elevando privilegios del socket!`,
            }, { quoted: m });

            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startMoodBot(jidReal, conn);

            await new Promise(resolve => setTimeout(resolve, 3000));

            let code = await sock.requestPairingCode(targetNumber);
            if (!code) throw new Error("Fallo al generar código de vinculación");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`VINCULACIÓN DE SUBMOOD\` ✿︎\n\n*❁* \`Instrucciones:\` \nDispositivos vinculados > vincular dispositivo > Usar número de teléfono.\n\n\`Código:\` *${code}*\n\n> Tienes 60 segundos antes de que el código expire.`
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* ¡SubMood vinculado con éxito!\n\nAhora actúas como Mood dentro del sistema.\n\n> Gestión y estabilidad de alto nivel activada.`,
                    }, { quoted: m }); 

                    try {
                        await conn.sendMessage(from, { delete: msgInstrucciones.key });
                        await conn.sendMessage(from, { delete: msgCodigo.key });
                    } catch (e) {}
                }
            });

            cooldowns.set(from, now);

            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Error en la vinculación: ${err.message}`);
        }
    }
};

export default moodCodeCommand;