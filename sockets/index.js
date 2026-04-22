import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidNormalizedUser,
    downloadContentFromMessage
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
        
        if (m.key.fromMe) return;

        m.reply = (text) => sock.sendMessage(m.chat, { text }, { quoted: m });

        m.download = () => {
            const msg = m.message.imageMessage || m.message.videoMessage || m.message.stickerMessage || m.message.audioMessage || m.message.documentMessage;
            if (!msg) return null;
            return downloadContentFromMessage(msg, Object.keys(m.message)[0].replace('Message', ''));
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
                key: {
                    remoteJid: m.chat,
                    fromMe: contextInfo.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: contextInfo.quotedMessage,
                download: () => downloadContentFromMessage(q, type.replace('Message', ''))
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