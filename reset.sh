#!/bin/bash

# ==========================================
#   🛠️ SCRIPT DE MANTENIMIENTO KAZUMA-BOT
#   👑 CREADOR: Félix OFC (Dev-FelixOfc)
#   📝 NOTA: Este script sirve para limpiar 
#      la sesión actual del bot y forzar un 
#      nuevo código de vinculación. Úsalo si 
#      quieres cambiar de número o si la 
#      sesión está corrupta.
# ==========================================

# Colores para la consola
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}------------------------------------------${NC}"
echo -e "${GREEN}    INICIANDO LIMPIEZA DE KAZUMA-BOT      ${NC}"
echo -e "${CYAN}------------------------------------------${NC}"

# Paso 1: Borrar carpeta de sesión principal
if [ -d "sesion_bot" ]; then
    echo -e "${RED}[!] Borrando sesión del Bot Principal...${NC}"
    rm -rf sesion_bot
else
    echo -e "${GREEN}[✓] La sesión principal ya está limpia.${NC}"
fi

# Paso 2: Borrar sesiones de sub-bots (opcional si usas la carpeta)
if [ -d "sesiones_subbots" ]; then
    echo -e "${RED}[!] Borrando sesiones de Sub-Bots...${NC}"
    rm -rf sesiones_subbots
fi

# Paso 3: Reiniciar el proceso
echo -e "${CYAN}[ℹ️] Reiniciando servidor para nueva vinculación...${NC}"
echo -e "${GREEN}------------------------------------------${NC}"

npm start