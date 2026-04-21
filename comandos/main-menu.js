import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#';
            const botType = config.getBotType(conn);
            const totalCommands = global.commands.size;

            const textoMenu = `¡Hola! Soy ${config.botName} *(${botType})*.
Aqui está mi lista de comandos
┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ Félix
┃ ✐ *Commands* »
┃ kazuma.giize.com/commands
┃ ✐ *Upload* »
┃ upload.yotsuba.giize.com
┃ ✐ *Official channel* »
┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯
‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
*» (❍ᴥ❍ʋ) \`MAIN\` «*
> ꕥ Comandos principales del bot.

*✿︎ ${prefix}help • ${prefix}menu • ${prefix}ayuda*
> ❀ Solicita la lista de comandos.
*✿︎ ${prefix}p • ${prefix}ping*
> ❀ Latencia del bot.

*» (❍ᴥ❍ʋ) \`ECONOMY\` «*
> ꕥ Comandos de economía para ganar dinero y competir por ser el más rico en el bot.

*✿︎ ${prefix}daily • ${prefix}diario*
> ❀ Reclama tu recompensa diaria de coins.
*✿︎ ${prefix}work • ${prefix}chamba*
> ❀ Trabaja duro para obtener un salario.
*✿︎ ${prefix}slut • ${prefix}escenario*
> ❀ Arriésgate en el escenario para ganar dinero.
*✿︎ ${prefix}crime • ${prefix}crimen*
> ❀ Comete actos ilícitos para obtener grandes sumas.
*✿︎ ${prefix}baltop • ${prefix}topmoney*
> ❀ Mira el ranking global de los usuarios más ricos.
*✿︎ ${prefix}deposit • ${prefix}dep*
> ❀ Asegura tus coins enviándolas al banco.
*✿︎ ${prefix}pay • ${prefix}transferir*
> ❀ Envía dinero de tu banco a otros usuarios.
*✿︎ ${prefix}coinflip • ${prefix}flip*
> ❀ Apuesta ¥1,000 en un cara o cruz.
*✿︎ ${prefix}economy • ${prefix}economía*
> ❀ Consulta tus balances y tiempos de espera.

*» (❍ᴥ❍ʋ) \`SOCKETS\` «*
> ꕥ Comandos de los subbots.

*✿︎ ${prefix}code*
> ❀ Hazte SubBot de ${config.botName}.
*✿︎ ${prefix}bots • ${prefix}sockets*
> ❀ Mira la lista de sockets activos.

*» (❍ᴥ❍ʋ) \`GESTIÓN\` «*
> ꕥ Comandos de grupo.

*✿︎ ${prefix}detect on/off*
> ❀ Avisos en el grupo.
*✿︎ ${prefix}antilink on/off*
> ❀ Protector de enlaces.

*» (❍ᴥ❍ʋ) \`ADMINS\` «*
> ꕥ Comandos para admins del grupo.

*✿︎ ${prefix}setprimary • ${prefix}solotu*
> ❀ Establece a un socket como principal del grupo.
*✿︎ ${prefix}delprimary*
> ❀ Haz que todos los sockets vuelvan a responder en el grupo.

*» (❍ᴥ❍ʋ) \`DESCARGAS\` «*
> ꕥ Descarga cosas en diferentes redes.

*✿︎ ${prefix}ytv* • *${prefix}playvideo*
> ❀ Descarga videos/audios de YouTube.
*✿︎ ${prefix}play • ${prefix}playaudio*
> ❀ Descarga videos de YouTube como audio.
*✿︎ ${prefix}playdoc*
Descarga videos de YouTube en formato de documento.

*» (❍ᴥ❍ʋ) \`TOOLS\` «*
> ꕥ Herramientas útiles.

*✿︎ ${prefix}tourl • ${prefix}subir*
> ❀ Convierte una imagen o sticker en un enlace de Yotsuba Cloud.

*» (❍ᴥ❍ʋ) \`OWNER\` «*
> ꕥ Comandos del creador.

*✿︎ ${prefix}update*
> ❀ Actualiza el servidor via Git.`;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: `${config.botName}`,
                        body: 'Kazuma Bot | Developed by Félix',
                        thumbnailUrl: config.visuals.img1, 
                        sourceUrl: 'https://kazuma.giize.com', 
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;
