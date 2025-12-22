// Manejo centralizado de errores para no exponer información sensible
export const handleError = (error: any, context: string): void => {
    // En producción, solo loguear errores genéricos
    if (process.env.NODE_ENV === 'production') {
        console.error(`Error en ${context}`);
        // TODO: Aquí puedes integrar con Sentry, LogRocket, etc.
        // Sentry.captureException(error, { tags: { context } });
    } else {
        // En desarrollo, mostrar detalles completos
        console.error(`❌ Error en ${context}:`, error);
    }
};

/**
 * Crea un mensaje de error seguro para mostrar al usuario
 */
export const getSafeErrorMessage = (error: any): string => {
    if (process.env.NODE_ENV === 'production') {
        return 'Ha ocurrido un error. Por favor, intenta de nuevo.';
    }

    // En desarrollo, mostrar más detalles
    if (error?.message) {
        return error.message;
    }

    return 'Error desconocido';
};

/**
 * Wrapper para operaciones async con manejo de errores
 */
export const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
): Promise<T | undefined> => {
    try {
        return await operation();
    } catch (error) {
        handleError(error, context);
        return fallbackValue;
    }
};
