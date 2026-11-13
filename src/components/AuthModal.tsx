import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { AuthService } from '../utils/authService';
import {
  X,
  User,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    currentUser,
    currentRole,
    isAuthenticated,
    login,
    register,
    switchRole,
    logout,
    resetToInitialData,
  } = useHotel();

  // Tab State: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [persistSession, setPersistSession] = useState(false);

  // Validation & Error States
  const [fieldErrors, setFieldErrors] = useState<{ nombre?: string; correo?: string; contrasena?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rate Limiting (Brute Force Protection)
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Quick Evaluator Switcher Accordion
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  // Sincronizar estado de bloqueo al abrir modal
  useEffect(() => {
    if (isOpen) {
      const rateLimit = AuthService.checkRateLimit();
      if (rateLimit.isBlocked) {
        setIsLocked(true);
        setLockoutRemaining(rateLimit.remainingSeconds);
      } else {
        setIsLocked(false);
        setLockoutRemaining(0);
      }
    }
  }, [isOpen]);

  // Contador de bloqueo decreciente
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setGlobalError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutRemaining]);

  if (!isOpen) return null;

  // Validación de campos en tiempo real / submit
  const validateForm = (): boolean => {
    const errors: { nombre?: string; correo?: string; contrasena?: string } = {};

    if (activeTab === 'register') {
      const nameVal = AuthService.validateName(nombre);
      if (!nameVal.valid) errors.nombre = nameVal.error;
    }

    const emailVal = AuthService.validateEmail(correo);
    if (!emailVal.valid) errors.correo = emailVal.error;

    const passVal = AuthService.validatePassword(contrasena);
    if (!passVal.valid) errors.contrasena = passVal.error;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    if (isLocked) {
      setGlobalError(`Demasiados intentos fallidos. Espere ${lockoutRemaining} segundos.`);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await login(correo, contrasena, persistSession);

        if (result.success) {
          setSuccessMessage('¡Inicio de sesión exitoso!');
          setTimeout(() => {
            onClose();
            setSuccessMessage(null);
          }, 800);
        } else {
          if (result.isRateLimited) {
            setIsLocked(true);
            setLockoutRemaining(result.retryAfterSeconds || 900);
          }
          // Error genérico OWASP
          setGlobalError(result.error || 'Correo o contraseña incorrectos');
        }
      } else {
        const result = await register(nombre, correo, contrasena);

        if (result.success) {
          setSuccessMessage('¡Cuenta creada y sesión iniciada con éxito!');
          setTimeout(() => {
            onClose();
            setSuccessMessage(null);
          }, 900);
        } else {
          setGlobalError(result.error || 'No se pudo completar el registro.');
        }
      }
    } catch {
      setGlobalError('Ocurrió un error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetToInitialData();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden"
        >
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Encabezado */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-50 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Lock className="w-6 h-6 text-amber-200" />
            </div>
            <h3 className="text-xl font-display font-bold text-stone-900">
              Autenticación & Seguridad
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {isAuthenticated ? (
                <span>
                  Sesión activa: <strong className="text-stone-800">{currentUser.nombre}</strong> ({currentRole})
                </span>
              ) : (
                <span>Accede a tus reservas y gestiona tu estancia con total seguridad.</span>
              )}
            </p>
          </div>

          {/* Estado de sesión activa si el usuario ya está logueado */}
          {isAuthenticated && (
            <div className="mb-5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{currentUser.nombre}</div>
                  <div className="text-[11px] text-stone-500">{currentUser.correo} · {currentRole}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSuccessMessage('Sesión finalizada');
                  setTimeout(() => setSuccessMessage(null), 1500);
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          )}

          {/* Selector de Pestañas: Login vs Registro */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setGlobalError(null);
                setFieldErrors({});
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setGlobalError(null);
                setFieldErrors({});
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Alerta de Bloqueo por Fuerza Bruta (OWASP Rate Limiting) */}
          {isLocked && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acceso bloqueado temporalmente por seguridad</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Demasiados intentos fallidos. Tiempo de espera:{' '}
                  <span className="font-bold font-mono">
                    {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Mensajes Globales de Error / Éxito */}
          {globalError && !isLocked && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-medium animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Campo Nombre (Solo en Registro) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (fieldErrors.nombre) setFieldErrors((prev) => ({ ...prev, nombre: undefined }));
                    }}
                    placeholder="Ej. Juan Pérez"
                    disabled={isLocked || isLoading}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
                      fieldErrors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                  />
                </div>
                {fieldErrors.nombre && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.nombre}</p>
                )}
              </div>
            )}

            {/* Campo Correo */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (fieldErrors.correo) setFieldErrors((prev) => ({ ...prev, correo: undefined }));
                  }}
                  placeholder="ejemplo@hotelalborada.com"
                  disabled={isLocked || isLoading}
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
                    fieldErrors.correo ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                />
              </div>
              {fieldErrors.correo && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.correo}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => {
                    setContrasena(e.target.value);
                    if (fieldErrors.contrasena) setFieldErrors((prev) => ({ ...prev, contrasena: undefined }));
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLocked || isLoading}
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
                    fieldErrors.contrasena ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.contrasena && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.contrasena}</p>
              )}
            </div>

            {/* Recordar Sesión */}
            {activeTab === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={persistSession}
                    onChange={(e) => setPersistSession(e.target.checked)}
                    className="rounded border-stone-300 text-amber-800 focus:ring-amber-800 w-3.5 h-3.5"
                  />
                  <span>Recordar sesión</span>
                </label>
                <span className="text-[11px] text-stone-400 italic">Sesión con token seguro</span>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isLocked || isLoading}
              className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : activeTab === 'login' ? (
                <span>Iniciar Sesión</span>
              ) : (
                <span>Registrarme</span>
              )}
            </button>
          </form>

          {/* Acordeón para Evaluadores / Cambio Rápido de Rol */}
          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowDemoProfiles(!showDemoProfiles)}
              className="w-full py-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Acceso Rápido para Evaluadores (Perfiles Demo)
              </span>
              {showDemoProfiles ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoProfiles && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5 mt-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    switchRole('ADMINISTRADOR');
                    onClose();
                  }}
                  className="w-full p-2 rounded-xl border border-stone-200 hover:border-amber-700 bg-stone-50/70 text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-stone-900">Alvaro Papamija (Admin)</div>
                      <div className="text-[10px] text-stone-500">alvaro@hotelalborada.com · Pass: Admin123*</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold">Auto-login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('CLIENTE');
                    login('laura.gomez@ejemplo.com', 'Cliente123*');
                    onClose();
                  }}
                  className="w-full p-2 rounded-xl border border-stone-200 hover:border-amber-700 bg-stone-50/70 text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-700 text-white flex items-center justify-center font-bold text-[10px]">
                      LG
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-stone-900">Laura Gómez (Huésped)</div>
                      <div className="text-[10px] text-stone-500">laura.gomez@ejemplo.com · Pass: Cliente123*</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold">Auto-login</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Pie de restablecer datos semilla */}
          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <button
              onClick={handleReset}
              className="hover:text-stone-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restablecer datos demo</span>
            </button>
            <span>Seguridad OWASP ASVS v4</span>
          </div>

          {resetNotice && (
            <div className="mt-2 p-1.5 bg-emerald-50 text-emerald-800 text-center rounded-lg text-[11px] font-medium">
              Datos restablecidos con éxito.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
