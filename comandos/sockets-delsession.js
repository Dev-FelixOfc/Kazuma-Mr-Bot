import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');

const delSession = {
    name: 'delsession',
    alias: ['cerrarsesion', 'out'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const isOwner = config.owner.includes(m.sender);
            
            // Solo el dueño del subbot o el owner principal pueden usarlo
            if (conn.user.id.split(':')[0] !== user && !isOwner) {
                return m.reply(`*${config.visuals.emoji2}* Solo el dueño de este socket puede cerrar su propia sesión.`);
            }

            const userSessionPath = path.join(sessionsPath, user);

            await m.reply(`*${config.visuals.emoji3}* Cerrando sesión y eliminando datos...`);

            // 1. Quitar de la memoria global
            global.subBots.delete(m.sender.split(':')[0] + '@s.whatsapp.net');

            // 2. Eliminar carpeta de sesión
            if (fs.existsSync(userSessionPath)) {
                fs.rmSync(userSessionPath, { recursive: true, force: true });
            }

            // 3. Desconectar socket
            await conn.logout();
            await conn.end();

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al cerrar la sesión.`);
        }
    }
};

export default delSession;