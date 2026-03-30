import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix }) => {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
            const baileysVersion = pkg.dependencies['@whiskeysockets/baileys'].replace('^', '');
            const totalCommands = global.commands.size;

            const textoMenu = `¡Hola! Soy *${config.botName}*, un placer atenderte.

Aquí tienes mi lista de comandos:

┌──── *INFO - BOT* ────┐
│ Owner: Félix
│ Comandos: ${totalCommands}
│ Baileys: ${baileysVersion}
└──────────────┘

*» (⁠*⁠_⁠*⁠) MAIN «*
> Comandos principales del bot.

*• ${prefix}menu • ${prefix}help*
> Solicita ver la lista y descripción de los comandos.

_Desarrollado con ❤️ por Félix_`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: 'Kazuma',
                        body: 'Kazuma Bot | Developed by Félix',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        sourceUrl: 'https://github.com',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error(err);
        }
    }
};

export default menuCommand;