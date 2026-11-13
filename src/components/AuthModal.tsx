import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRole,
    isAuthenticated,
    loginAs,
    switchRole,
    logout,
    resetToInitialData,
  } = useHotel();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [customEmail, setCustomEmail] = useState('');
  const [customPass, setCustomPass] = useState('');
  const [resetNotice, setResetNotice] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail) {
      loginAs(customEmail);
      onClose();
    }
  };

  const handleReset = () => {
    resetToInitialData();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-700 text-amber-50 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <h3 className="text-xl font-display font-bold text-stone-900">
              Control de Sesión & Roles
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Sesión activa:{' '}
              {isAuthenticated ? (
                <>
                  <strong className="text-stone-800">{currentUser.nombre}</strong> ({currentRole})
                </>
              ) : (
                <span className="italic text-stone-600 font-medium">Modo Visitante (Sin sesión iniciada)</span>
              )}
            </p>
          </div>

          {/* Quick 1-Click Test User Switcher */}
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Cambio Rápido de Perfil (Evaluación):
            </span>

            {/* Admin */}
            <button
              onClick={() => {
                switchRole('ADMINISTRADOR');
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                isAuthenticated && currentRole === 'ADMINISTRADOR'
                  ? 'border-amber-800 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Alvaro Papamija (Admin)</div>
                  <div className="text-[11px] text-stone-500">alvaro@hotelalborada.com · Rol Admin</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Client 1: Laura Gómez */}
            <button
              onClick={() => {
                switchRole('CLIENTE');
                loginAs('laura.gomez@ejemplo.com');
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                isAuthenticated && currentUser.correo === 'laura.gomez@ejemplo.com'
                  ? 'border-amber-800 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-xs">
                  LG
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Laura Gómez (Huésped)</div>
                  <div className="text-[11px] text-stone-500">laura.gomez@ejemplo.com · Medellín</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Client 2: Carlos Restrepo */}
            <button
              onClick={() => {
                switchRole('CLIENTE');
                loginAs('carlos.restrepo@ejemplo.com');
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                isAuthenticated && currentUser.correo === 'carlos.restrepo@ejemplo.com'
                  ? 'border-amber-800 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-700 text-white flex items-center justify-center font-bold text-xs">
                  CR
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Carlos Restrepo (Huésped)</div>
                  <div className="text-[11px] text-stone-500">carlos.restrepo@ejemplo.com · Bogotá</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Option: Visitor / Guest Mode */}
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                !isAuthenticated
                  ? 'border-amber-800 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-400 text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Modo Visitante (Invitado)</div>
                  <div className="text-[11px] text-stone-500">Sin autenticación · Acceso solo público</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Reset Demo Data Helper */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <button
              onClick={handleReset}
              className="text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer datos semilla</span>
            </button>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Cerrar sesión
            </button>
          </div>

          {resetNotice && (
            <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 text-center rounded-lg text-xs font-medium">
              Datos iniciales restablecidos con éxito.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
