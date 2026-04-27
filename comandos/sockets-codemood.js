import { startMoodBot } from '../sockets/SubMoods/index.js';
import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const cooldowns = new Map();
const databasePath = path.resolve('./jsons/preferencias.json');
const ownersFilePath = path.resolve('./config/database/security/authorization/master/owner.json');

const moodCodeCommand = {
    name: 'codemood',
    alias: ['sockets-moods'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m, args) => {
        const from = m.chat;
        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        if (m.chat.endsWith('@g.us')) {
            if (await fs.pathExists(databasePath)) {
                const db = await fs.readJson(databasePath);
                if (db[from]) {
                    const primaryNumber = db[from].replace(/\D/g, '');
                    if (myJid !== primaryNumber) return;
                }
            }
        }

        if (!(await fs.pathExists(ownersFilePath))) {
            return m.reply(`*${config.visuals.emoji2}* Error: Base de datos de autorización no encontrada.`);
        }

        const ownersData = await fs.readJson(ownersFilePath);
        const senderNumber = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
        
        const isAuthorized = ownersData.owners.some(num => num.replace(/\D/g, '') === senderNumber);
        if (!isAuthorized) {
            return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\`\n\n> Tu número no figura en la lista Maestra de autorización.`);
        }

        const tokensPath = path.resolve('./jsons/tokens');
        const inputToken = args[0];
        if (!inputToken) {
            return m.reply(`*${config.visuals.emoji2}* Proporciona el token de seguridad.\n\n> Ejemplo: *codemood 1234*`);
        }

        const tokenFile = path.join(tokensPath, `${inputToken}.json`);
        if (!(await fs.pathExists(tokenFile))) {
            return m.reply(`*${config.visuals.emoji2}* Token inválido o ya utilizado.`);
        }

        const userSessionPath = path.resolve(`./sesiones_moods/${senderNumber}`);
        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 30000)) return;

        try {
            await fs.remove(tokenFile);
            
            if (await fs.pathExists(userSessionPath)) {
                await fs.remove(userSessionPath);
            }

            const msgEspera = await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji3}* \`AUTORIZACIÓN MASTER\`\n\nPreparando solicitud para: \`${senderNumber}\`...\n\n> Motor: Opera / MacOS`,
            }, { quoted: m });

            const jidReal = `${senderNumber}@s.whatsapp.net`;
            const sock = await startMoodBot(jidReal, conn);

            await new Promise(resolve => setTimeout(resolve, 10000));

            let code = await sock.requestPairingCode(senderNumber);
            
            if (!code) {
                await fs.remove(userSessionPath);
                throw new Error("Baileys no pudo sincronizar el código. Intenta de nuevo.");
            }

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`SUBMOOD VINCULACIÓN\` ✿︎\n\n*❁* \`Instrucciones:\` \nIngresa este código en Dispositivos Vinculados > Vincular con número de teléfono.\n\n> El código expira en 60 segundos.`
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* ¡Jerarquía Mood establecida!\n\n> Sesión guardada para: ${senderNumber}`,
                    }, { quoted: m }); 
                    try {
                        await conn.sendMessage(from, { delete: msgInstrucciones.key });
                        await conn.sendMessage(from, { delete: msgCodigo.key });
                    } catch (e) {}
                }
            });

            cooldowns.set(from, now);

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* \`FALLO DE MASTER\`\n\n${err.message}`);
        }
    }
};

export default moodCodeCommand;