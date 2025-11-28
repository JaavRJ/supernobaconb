import { getPublicationDate, getPartInfo } from '../config/publicationDates';

// Declare gapi for TypeScript
declare global {
    interface Window {
        gapi: any;
    }
}

// Google Calendar API configuration
const CALENDAR_API_KEY = '350896100728-3vrg5n95ol7v4f5asgtsbphdnuh7kimv.apps.googleusercontent.com'; // Reemplazar con tu API key
const CALENDAR_ID = 'primary'; // Calendario principal del usuario

// Load Google API
export const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window.gapi !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('client', () => {
                window.gapi.client.init({
                    apiKey: CALENDAR_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                }).then(resolve).catch(reject);
            });
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

// Add event to Google Calendar
export const addToGoogleCalendar = async (
    partNumber: number,
    accessToken: string
): Promise<void> => {
    const publicationDate = getPublicationDate(partNumber);
    const partInfo = getPartInfo(partNumber);

    if (!publicationDate || !partInfo) {
        throw new Error('Información de la parte no disponible');
    }

    // Create event date (publication date at 10:00 AM)
    const eventDate = new Date(publicationDate);
    eventDate.setHours(10, 0, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(11, 0, 0, 0);

    const event = {
        summary: partInfo.title,
        description: partInfo.description,
        start: {
            dateTime: eventDate.toISOString(),
            timeZone: 'America/Mexico_City', // Cambia según tu zona horaria
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: 'America/Mexico_City',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 60 }, // 1 hora antes
                { method: 'popup', minutes: 60 }, // 1 hora antes
            ],
        },
    };

    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            throw new Error('Error al crear evento en calendario');
        }

        const data = await response.json();
        console.log('✅ Evento creado en calendario:', data.htmlLink);
        return data;
    } catch (error) {
        console.error('❌ Error al agregar a calendario:', error);
        throw error;
    }
};

// Generate Google Calendar link (fallback method - no API needed)
export const generateCalendarLink = (partNumber: number): string => {
    const publicationDate = getPublicationDate(partNumber);
    const partInfo = getPartInfo(partNumber);

    if (!publicationDate || !partInfo) {
        return '';
    }

    // Format date for Google Calendar URL
    const eventDate = new Date(publicationDate);
    eventDate.setHours(10, 0, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(11, 0, 0, 0);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: partInfo.title,
        details: partInfo.description,
        dates: `${formatDate(eventDate)}/${formatDate(endDate)}`,
        ctz: 'America/Mexico_City',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Request calendar permission and add event
export const requestCalendarPermission = async (partNumber: number): Promise<void> => {
    try {
        // For now, we'll use the simple link method
        // To use the API method, you need to implement OAuth2 flow
        const link = generateCalendarLink(partNumber);
        window.open(link, '_blank');
    } catch (error) {
        console.error('❌ Error al abrir calendario:', error);
        throw error;
    }
};
