import chalk from 'chalk';
import { config } from '../config.js';

export const socketLogger = (m, conn) => {
    try {
        if (!m || !m.message || !m.key || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (m.key.participant || from) : from;
        const senderNumber = sender ? sender.split('@')[0].replace(/\D/g, '') : '000000';

        const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
        const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

        const type = Object.keys(m.message).find(t => t !== 'senderKeyDistributionMessage' && t !== 'messageContextInfo') || '';
        if (!type || type === 'protocolMessage') return;

        let body = '';
        const msg = m.message[type];

        if (type === 'conversation') {
            body = m.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = msg?.text || '';
        } else if (type === 'imageMessage') {
            body = '📷 Imagen';
        } else if (type === 'videoMessage') {
            body = '🎥 Video';
        } else if (type === 'stickerMessage') {
            body = '🏷️ Sticker';
        } else {
            body = `📦 ${type.replace('Message', '')}`;
        }

        if (!isGroup && !isRealOwner) {
            const text = body.trim().toLowerCase();
            const prefixes = config.allPrefixes || ['#', '!', '.'];
            const foundPrefix = prefixes.find(p => text.startsWith(p));
            
            const commandName = foundPrefix 
                ? text.slice(foundPrefix.length).trim().split(/ +/).shift()
                : text.trim().split(/ +/).shift();

            const allowedPrivateCmds = ['code', 'codemood', 'setname', 'setbanner'];
            if (!allowedPrivateCmds.includes(commandName)) return;
        }

        const groupInfo = isGroup ? chalk.yellow(` (G:${from.split('@')[0]})`) : chalk.green(` (P)`);
        const time = new Date().toLocaleTimeString();
        const name = m.key.fromMe ? 'YO (SUB-BOT)' : (m.pushName || 'Sub-Bot User');

        const subTag = chalk.black.bgMagenta(`[SUB-PIXEL]`);
        const userTag = m.key.fromMe ? chalk.greenBright(`${name}`) : chalk.cyan(`${name} (${senderNumber})`);

        console.log(
            subTag + 
            chalk.blue(`[${time}] `) + 
            userTag + chalk.white(`: `) +
            chalk.white(body.length > 50 ? body.substring(0, 50) + '...' : body) +
            groupInfo
        );

    } catch (e) {
        console.error(chalk.red(`  [⚠️ Sub-Bot Logger Error]: ${e.message}`));
    }
};