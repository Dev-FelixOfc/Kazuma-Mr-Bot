export const getRPGRole = (minerals) => {
    const total = Object.values(minerals).reduce((a, b) => a + b, 0);

    if (total < 50) return { name: 'Novato de las Cuevas', emoji: '🔦' };
    if (total < 150) return { name: 'Explorador de Hierro', emoji: '⛏️' };
    if (total < 350) return { name: 'Minero de Élite', emoji: '⚒️' };
    if (total < 700) return { name: 'Maestro de Gemas', emoji: '💎' };
    if (total < 1200) return { name: 'Señor de los Tesoros', emoji: '👑' };
    if (total < 2000) return { name: 'Leyenda de las Minas', emoji: '📜' };
    
    return { name: 'Semidiós del Olimpo Mineral', emoji: '🌌' };
};