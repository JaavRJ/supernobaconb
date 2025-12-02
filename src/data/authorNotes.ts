// Author Notes - Notas del autor para términos y conceptos en el texto

export interface AuthorNote {
    id: string;
    partNumber: number;
    chapterIndex: number;
    triggerText: string; // Texto que activa la nota
    noteTitle: string;
    noteContent: string;
    type: 'tooltip' | 'modal'; // tooltip para notas breves, modal para extensas
}

// Notas para Parte 1: Nebulosa
export const PART_1_NOTES: AuthorNote[] = [
    {
        id: '1',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'Cielo Estrellado',
        noteTitle: 'Cielo Estrellado',
        noteContent: 'Hola, ¿qué tal? A lo largo del libro encontrarás estas notas, y podrás hacer clic en ellas para obtener más información. Los quiero mucho.',
        type: 'tooltip'
    },
    {
        id: '2',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'Para Brillo',
        noteTitle: 'Cartas',
        noteContent: 'A lo largo de todo el libro, al final de cada capítulo se incluyen fragmentos de cartas.',
        type: 'modal'
    },
    {
        id: '6',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'James Joyce',
        noteTitle: 'Retrato de un artista adolescente   ',
        noteContent: 'Este libro, Retrato de un artista adolescente, me costó muchísimo terminarlo, pero me abrió mucho la perspectiva sobre cómo construir la psicología de un personaje.',
        type: 'tooltip'
    },
    {
        id: '3',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'guardapelo',
        noteTitle: 'Guardapelos',
        noteContent: 'Cuando lo imagino, siempre pienso en el de Harry Potter, pero en general son muy bellos. Si quieren regalar algo diferente, pueden dar uno de ellos.',
        type: 'tooltip'
    },
    {
        id: '4',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'recién mojada',
        noteTitle: 'Preticor',
        noteContent: 'El olor a tierra mojada sí tiene nombre: se llama petricor. PD. Hay un artista muy bueno llamado Lio Petricor.',
        type: 'tooltip'
    },
    {
        id: '5',
        partNumber: 1,
        chapterIndex: 0,
        triggerText: 'sino bajo la tierra',
        noteTitle: 'Rios',
        noteContent: 'Hay un río llamado río Hamza que se extiende a 4 km de profundidad bajo el Amazonas. Se podría decir que es un río subterráneo.',
        type: 'tooltip'
    },
];

// Notas para Parte 2: Gigante Roja
export const PART_2_NOTES: AuthorNote[] = [
    {
        id: 'p2c1-anos-luz-def',
        partNumber: 2,
        chapterIndex: 0,
        triggerText: '9.5 billones de kilómetros',
        noteTitle: 'Un Año Luz',
        noteContent: 'Un año luz = 9,460,730,472,580.8 km. Para ponerlo en perspectiva: si pudieras viajar a la velocidad de un avión comercial (900 km/h), tardarías más de 1 millón de años en recorrer un solo año luz.',
        type: 'tooltip'
    },
    {
        id: 'p2c2-fusion-nuclear',
        partNumber: 2,
        chapterIndex: 1,
        triggerText: 'fusión nuclear',
        noteTitle: 'Fusión Nuclear en las Estrellas',
        noteContent: 'La fusión nuclear es el proceso donde núcleos de hidrógeno se combinan para formar helio, liberando energía masiva. Este proceso requiere temperaturas de millones de grados y presiones extremas. Es la misma reacción que intentamos replicar en reactores de fusión en la Tierra para energía limpia.',
        type: 'modal'
    },
    {
        id: 'p2c2-polvo-estrellas',
        partNumber: 2,
        chapterIndex: 1,
        triggerText: 'polvo de estrellas',
        noteTitle: 'Somos Polvo de Estrellas',
        noteContent: 'Todos los elementos pesados en tu cuerpo (carbono, nitrógeno, oxígeno, hierro) fueron forjados en el núcleo de estrellas masivas y dispersados por el universo cuando explotaron como supernovas. Literalmente estamos hechos del mismo material que las estrellas.',
        type: 'tooltip'
    }
];

// Función helper para obtener notas de una parte/capítulo específico
export const getAuthorNotes = (partNumber: number, chapterIndex?: number): AuthorNote[] => {
    const allNotes = [...PART_1_NOTES, ...PART_2_NOTES];

    if (chapterIndex !== undefined) {
        return allNotes.filter(
            note => note.partNumber === partNumber && note.chapterIndex === chapterIndex
        );
    }

    return allNotes.filter(note => note.partNumber === partNumber);
};

// Función para aplicar notas al HTML
export const applyAuthorNotesToHTML = (
    htmlContent: string,
    notes: AuthorNote[]
): string => {
    let result = htmlContent;

    // Ordenar por longitud de texto (más largo primero) para evitar reemplazos anidados
    const sortedNotes = [...notes].sort((a, b) => b.triggerText.length - a.triggerText.length);

    sortedNotes.forEach(note => {
        // Escapar caracteres especiales en el texto trigger
        const escapedText = note.triggerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');

        // Reemplazar con span que tiene data attributes
        result = result.replace(
            regex,
            `<span class="author-note-trigger" data-note-id="${note.id}" data-note-type="${note.type}">$1<sup class="note-icon">${note.id}</sup></span>`
        );
    });

    return result;
};
