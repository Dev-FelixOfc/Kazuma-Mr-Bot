/* KURAYAMI TEAM - INDEX ENGINE 
   Desarrollado por Félix OFC para Kazuma Mister Bot
*/

import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidDecode
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';

import { detectHandler } from './comandos/grupos-detect.js';
import antiLinkHandler from './comandos/grupos-antilink.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();

global.loadCommands = async () => {
    process.stdout.write(chalk.cyan('  [⚙️] Cargando módulos de comandos... '));
    const commandsPath = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    global.commands.clear();
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?update=${Date.now()}`);
            if (module.default && module.default.name) {
                global.commands.set(module.default.name, module.default);
            }
        } catch (e) {
            console.log(chalk.red(`\n  [❌] Error en ${file}:`), e.message);
        }
    }
    process.stdout.write(chalk.greenBright(`LISTO (${global.commands.size})\n`));
};

async function startBot() {
    const sessionDir = './sesion_bot';
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    process.stdout.write('\x1Bc');
    CFonts.say('KAZUMA', { 
        font: 'block', align: 'center', colors: ['cyan', 'magenta'], background: 'transparent', letterSpacing: 1 
    });

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
    });

    await global.loadCommands();

    try {
        detectHandler(conn);
    } catch (e) {
        console.error(chalk.red("  [❌] Error en Detector:"), e.message);
    }

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let phoneNumber = "";
            let input = await question(chalk.cyan('\n  [?] Introduce tu número (ej: 57350XXXXXXX):\n  > '));
            phoneNumber = input.replace(/[^0-9]/g, '');
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan(`\n  CODIGO: ${code}  \n`));
            } catch (error) {
                console.error(chalk.red('  [!] Error:'), error.message);
            }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldRestart = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldRestart) startBot();
        } else if (connection === 'open') {
            console.log(chalk.greenBright.bold('\n  [✨] ¡KAZUMA CONECTADO!'));
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        let m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        // Propiedades base
        m.chat = m.key.remoteJid;
        m.sender = m.key.participant || m.key.remoteJid;
        m.reply = (text) => conn.sendMessage(m.chat, { text }, { quoted: m });

        // Construir m.quoted si hay mensaje citado
        const msgType = Object.keys(m.message)[0];
        const msgContent = m.message[msgType];
        const contextInfo = msgContent?.contextInfo;

        if (contextInfo?.quotedMessage) {
            m.quoted = {
                key: {
                    remoteJid: m.chat,
                    fromMe: contextInfo.participant === conn.user.id,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: contextInfo.quotedMessage
            };
        } else {
            m.quoted = null;
        }

        // --- EJECUCIÓN ANTI-LINK ---
        await antiLinkHandler(conn, m);

        // --- MANEJADOR PIXEL ---
        await pixelHandler(conn, m, config);
    });
}

startBot();