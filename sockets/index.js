import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidNormalizedUser,
    downloadMediaMessage 
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { socketLogger } from './print.js';
import { pixelHandler } from '../pixel.js';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath, { recursive: true });

global.subBots = new Map();

export const startSubBot = async (userId, mainConn = null) => {
    const jid = jidNormalizedUser(userId);
    const userNumber = jid.split('@')[0];
    const userSessionPath = path.join(sessionsPath, userNumber);

    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.macOS('Safari'), 
        markOnlineOnConnect: true,
        shouldIgnoreJid: () => false
    });

    global.subBots.set(jid, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(chalk.yellow(`[SUB-BOT] Reconectando: ${userNumber}...`));
                setTimeout(() => startSubBot(jid, mainConn), 5000);
            } else {
                console.log(chalk.red(`[SUB-BOT] Sesión eliminada: ${userNumber}`));
                global.subBots.delete(jid);
                if (fs.existsSync(userSessionPath)) fs.rmSync(userSessionPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[SUB-BOT] ✅ Conectado: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        let m = chatUpdate.messages[0];
        if (!m || !m.message) return;

        m.chat = m.key.remoteJid;
        m.sender = m.key.participant || m.key.remoteJid;
        const isGroup = m.chat.endsWith('@g.us');

        const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
        const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
        const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

        const body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || ""
        ).trim();

        if (!isGroup && !isRealOwner) {
            const prefixes = config.allPrefixes || ['#', '!', '.'];
            const foundPrefix = prefixes.find(p => body.startsWith(p));
            const commandName = foundPrefix 
                ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
                : body.trim().split(/ +/).shift().toLowerCase();

            const allowedPrivateCmds = ['code', 'codemood', 'setname', 'setbanner'];
            if (!allowedPrivateCmds.includes(commandName)) return;
        }

        m.reply = (text) => sock.sendMessage(m.chat, { text }, { quoted: m });

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
                    fromMe: contextInfo.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
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

        socketLogger(m, sock);
        await pixelHandler(sock, m, config);
    });

    return sock;
};

export const loadAllSubBots = async (mainConn) => {
    if (!fs.existsSync(sessionsPath)) return;
    const sessions = fs.readdirSync(sessionsPath);
    console.log(chalk.blue(`[SISTEMA] Reanudando ${sessions.length} sub-bots...`));
    for (const num of sessions) {
        if (num.includes('.') || isNaN(num)) continue; 
        const jid = `${num}@s.whatsapp.net`;
        await new Promise(resolve => setTimeout(resolve, 2000));
        startSubBot(jid, mainConn);
    }
};