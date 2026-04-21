import fs from 'fs';
import path from 'path';

export const config = {
    botName: 'Kazuma',
    owner: [
        '573508941325@s.whatsapp.net', 
        '125860308893859@lid'
    ], 
    prefix: '#',
    allPrefixes: ['#', '!', '.'],

    getBotType: (conn) => {
        const userNumber = conn.user.id.split(':')[0];
        const subBotPath = path.resolve(`./sesiones_subbots/${userNumber}`);
        return fs.existsSync(subBotPath) ? 'Sub-Bot' : 'Mood';
    },

    visuals: {
        line: '━',
        color: 'magenta',
        emoji1: '✰',
        emoji2: '❁',
        emoji3: '✿',
        emoji4: '❀',
        img1: 'https://files.catbox.moe/9ssbf9.jpg'
    },

    apiYT: 'NEX-0868C926ADF94B19A51E18C4',
    stellarKey: 'api-Bb1JX'
};