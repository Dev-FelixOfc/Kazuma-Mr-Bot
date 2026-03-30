import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda', 'menu'],
    category: 'main',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix }) => {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
            const baileysVersion = pkg.dependencies['@whiskeysockets/baileys']?.replace('^', '') || '6.6.0';
            const totalCommands = global.commands.size;

            const textoMenu = `¡Hola! Soy *${config.botName}*, un placer atenderte.

┌──── *INFO - BOT* ────┐
│ Owner: Félix
│ Comandos: ${totalCommands}
│ Baileys: ${baileysVersion}
└──────────────┘

*» (❍ᴥ❍ʋ) \`MAIN\` «*
> ꕥ Comandos principales del bot.

*✿︎ ${prefix}help • ${prefix}menu • ${prefix}ayuda*
> ❀ Solicita la lista y descripción de comandos del bot.
*✿︎ ${prefix}p • ${prefix}ping*
> ❀ Calcula la latencia del bot.
*✿︎ ${prefix}botinfo • ${prefix}infobot*
> ❀ Mira información detallada del sistema operativo del bot.

*» (❍ᴥ❍ʋ) \`OWNER\` «*
*✿︎ ${prefix}up • ${prefix}update • ${prefix}getpull*
> ❀ Actualiza el servidor a lo archivos actuales del repositorio git.`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: 'Kazuma',
                        body: 'Kazuma Bot | Developed by Félix',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://github.com/Dev-FelixOfc/Kazuma-Mr-Bot',
                        mediaType: 1,
                        renderLargerThumbnail: true, // Se mantiene GRANDE como querías
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;