// Configuración de partes habilitadas

export const PARTS_CONFIG = {
    parte1: true,  // Cambiar a true para habilitar Parte 1
    parte2: false,  // Cambiar a true para habilitar Parte 2
    parte3: false,  // Cambiar a true para habilitar Parte 3
    parte4: false,  // Cambiar a true para habilitar Parte 4
};

// Función helper para verificar si una parte está habilitada
export const isPartEnabled = (partNumber: number): boolean => {
    const partKey = `parte${partNumber}` as keyof typeof PARTS_CONFIG;
    return PARTS_CONFIG[partKey] || false;
};
