import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidDecode,
    downloadContentFromMessage,
    downloadMediaMessage
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
import { loadAllSubBots } from './sockets/index.js';
import { loadAllMoodBots } from './sockets/SubMoods/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();
global.lastMessageMap = new Map();

global.db = {
    data: {
        chats: {},
        users: {},
        characters: {}
    }
};

global.loadCommands = async () => {
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
        } catch (e) {}
    }
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
        shouldIgnoreJid: () => false
    });

    await global.loadCommands();

    try {
        detectHandler(conn);
    } catch (e) {}

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let input = await question(chalk.cyan('\n  [?] Introduce tu número:\n  > '));
            let phoneNumber = input.replace(/[^0-9]/g, '');
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black.bgCyan(`\n  CODIGO: ${code}  \n`));
            } catch (error) {}
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldRestart = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldRestart) startBot();
        } else if (connection === 'open') {
            console.log(chalk.greenBright.bold('\n  [✨] ¡KAZUMA CONECTADO!'));
            await loadAllSubBots(conn);
            await loadAllMoodBots(conn);
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        let m = chatUpdate.messages[0];
        if (!m.message) return;

        const body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || ""
        ).trim();

        const prefixes = config.allPrefixes || ['#', '!', '.'];
        const hasPrefix = prefixes.some(p => body.startsWith(p));

        const isNoPrefixCmd = Array.from(global.commands.values()).some(cmd => 
            cmd.noPrefix && (
                body.toLowerCase().startsWith(cmd.name.toLowerCase()) || 
                (cmd.alias && cmd.alias.some(a => body.toLowerCase().startsWith(a.toLowerCase())))
            )
        );

        if (m.key.fromMe && !hasPrefix && !isNoPrefixCmd) return;

        m.chat = m.key.remoteJid;
        m.sender = m.key.participant || m.key.remoteJid;

        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { rolls: {} };

        global.lastMessageMap.set(m.sender, Date.now());
        m.reply = (text) => conn.sendMessage(m.chat, { text }, { quoted: m });

        m.download = async () => {
            return await downloadMediaMessage(m, 'buffer', {}, { logger: P({ level: 'silent' }) });
        };

        const msgType = Object.keys(m.message)[0];
        const msgContent = m.message[msgType];
        const contextInfo = msgContent?.contextInfo;

        if (contextInfo?.quotedMessage) {
            const type = Object.keys(contextInfo.quotedMessage)[0];
            const q = contextInfo.quotedMessage[type];
            m.quoted = {
                type, 
                msg: q, 
                id: contextInfo.stanzaId,
                mimetype: q?.mimetype || '',
                text: q?.text || q?.caption || contextInfo.quotedMessage.conversation || '',
                key: {
                    remoteJid: m.chat,
                    fromMe: contextInfo.participant === conn.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: contextInfo.quotedMessage,
                download: async () => {
                    const quotedMsg = { message: contextInfo.quotedMessage };
                    return await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: P({ level: 'silent' }) });
                }
            };
        } else {
            m.quoted = null;
        }

        logger(m, conn);
        await antiLinkHandler(conn, m);
        await pixelHandler(conn, m, config);
    });
}

startBot();