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
import antiLinkHandler from '../../comandos/grupos-antilink.js';

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

        m.reply = (text) => sock.sendMessage(m.chat, { text }, { quoted: m });

        m.download = async () => {
            return await downloadMediaMessage(m, 'buffer', {}, { logger: P({ level: 'silent' }) });
        };

        const msgType = Object.keys(m.message)[0];
        if (msgType === 'protocolMessage' || msgType === 'senderKeyDistributionMessage') return;

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

        moodLogger(m, sock);
        await antiLinkHandler(sock, m);
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