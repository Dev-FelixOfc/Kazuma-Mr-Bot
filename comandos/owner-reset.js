import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';
import NodeCache from 'node-cache';

// Cache para manejar las confirmaciones (expira en 5 min)
const resetAuth = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const resetCommand = {
    name: 'borrar',
    alias: ['resetdb', 'clearout'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const folder = args[0];
            let file = args[1];

            // Si es la respuesta de confirmación
            if (m.quoted && m.quoted.text.includes('¿ESTÁS SEGURO?') && m.text.toLowerCase() === 'reset accept') {
                const session = resetAuth.get(m.quoted.id);
                
                if (!session) return m.reply(`*${config.visuals.emoji2}* El tiempo ha expirado o el mensaje no es válido.`);
                
                await m.reply(`*${config.visuals.emoji3}* \`RESETEANDO BASE DE DATOS...\``);

                const initialData = {
                    "573508941325": {
                        "wallet": 999999999, "bank": 999999999,
                        "daily": { "lastClaim": 0, "streak": 0 },
                        "crime": { "lastUsed": 0 }
                    }
                };

                await fs.writeJson(session.path, initialData, { spaces: 2 });
                resetAuth.del(m.quoted.id); // Eliminar oportunidad

                const successMsg = `*${config.visuals.emoji3} \`ÉXITO TOTAL\` ${config.visuals.emoji3}*\n\nLa base de datos \`${session.file}.json\` ha sido restaurada a valores de fábrica.`;
                
                // Mensaje en el chat actual
                await m.reply(successMsg);
                // Mensaje al privado del Owner
                await conn.sendMessage(m.sender, { text: successMsg });
                return;
            }

            // --- Lógica Inicial del Comando ---
            if (!folder || !file) return m.reply(`*${config.visuals.emoji2}* Uso: #borrar <carpeta> <archivo>`);
            
            file = file.replace(/\.json$/i, '');
            const dbPath = path.resolve(`./config/database/${folder}/${file}.json`);

            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* Archivo no encontrado.`);

            // Leer contenido silenciosamente
            const content = await fs.readJson(dbPath);

            const confirmMsg = await conn.sendMessage(m.chat, {
                text: `*${config.visuals.emoji3} ¿ESTÁS SEGURO? ${config.visuals.emoji3}*\n\nHas solicitado resetear: \`${folder}/${file}.json\`\n\nPara confirmar, responde a este mensaje con:\n> *reset accept*\n\n*Nota:* Tienes 5 minutos o la solicitud será anulada.`
            }, { quoted: m });

            // Guardar sesión en caché usando el ID del mensaje de confirmación
            resetAuth.set(confirmMsg.key.id, { path: dbPath, file: file, owner: m.sender });

            // Programar mensaje de anulación a los 5 minutos
            setTimeout(async () => {
                if (resetAuth.has(confirmMsg.key.id)) {
                    resetAuth.del(confirmMsg.key.id);
                    await conn.sendMessage(m.sender, { 
                        text: `*${config.visuals.emoji2} \`SOLICITUD ANULADA\` ${config.visuals.emoji2}*\n\nEl tiempo para resetear \`${file}.json\` ha expirado.` 
                    });
                }
            }, 300000); // 5 minutos

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de seguridad.`);
        }
    }
};

export default resetCommand;