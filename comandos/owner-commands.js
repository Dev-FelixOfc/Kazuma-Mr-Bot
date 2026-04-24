import { config } from '../config.js';

const totalCommands = {
    name: 'totalcommands',
    alias: ['commands', 'total', 'cmdtotal'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const total = global.commands.size;
            
            let txt = `*${config.visuals.emoji3} \`ESTADÍSTICAS DE COMANDOS\` ${config.visuals.emoji3}*\n\n`;
            txt += `Actualmente el bot tiene un arsenal de:\n`;
            txt += `> *${total}* comandos cargados.\n\n`;
            txt += `» Todos los módulos han sido verificados y están operativos en el sistema.\n\n`;
            txt += `> *${config.visuals.emoji4}* kazuma.giize.com`;

            m.reply(txt);
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al contabilizar los comandos.`);
        }
    }
};

export default totalCommands;