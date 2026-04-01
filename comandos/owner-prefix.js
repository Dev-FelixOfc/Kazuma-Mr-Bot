/* KURAYAMI TEAM - UNIVERSAL OWNER COMMAND
   Sistema: Identidad Dual (LID/JID) desde Config
*/

export default {
    name: 'setprefix',
    alias: ['prefix'],
    category: 'owner',
    isOwner: true, // 🚩 EL HANDLER YA SABE QUIÉN ERES (LID O JID)

    run: async (conn, m, { args, config, isOwner }) => {
        // Validación de Seguridad Definitiva
        if (!isOwner) return; // Si el handler falló (improbable), esto es el doble candado

        const newPrefix = args[0];
        if (!newPrefix) return m.reply('❌ Indica el nuevo prefijo.');

        // Lógica de ejecución...
        // Aquí el bot ya sabe que eres Félix (5735... o 1258...)
        // porque el 'isOwner' viene de comparar m.sender con config.owner
        
        await m.reply(`✅ Prefijo cambiado a: ${newPrefix}`);
    }
};