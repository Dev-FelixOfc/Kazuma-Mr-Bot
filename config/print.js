import chalk from 'chalk';

/**
 * Monitor de consola estético para Kazuma-Bot
 * Versión corregida para evitar cierres inesperados en Termux/Pterodactyl.
 */
export const logger = (m, conn) => {
    try {
        // 1. VALIDACIÓN INICIAL: Si no hay mensaje o llave, ignoramos para evitar el crash
        if (!m || !m.message || !m.key) return;

        // 2. Obtener la hora actual
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // 3. Identificar el remitente de forma segura
        const from = m.key.remoteJid;
        if (!from) return; // Si no hay JID, fuera.

        const isGroup = from.endsWith('@g.us');
        
        // CORRECCIÓN CRÍTICA: Validar que el sender exista antes de hacer split
        const sender = isGroup ? (m.key.participant || from) : from;
        const pushName = m.pushName || 'Usuario';
        
        // Si por alguna razón sender es nulo, usamos '0' para que no explote
        const number = sender ? sender.split('@')[0] : '000000';

        // 4. Identificar el tipo de mensaje y contenido
        const messageType = Object.keys(m.message)[0];
        if (!messageType) return;

        let content = '';

        // Extraer texto con validaciones de existencia
        if (messageType === 'conversation') {
            content = m.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            content = m.message.extendedTextMessage?.text || '';
        } else if (messageType === 'imageMessage') {
            content = m.message.imageMessage?.caption || '📸 Imagen';
        } else if (messageType === 'videoMessage') {
            content = m.message.videoMessage?.caption || '🎥 Video';
        } else if (messageType === 'stickerMessage') {
            content = '🖼️ Sticker';
        } else if (messageType === 'documentWithCaptionMessage') {
            content = m.message.documentWithCaptionMessage?.message?.documentMessage?.caption || '📄 Documento';
        } else if (messageType === 'protocolMessage' || messageType === 'senderKeyDistributionMessage') {
            return; // Ignorar mensajes internos de WhatsApp que causan ruido
        } else {
            content = `📦 Archivo: [${messageType.replace('Message', '')}]`;
        }

        // 5. Formatear la salida
        const chatLabel = isGroup ? chalk.black.bgMagenta(' GRUPO ') : chalk.black.bgCyan(' PRIVADO ');
        const timeLabel = chalk.gray(`[${time}]`);
        const userLabel = chalk.yellow(`${pushName} (${number})`);
        const typeLabel = chalk.blueBright(`[${messageType.replace('Message', '').toUpperCase()}]`);

        // Imprimir de forma limpia
        console.log(
            `${timeLabel} ${chatLabel} ${userLabel} ${typeLabel}: ${chalk.white(content.substring(0, 70))}${content.length > 70 ? '...' : ''}`
        );

    } catch (e) {
        // Si algo falla, el bot NO se apaga, solo muestra el error pequeño
        console.error(chalk.red(`  [⚠️ Logger Error]: ${e.message}`));
    }
};