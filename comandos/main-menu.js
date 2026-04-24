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

            const textoMenu = `¡Hola! Soy ${config.botName} (${botType}).

*☞︎︎︎ Aqui está mi lista de comandos ☜︎︎︎*

┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ kazuma.giize.com/Dev-FelixOfc
┃ ✐ *Commands* »
┃ kazuma.giize.com/commands
┃ ✐ *Upload* »
┃ upload.yotsuba.giize.com
┃ ✐ *Official channel* »
┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯
‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
*» (❍ᴥ❍ʋ) \`MAIN\` «*
> ꕥ Comandos principales del bot.

*✿︎ ${prefix}help • ${prefix}menu • ${prefix}ayuda*
> ❀ Solicita la lista de comandos.
*✿︎ ${prefix}p • ${prefix}ping*
> ❀ Calcular la latencia del bot.
*✿︎ ${prefix}infobot • ${prefix}status*
> ❀ Mirar información detallada del bot.

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
*✿︎ ${prefix}delsession*
> ❀ Elimina tu sesión de subbot.

‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
*» (❍ᴥ❍ʋ) \`GACHA\` «*
> ꕥ Comandos para colecciona personajes y competir en el mercado global.

*✿︎ ${prefix}rw • ${prefix}roll • ${prefix}waifu*
> ❀ Lanza un dado para encontrar un personaje aleatorio.
*✿︎ ${prefix}c • ${prefix}claim • ${prefix}reclamar*
> ❀ Reclama y compra al personaje que acaba de salir.
*✿︎ ${prefix}harem • ${prefix}inventario • ${prefix}mis-pjs*
> ❀ Mira tu colección de personajes con sus IDs.
*✿︎ ${prefix}sell • ${prefix}vender*
> ❀ Pon un personaje en venta (Valor + ¥1,000 mín).
*✿︎ ${prefix}haremshop • ${prefix}tienda*
> ❀ Mira el catálogo de personajes en venta por otros usuarios.
*✿︎ ${prefix}buy • ${prefix}comprar*
> ❀ Adquiere un personaje del mercado de usuarios.
*✿︎ ${prefix}unsell • ${prefix}retirar*
> ❀ Quita tu personaje de la lista de ventas.
*✿︎ ${prefix}trade • ${prefix}cambiar*
> ❀ Intercambia personajes con otros usuarios.
*✿︎ ${prefix}vote • ${prefix}despedir*
> ❀ Libera a un personaje de tu propiedad.

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
> ❀ Descarga videos de YouTube en formato de documento.

*» (❍ᴥ❍ʋ) \`TOOLS\` «*
> ꕥ Herramientas útiles.

*✿︎ ${prefix}tourl • ${prefix}subir*
> ❀ Convierte una imagen o sticker en un enlace de Yotsuba Cloud.

*» (❍ᴥ❍ʋ) \`OWNER\` «*
> ꕥ Comandos del creador.

*✿︎ ${prefix}update • ${prefix}up*
> ❀ Actualiza el servidor via Git.
*✿︎ ${prefix}backup (db)*
> ❀ El bot envía el contenido actual de la base de datos pedida.
*✿︎ ${prefix}deletesession all/(session)*
> ❀ El bot elimina todas las sesiones de subbots o una sola.`;

            await conn.sendMessage(m.chat, { 
                image: { url: config.visuals.img1 }, 
                caption: textoMenu
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;