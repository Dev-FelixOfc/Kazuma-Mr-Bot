import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar de nuevo.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // 1. TRUCO: Si pusiste el ID directo (ej: #claim 16)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // 2. DETECCIÓN POR RESPUESTA: Escáner mejorado
            else if (m.quoted) {
                // Obtenemos el texto del mensaje citado, ya sea de un texto o de una imagen (caption)
                const quotedText = m.quoted.text || m.quoted.caption || '';
                
                // Buscamos el ID ignorando formatos y cortes
                const idMatch = quotedText.match(/ID\s*»\s*(\d+)/i);
                if (idMatch) {
                    pjId = idMatch[1];
                }
            }

            if (!pjId || !gachaDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* ¿Qué intentas reclamar? Responde a un mensaje de #rw o usa #claim (ID).`);
            }
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Este ya tiene dueño.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            if (ecoDB[user].wallet < pj.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero. Cuesta ¥${pj.value.toLocaleString()}`);
            }

            // Transacción
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}*! Pagaste ¥${pj.value.toLocaleString()}.\n\n> *Truco:* Ahora puedes ver tus personajes en la base de datos.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;
