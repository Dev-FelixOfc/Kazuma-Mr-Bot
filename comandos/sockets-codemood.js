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
        // Identidad del bot actual
        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        // Lógica de obediencia al Primario (tomada de tu lógica de menú)
        if (m.chat.endsWith('@g.us')) {
            if (await fs.pathExists(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[from]) {
                    const primaryNumber = db[from].replace(/\D/g, '');
                    // Si este socket no es el primario, se apaga y no responde
                    if (myJid !== primaryNumber) return;
                }
            }
        }

        const tokensPath = path.resolve('./jsons/tokens');
        const inputToken = args[0];
        
        if (!inputToken) {
            return m.reply(`*${config.visuals.emoji2}* Debes proporcionar un token de 4 dígitos.\n\n> Ejemplo: *codemood 1234*`);
        }

        const tokenFile = path.join(tokensPath, `${inputToken}.json`);
        if (!(await fs.pathExists(tokenFile))) {
            return m.reply(`*${config.visuals.emoji2}* El token \`${inputToken}\` no es válido.`);
        }

        // CAPTURA REAL DEL NÚMERO QUE PIDE EL COMANDO
        const targetNumber = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
        
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            // Eliminar token para que sea de un solo uso
            await fs.remove(tokenFile);

            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`TOKEN VALIDADO\`\n\nGenerando vinculación para: \`${targetNumber}\`...\n\n> Usando motor Opera/MacOS`,
            }, { quoted: m });

            // Iniciar el socket del Mood ANTES de pedir el código
            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startMoodBot(jidReal, conn);

            // Espera crucial para que Baileys reconozca el nuevo socket
            await new Promise(resolve => setTimeout(resolve, 8000));

            // PETICIÓN REAL AL NÚMERO ESPECÍFICO
            let code = await sock.requestPairingCode(targetNumber);
            
            if (!code) throw new Error("Baileys no devolvió un código. Intenta de nuevo.");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`VINCULACIÓN DE SUBMOOD\` ✿︎\n\n*❁* \`Instrucciones:\` \nDispositivos vinculados > vincular dispositivo > Vincular con número de teléfono.\n\n> El código se enviará a continuación.`
            });

            // Envío del código solo para fácil copiado
            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            // Manejador de éxito
            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* ¡SubMood vinculado!\n\nNúmero: ${targetNumber}\n\n> Jerarquía Mood activa.`,
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
            m.reply(`*${config.visuals.emoji2}* \`ERROR\`\n${err.message}`);
        }
    }
};

export default moodCodeCommand;