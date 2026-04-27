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
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { moodLogger } from './print.js';
import { pixelHandler } from '../../pixel.js';
import { config } from '../../config.js';

const moodPath = path.resolve('./sesiones_moods');
fs.ensureDirSync(moodPath);

global.moodBots = new Map();

export const startMoodBot = async (userId, mainConn = null) => {
    const jid = jidNormalizedUser(userId);
    const userNumber = jid.split('@')[0];
    const userSessionPath = path.join(moodPath, userNumber);

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
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        markOnlineOnConnect: true,
        shouldIgnoreJid: () => false
    });

    global.moodBots.set(jid, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                setTimeout(() => startMoodBot(jid, mainConn), 5000);
            } else {
                global.moodBots.delete(jid);
                await fs.remove(userSessionPath);
            }
        } else if (connection === 'open') {
            console.log(chalk.bgMagenta.white(` [SubMood] `) + chalk.green(` ✅ Jerarquía Mood activa: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        let m = chatUpdate.messages[0];
        if (!m || !m.message) return;

        m.chat = m.key.remoteJid;
        m.sender = m.key.participant || m.key.remoteJid;
        m.reply = (text) => sock.sendMessage(m.chat, { text }, { quoted: m });

        m.download = async () => {
            return await downloadMediaMessage(m, 'buffer', {}, { logger: P({ level: 'silent' }) });
        };

        const msgType = Object.keys(m.message)[0];
        if (msgType === 'protocolMessage' || msgType === 'senderKeyDistributionMessage') return;

        if (m.message[msgType]?.contextInfo?.quotedMessage) {
            const q = m.message[msgType].contextInfo;
            m.quoted = {
                type: Object.keys(q.quotedMessage)[0],
                msg: q.quotedMessage[Object.keys(q.quotedMessage)[0]],
                id: q.stanzaId,
                key: { remoteJid: m.chat, id: q.stanzaId, participant: q.participant },
                message: q.quotedMessage
            };
        }

        moodLogger(m, sock);
        await pixelHandler(sock, m, config);
    });

    return sock;
};

export const loadAllMoodBots = async (mainConn) => {
    if (!(await fs.pathExists(moodPath))) return;
    const sessions = await fs.readdir(moodPath);
    for (const num of sessions) {
        if (num.includes('.') || isNaN(num)) continue; 
        await new Promise(r => setTimeout(r, 2500));
        startMoodBot(`${num}@s.whatsapp.net`, mainConn);
    }
};