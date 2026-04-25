import { config } from '../config.js';
import { getRPGRole } from './rpg-roles.js';

export const checkRankUpdate = async (conn, m, user, group, rpgDb) => {
    try {
        const userData = rpgDb[group][user];
        const newRoleData = getRPGRole(userData.minerals);
        const oldRole = userData.rank || 'Novato de las Cuevas';

        if (newRoleData.name !== oldRole) {
            userData.rank = newRoleData.name;
            
            const groupMetadata = await conn.groupMetadata(group);
            const groupName = groupMetadata.subject;

            const aviso = `*${config.visuals.emoji3} \`¡NUEVO RANGO!\` ${config.visuals.emoji3}*

¡Hola! Paso por aquí para avisarte que has alcanzado un nuevo rango en el grupo *${groupName}*.

*Rango Actual:* ${newRoleData.emoji} ${newRoleData.name}
*Rango Anterior:* ${oldRole}

> Sigue recolectando recursos en el grupo para seguir subiendo de nivel.`;

            await conn.sendMessage(user + '@s.whatsapp.net', { text: aviso });
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
    }
};