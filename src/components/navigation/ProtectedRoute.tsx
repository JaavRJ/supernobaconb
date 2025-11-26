import React from 'react';
import { Navigate } from 'react-router-dom';
import { isPartEnabled } from '../../config/partsConfig';

interface ProtectedRouteProps {
    partNumber: number;
    children: React.ReactElement;
}

/**
 * Componente que protege rutas de partes
 * Redirige a la página principal si la parte no está habilitada
 */
export default function ProtectedRoute({ partNumber, children }: ProtectedRouteProps) {
    const isEnabled = isPartEnabled(partNumber);

    if (!isEnabled) {
        // Redirigir a la página principal si la parte no está habilitada
        return <Navigate to="/" replace />;
    }

    // Si está habilitada, mostrar el contenido
    return children;
}
