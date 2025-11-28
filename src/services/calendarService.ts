import { getPublicationDate, getPartInfo } from '../config/publicationDates';

/**
 * Genera un enlace "mágico" de Google Calendar.
 * No requiere API Keys, ni autenticación, ni verificación de Google.
 * Configurado para crear el evento y repetirlo semanalmente por 3 semanas.
 */
export const generateCalendarLink = (partNumber: number): string => {
    const publicationDate = getPublicationDate(partNumber);
    const partInfo = getPartInfo(partNumber);

    if (!publicationDate || !partInfo) {
        return '';
    }

    // Configurar fecha de inicio del evento (10:00 AM)
    const eventDate = new Date(publicationDate);
    eventDate.setHours(0, 0, 0, 0);

    // Configurar fecha de fin del evento (11:00 AM)
    const endDate = new Date(eventDate);
    endDate.setHours(23, 59, 59, 999);

    // Función auxiliar para formatear fechas al estándar de Google (YYYYMMDDTHHMMSSZ)
    // Elimina guiones, dos puntos y milisegundos.
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Construcción de los parámetros del enlace
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        // Título del evento
        text: `Estreno: ${partInfo.title} - Brillo de una estrella muerta`,
        // Descripción con recordatorio de que es recurrente
        details: `${partInfo.description}\n\nNota: Este recordatorio se ha configurado automáticamente para avisarte de esta parte y las de las próximas 2 semanas.`,
        // Fechas de inicio y fin
        dates: `${formatDate(eventDate)}/${formatDate(endDate)}`,
        // Zona horaria
        ctz: 'America/Mexico_City',
        // LA REGLA DE RECURRENCIA:
        // FREQ=WEEKLY: Se repite cada semana
        // COUNT=3: Se repite un total de 3 veces (El estreno + 2 semanas más)
        recur: 'RRULE:FREQ=WEEKLY;COUNT=3'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Abre el calendario en una nueva pestaña.
 * Esta es la única función que necesitas llamar desde tu botón en React.
 */
export const requestCalendarPermission = (partNumber: number): void => {
    const link = generateCalendarLink(partNumber);
    if (link) {
        window.open(link, '_blank');
    } else {
        console.error('❌ No se pudo generar el enlace del calendario (faltan datos de fecha o info).');
    }
};

// Nota: He eliminado 'requestCalendarPermissionForAll' porque con la regla de recurrencia
// ya no es necesario agregar evento por evento. Un solo clic hace todo el trabajo.