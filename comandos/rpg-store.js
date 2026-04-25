import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const shopCommand = {
    name: 'tienda',
    alias: ['shop', 'market', 'store'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const botNumber = conn.user.id.split(':')[0];
            const settingsPath = path.resolve(`./sesiones_subbots/${botNumber}/settings.json`);
            let displayShortName = config.botName;

            if (fs.existsSync(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.shortName) displayShortName = localData.shortName;
            }

            const textoTienda = `*${config.visuals.emoji3}* \`TIENDA DE ITEMS - ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*

Bienvenido al mercado oficial. Utiliza tus coins para adquirir ventajas exclusivas en tus aventuras:

🛒 *ARTÍCULOS DISPONIBLES*

1. 🧲 **Imán de Minas**
   > *Precio:* ¥25,000
   > *Efecto:* Duplica la obtención de minerales en tu próxima minería.

2. 🍀 **Trébol de la Suerte**
   > *Precio:* ¥40,000
   > *Efecto:* Protege tu carnada y elimina penalizaciones en tu próxima pesca.

3. 🛡️ **Escudo de Mazmorra**
   > *Precio:* ¥35,000
   > *Efecto:* Reduce el tiempo de espera de la mazmorra a la mitad por un uso.

4. 🧧 **Amuleto del Apostador**
   > *Precio:* ¥60,000
   > *Efecto:* Habilita una apuesta especial de hasta ¥30,000 en el duelo de PPT.

---
💡 *Instrucciones:* Para adquirir un artículo, utiliza el comando \`buy\` seguido del número o nombre del item.

> Los objetos se guardarán en tu inventario y se activarán automáticamente al usarlos.`;

            await conn.sendMessage(m.chat, { 
                image: { url: 'https://upload.yotsuba.giize.com/u/JXwecTzS.jpeg' }, 
                caption: textoTienda 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un problema al acceder al mercado.`);
        }
    }
};

export default shopCommand;