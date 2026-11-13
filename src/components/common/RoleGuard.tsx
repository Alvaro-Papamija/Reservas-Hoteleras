import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { RolUsuario } from '../../types/hotel';
import { AccessDenied } from './AccessDenied';

interface RoleGuardProps {
  /**
   * Roles autorizados para acceder al contenido protegido
   */
  allowedRoles: RolUsuario[];
  /**
   * Si requiere que el usuario esté expresamente autenticado
   * @default true
   */
  requireAuth?: boolean;
  /**
   * Componente o vista personalizada en caso de acceso denegado
   */
  fallback?: React.ReactNode;
  /**
   * Callback cuando se solicita abrir el modal de autenticación
   */
  onOpenAuth?: () => void;
  /**
   * Contenido protegido
   */
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requireAuth = true,
  fallback,
  onOpenAuth,
  children,
}) => {
  const { currentRole, currentUser, isAuthenticated, setActiveView } = useHotel();

  // 1. Verificación de autenticación
  if (requireAuth && !isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return (
      <AccessDenied
        requiredRole={allowedRoles.join(' o ')}
        currentRole={currentRole}
        currentUserNombre={currentUser?.nombre || 'Invitado no autenticado'}
        onGoHome={() => setActiveView('inicio')}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  // 2. Verificación de rol en la lista permitida
  const hasPermission = allowedRoles.includes(currentRole);

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return (
      <AccessDenied
        requiredRole={allowedRoles.join(' o ')}
        currentRole={currentRole}
        currentUserNombre={currentUser?.nombre}
        onGoHome={() => setActiveView('inicio')}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  // Acceso concedido
  return <>{children}</>;
};
