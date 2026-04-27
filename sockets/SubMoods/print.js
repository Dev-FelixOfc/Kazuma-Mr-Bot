import chalk from 'chalk';
import { config } from '../../config.js';

export const moodLogger = (m, conn) => {
    try {
        if (!m || !m.message || !m.key || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const botName = config.botName;
        const name = m.pushName || 'Usuario';
        const senderNumber = (m.key.participant || from).split('@')[0];
        const time = new Date().toLocaleTimeString();

        const type = Object.keys(m.message).find(t => t !== 'senderKeyDistributionMessage' && t !== 'messageContextInfo') || '';
        if (!type || type === 'protocolMessage') return;

        let body = '';
        if (type === 'conversation') body = m.message.conversation;
        else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage?.text || '';
        else body = `[Archivo: ${type.replace('Message', '')}]`;

        const boxWidth = 50;
        const line = '═'.repeat(boxWidth);
        const top = chalk.magenta(`╔${line}╗`);
        const bottom = chalk.magenta(`╚${line}╝`);
        const div = chalk.magenta(`╟${'─'.repeat(boxWidth)}╢`);

        console.log(`
${top}
${chalk.magenta('║')} ${chalk.bold.cyan('SOCKET:')} ${chalk.white(`SubMood - ${botName}`)} ${' '.repeat(Math.max(0, boxWidth - 11 - botName.length - 10))}${chalk.magenta('║')}
${div}
${chalk.magenta('║')} ${chalk.yellow('USER:')} ${chalk.white(name.substring(0, 15))} ${chalk.gray(`(${senderNumber})`)} ${' '.repeat(Math.max(0, boxWidth - 8 - name.substring(0, 15).length - senderNumber.length - 4))}${chalk.magenta('║')}
${chalk.magenta('║')} ${chalk.yellow('CHAT:')} ${chalk.white(isGroup ? 'Grupo' : 'Privado')} ${' '.repeat(boxWidth - 14)}${chalk.magenta('║')}
${chalk.magenta('║')} ${chalk.yellow('TIME:')} ${chalk.white(time)} ${' '.repeat(boxWidth - 13)}${chalk.magenta('║')}
${div}
${chalk.magenta('║')} ${chalk.bold.white('MSG:')} ${chalk.italic.green(body.substring(0, boxWidth - 6))} ${' '.repeat(Math.max(0, boxWidth - 5 - body.substring(0, boxWidth - 6).length))}${chalk.magenta('║')}
${bottom}
        `);

    } catch (e) {}
};