// Fechas de publicación estimadas para cada parte (con hora)
export const PUBLICATION_DATES = {
    parte2: '2025-12-08T00:00:00',  // Cambia estas fechas según tu plan
    parte3: '2025-12-15T00:00:00',
    parte4: '2025-12-22T22:00:00',
    // Agrega más partes según necesites
};

// Información de cada parte para el calendario
export const PART_INFO = {
    parte2: {
        title: 'Brillo de una Estrella Muerta - Parte 2: Gigante Roja',
        description: 'La segunda parte de BDUM ya está disponible. No olvides seguirme!',
    },
    parte3: {
        title: 'Brillo de una Estrella Muerta - Parte 3: Supernoba',
        description: 'La tercera parte de BDUM ya está disponible. Llego el clímax!',
    },
    parte4: {
        title: 'Brillo de una Estrella Muerta - Parte 4: Enana Blanca',
        description: 'La cuarta parte de BDUM ya está disponible. El final no tiene porqué ser el final.',
    },
};

// Obtener fecha de publicación de una parte
export const getPublicationDate = (partNumber: number): string | null => {
    const key = `parte${partNumber}` as keyof typeof PUBLICATION_DATES;
    return PUBLICATION_DATES[key] || null;
};

// Obtener información de una parte
export const getPartInfo = (partNumber: number) => {
    const key = `parte${partNumber}` as keyof typeof PART_INFO;
    return PART_INFO[key] || null;
};

// Obtener el número de partes que ya están publicadas
export const getReleasedPartsCount = (): number => {
    const now = new Date();
    let releasedCount = 1; // Parte 1 siempre disponible

    // Check each part's release date
    for (let i = 2; i <= 4; i++) {
        const releaseDate = getPublicationDate(i);
        if (releaseDate && new Date(releaseDate) <= now) {
            releasedCount = i;
        }
    }

    return releasedCount;
};
