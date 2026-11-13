import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';
import { RolUsuario } from '../../types/hotel';

interface AccessDeniedProps {
  requiredRole?: RolUsuario | string;
  currentRole: RolUsuario;
  currentUserNombre?: string;
  onGoHome: () => void;
  onOpenAuth?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'ADMINISTRADOR',
  currentRole,
  currentUserNombre = 'Usuario',
  onGoHome,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-200/80 text-center relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold tracking-wider uppercase mb-3">
          <Lock className="w-3 h-3 text-stone-500" />
          <span>Error 403 · Acceso No Autorizado</span>
        </div>

        <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">
          Área Protegida por Roles
        </h2>

        <p className="text-sm text-stone-600 leading-relaxed mb-6">
          Esta vista está restringida y requiere privilegios de{' '}
          <strong className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
            {requiredRole}
          </strong>
          . Tu rol activo actual es{' '}
          <span className="font-semibold text-stone-800">{currentRole}</span>.
        </p>

        {/* User Context Info Card */}
        <div className="bg-stone-50 rounded-2xl p-3.5 mb-6 text-left border border-stone-200/60 text-xs">
          <div className="text-stone-400 font-medium mb-1 uppercase tracking-wider text-[10px]">
            Sesión Identificada:
          </div>
          <div className="font-bold text-stone-900">{currentUserNombre}</div>
          <div className="text-stone-500 text-[11px] mt-0.5">
            Rol actual: <span className="font-mono text-amber-800">{currentRole}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Cambiar Perfil</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
