import chalk from 'chalk';
import { config } from '../config.js';

export const logger = (m, conn) => {
    try {
        if (!m || !m.message || !m.key || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (m.key.participant || from) : from;
        const senderNumber = sender.split('@')[0].replace(/\D/g, '');
        
        const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
        const isRealOwner = senderNumber === realOwnerNumber || m.key.fromMe;

        const messageType = Object.keys(m.message).find(t => t !== 'senderKeyDistributionMessage' && t !== 'messageContextInfo') || '';
        if (!messageType || messageType === 'protocolMessage') return;

        const msg = m.message[messageType];
        let content = '';

        if (messageType === 'conversation') {
            content = m.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            content = msg?.text || '';
        } else if (messageType === 'imageMessage') {
            content = msg?.caption || '📸 Imagen';
        } else if (messageType === 'videoMessage') {
            content = msg?.caption || '🎥 Video';
        } else if (messageType === 'stickerMessage') {
            content = '🖼️ Sticker';
        } else if (messageType === 'documentWithCaptionMessage') {
            content = msg?.message?.documentMessage?.caption || '📄 Documento';
        } else {
            content = `📦 [${messageType.replace('Message', '')}]`;
        }

        if (!isGroup && !isRealOwner) {
            const body = content.trim().toLowerCase();
            const prefixes = config.allPrefixes || ['#', '!', '.'];
            const foundPrefix = prefixes.find(p => body.startsWith(p));
            
            const commandName = foundPrefix 
                ? body.slice(foundPrefix.length).trim().split(/ +/).shift()
                : body.trim().split(/ +/).shift();

            const allowedPrivateCmds = ['code', 'codemood', 'setname', 'setbanner'];
            if (!allowedPrivateCmds.includes(commandName)) return;
        }

        const time = new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const pushName = m.key.fromMe ? 'PIXEL-CREW (YO)' : (m.pushName || 'Usuario');
        const number = senderNumber;

        const chatLabel = isGroup ? chalk.black.bgMagenta(' GRUPO ') : chalk.black.bgCyan(' PRIVADO ');
        const timeLabel = chalk.gray(`[${time}]`);
        const userLabel = m.key.fromMe ? chalk.greenBright(`${pushName}`) : chalk.yellow(`${pushName} (${number})`);
        const typeLabel = chalk.blueBright(`[${messageType.replace('Message', '').toUpperCase()}]`);

        console.log(`${timeLabel} ${chatLabel} ${userLabel} ${typeLabel}: ${chalk.white(content.substring(0, 70))}${content.length > 70 ? '...' : ''}`);

    } catch (e) {
        console.error(chalk.red(`  [⚠️ Logger Error]: ${e.message}`));
    }
};