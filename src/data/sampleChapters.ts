// Estructura de capítulos organizados por partes
export interface Chapter {
    number: string;
    title: string;
    content: string;
}

export interface Part {
    partNumber: number;
    partTitle: string;
    chapters: Chapter[];
}

// PARTE 1: Nebulosa
export const PART_1_CHAPTERS: Chapter[] = [
    {
        number: "1",
        title: "Cielo Estrellado",
        content: `En la inmensidad del cosmos, donde las estrellas danzan en un ballet eterno de luz y oscuridad, existe un fenómeno que desafía toda comprensión humana. Las nebulosas, esas nubes de gas y polvo cósmico, son los viveros donde nacen las estrellas, los lugares donde la materia se condensa y la gravedad teje su magia ancestral.

Observar el cielo nocturno es contemplar el pasado. La luz que llega a nuestros ojos ha viajado durante años, décadas, incluso milenios. Cada punto brillante en la bóveda celeste es una ventana al tiempo, un recordatorio de que somos parte de algo infinitamente más grande que nosotros mismos.

Las constelaciones que nuestros ancestros nombraron siguen ahí, inmutables testigos de la historia humana. Orión el cazador, Casiopea la reina, la Osa Mayor... nombres que han sobrevivido civilizaciones enteras, mientras las estrellas que las forman continúan su lento vals cósmico.

Pero el cielo estrellado guarda secretos más profundos. Entre las estrellas visibles se esconden agujeros negros, púlsares, y galaxias enteras esperando ser descubiertas. El universo es un libro abierto escrito en el lenguaje de la luz, y nosotros apenas estamos aprendiendo a leer sus primeras páginas.

La soledad del espacio es absoluta. Entre las estrellas, el vacío reina supremo. Un silencio tan profundo que ningún sonido podría atravesarlo. Y sin embargo, en ese vacío aparentemente muerto, la vida encontró la manera de florecer en al menos un pequeño planeta azul.

Cada noche, cuando miramos hacia arriba, participamos en un ritual tan antiguo como la humanidad misma. Nuestros antepasados miraban las mismas estrellas, se hacían las mismas preguntas. ¿Estamos solos? ¿Qué hay más allá? ¿Cuál es nuestro lugar en este vasto cosmos?

Las respuestas, si es que existen, están escritas en la luz de las estrellas. Esperando pacientemente a que desarrollemos los ojos para verlas, la mente para comprenderlas, y el corazón para aceptar lo que descubramos.`
    },
    {
        number: "2",
        title: "Soledad",
        content: `La soledad del espacio es diferente a cualquier soledad terrestre. No es simplemente estar solo; es estar separado de todo lo que conoces por distancias tan vastas que la mente humana apenas puede concebirlas.

Un astronauta flotando en el vacío experimenta una soledad absoluta. Rodeado por la nada, con la Tierra como un pequeño punto azul en la distancia, se enfrenta a la realidad más cruda de nuestra existencia: somos increíblemente pequeños en un universo increíblemente grande.

Pero la soledad también puede ser liberadora. En el silencio del espacio, lejos del ruido y la confusión de la vida cotidiana, uno puede encontrar una claridad que es imposible en la Tierra. Los pensamientos fluyen sin obstáculos, las ideas se cristalizan con una pureza inusual.

Las estrellas son compañeras solitarias. Cada una brilla en su propio rincón del cosmos, separada de sus hermanas por años luz de vacío. Y sin embargo, están conectadas por la gravedad, por la historia compartida de su nacimiento en la misma nebulosa, por el destino común que eventualmente las espera.

La humanidad ha luchado contra la soledad desde sus inicios. Construimos ciudades, formamos comunidades, creamos arte y música para llenar el vacío. Pero quizás la soledad no es algo que deba ser vencido, sino algo que debe ser comprendido y aceptado.

En la soledad encontramos nuestra verdadera naturaleza. Sin las distracciones del mundo exterior, nos enfrentamos a nosotros mismos sin máscaras ni pretensiones. Es en estos momentos de quietud cuando podemos escuchar la voz interior que normalmente se pierde en el ruido.

El espacio nos enseña que la soledad y la conexión no son opuestos, sino dos caras de la misma moneda. Estamos solos en nuestras experiencias individuales, pero conectados por nuestra humanidad compartida, por nuestro origen común en el polvo de estrellas.`
    }
];

// PARTE 2: Gigante Roja
export const PART_2_CHAPTERS: Chapter[] = [
    {
        number: "3",
        title: "Lejanía",
        content: `La distancia en el espacio se mide en años luz, una unidad tan vasta que desafía la comprensión intuitiva. Un año luz es la distancia que la luz recorre en un año: aproximadamente 9.5 billones de kilómetros. Y las estrellas más cercanas están a varios años luz de distancia.

Esta lejanía no es solo física; es temporal. Cuando miramos una estrella a 100 años luz de distancia, la vemos como era hace un siglo. El presente de esa estrella es inaccesible para nosotros, separado por el límite absoluto de la velocidad de la luz.

La lejanía crea perspectiva. Desde la Luna, la Tierra parece pequeña. Desde Marte, es apenas visible. Desde los confines del sistema solar, es un punto pálido azul, como lo describió Carl Sagan. Y desde otra galaxia, nuestro sistema solar entero sería invisible.

Esta perspectiva es humillante y liberadora al mismo tiempo. Nuestros problemas, que parecen tan importantes, se vuelven insignificantes cuando se ven desde la distancia cósmica. Las guerras, los conflictos, las preocupaciones diarias... todo parece trivial cuando se contempla desde la vastedad del espacio.

Pero la lejanía también nos une. Todos estamos en la misma pequeña roca flotando en el vacío. Las fronteras que dibujamos en los mapas son invisibles desde el espacio. Las diferencias que nos separan palidecen ante la realidad de nuestra existencia compartida.

Los viajeros espaciales hablan de un fenómeno llamado "efecto de perspectiva general" - una transformación cognitiva que ocurre al ver la Tierra desde el espacio. De repente, las divisiones artificiales desaparecen y se ve la humanidad como una sola especie en un solo planeta.

La lejanía nos recuerda que somos visitantes temporales en este cosmos. Nuestro tiempo aquí es breve, un parpadeo en la escala temporal del universo. Pero en ese breve momento, tenemos la oportunidad de maravillarnos, de explorar, de comprender.`
    },
    {
        number: "4",
        title: "Calor",
        content: `Las estrellas son hornos nucleares, fusionando hidrógeno en helio y liberando cantidades inimaginables de energía en el proceso. El calor que generan es tan intenso que la materia existe en un estado que no encontramos naturalmente en la Tierra: plasma.

Nuestro Sol, una estrella de tamaño medio, tiene una temperatura superficial de aproximadamente 5,500 grados Celsius. Pero en su núcleo, donde ocurre la fusión nuclear, la temperatura alcanza los 15 millones de grados. A estas temperaturas, los átomos se mueven tan rápido que se fusionan, liberando la energía que hace posible la vida en la Tierra.

El calor de las estrellas viaja a través del vacío del espacio en forma de radiación electromagnética. La luz que sentimos como calor en nuestra piel ha viajado 150 millones de kilómetros desde el Sol, atravesando el vacío absoluto del espacio en solo 8 minutos.

Pero el calor estelar no es solo físico; es también metafórico. Las estrellas son faros de esperanza en la oscuridad, símbolos de constancia en un universo cambiante. Su luz cálida nos ha guiado durante milenios, tanto literal como figurativamente.

Cada estrella tiene su propio ciclo de vida, determinado en gran parte por su masa. Las estrellas más masivas arden con más intensidad, consumiendo su combustible rápidamente y viviendo vidas cortas pero espectaculares. Las estrellas más pequeñas arden lentamente, viviendo billones de años.

Al final de su vida, las estrellas masivas explotan en supernovas, eventos tan energéticos que por un breve momento pueden brillar más que galaxias enteras. En estas explosiones, se forjan los elementos pesados que componen nuestros cuerpos. Somos, literalmente, polvo de estrellas.

El calor de las estrellas muertas persiste en forma de nebulosas planetarias y remanentes de supernova, recordatorios brillantes de que incluso en la muerte, las estrellas continúan iluminando el cosmos.`
    }
];

// PARTE 3: Placeholder (agrega tus capítulos aquí)
export const PART_3_CHAPTERS: Chapter[] = [
    {
        number: "5",
        title: "Capítulo 5 - Placeholder",
        content: "Contenido del capítulo 5..."
    }
];

// PARTE 4: Placeholder (agrega tus capítulos aquí)
export const PART_4_CHAPTERS: Chapter[] = [
    {
        number: "6",
        title: "Capítulo 6 - Placeholder",
        content: "Contenido del capítulo 6..."
    }
];

// Exportar todas las partes organizadas
export const ALL_PARTS: Part[] = [
    {
        partNumber: 1,
        partTitle: "Nebulosa",
        chapters: PART_1_CHAPTERS
    },
    {
        partNumber: 2,
        partTitle: "Gigante Roja",
        chapters: PART_2_CHAPTERS
    },
    {
        partNumber: 3,
        partTitle: "Enana Blanca",
        chapters: PART_3_CHAPTERS
    },
    {
        partNumber: 4,
        partTitle: "Agujero Negro",
        chapters: PART_4_CHAPTERS
    }
];

// Helper function para obtener capítulos de una parte
export const getPartChapters = (partNumber: number): Chapter[] => {
    const part = ALL_PARTS.find(p => p.partNumber === partNumber);
    return part ? part.chapters : [];
};
