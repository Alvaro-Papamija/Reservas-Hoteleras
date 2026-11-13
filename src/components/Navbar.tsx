import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import {
  BedDouble,
  CalendarCheck,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenSearch }) => {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    activeView,
    setActiveView,
    switchRole,
    logout,
    reservas,
  } = useHotel();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count active reservations for client
  const clientActiveCount = isAuthenticated && currentUser?.correo
    ? reservas.filter(
        (r) => r.cliente_correo.toLowerCase() === currentUser.correo.toLowerCase() && (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA')
      ).length
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 xl:gap-6">
          {/* Zone 1: Brand Wordmark (1 element, single line) */}
          <button
            onClick={() => setActiveView(currentRole === 'ADMINISTRADOR' ? 'admin-dashboard' : 'inicio')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-lg shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-700 text-amber-50 flex items-center justify-center shadow-sm group-hover:bg-amber-800 transition-colors">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-tight">
                Alborada
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-amber-800/80">
                Hotel Boutique
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Strict RBAC-filtered) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-5 text-xs xl:text-sm font-medium text-stone-600">
            {currentRole === 'CLIENTE' ? (
              <>
                <button
                  onClick={() => setActiveView('inicio')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'inicio' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setActiveView('habitaciones')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'habitaciones' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Habitaciones
                </button>
                <button
                  onClick={() => setActiveView('disponibilidad')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'disponibilidad' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Consultar Disponibilidad
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setActiveView('mis-reservas')}
                    className={`flex items-center gap-1.5 hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                      activeView === 'mis-reservas' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                    }`}
                  >
                    <span>Mis Reservas</span>
                    {clientActiveCount > 0 && (
                      <span className="w-5 h-5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full flex items-center justify-center font-mono-numbers">
                        {clientActiveCount}
                      </span>
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('admin-dashboard')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-dashboard' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('admin-habitaciones')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-habitaciones' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  <span className="hidden 2xl:inline">Gestión </span>Habitaciones
                </button>
                <button
                  onClick={() => setActiveView('admin-reservas')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-reservas' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Reservas<span className="hidden 2xl:inline"> del Hotel</span>
                </button>
                <button
                  onClick={() => setActiveView('admin-calendario')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-calendario' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Calendario
                </button>
                <button
                  onClick={() => setActiveView('admin-clientes')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-clientes' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  <span className="hidden 2xl:inline">Directorio </span>Clientes
                </button>
                <button
                  onClick={() => setActiveView('admin-reportes')}
                  className={`hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    activeView === 'admin-reportes' ? 'border-amber-700 text-stone-900 font-semibold' : 'border-transparent'
                  }`}
                >
                  Reportes<span className="hidden 2xl:inline"> & Ocupación</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Role Switcher for Evaluation */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Role Simulator Toggle */}
            <div className="hidden sm:flex items-center p-0.5 sm:p-1 bg-stone-200/70 rounded-xl text-[11px] sm:text-xs font-medium">
              <button
                onClick={() => switchRole('CLIENTE')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  currentRole === 'CLIENTE'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Huésped</span>
              </button>
              <button
                onClick={() => switchRole('ADMINISTRADOR')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  currentRole === 'ADMINISTRADOR'
                    ? 'bg-stone-900 text-amber-300 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Primary Action Button */}
            {currentRole === 'CLIENTE' ? (
              <button
                onClick={() => setActiveView('disponibilidad')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold tracking-wide text-white bg-amber-700 hover:bg-amber-800 active:scale-98 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
              >
                Reservar Ahora
              </button>
            ) : (
              <button
                onClick={() => setActiveView('admin-reservas')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold tracking-wide text-white bg-stone-900 hover:bg-stone-800 active:scale-98 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
              >
                Nueva Reserva
              </button>
            )}

            {/* Automated Notifications Center */}
            <NotificationsDropdown />

            {/* Profile / Switcher button */}
            <button
              onClick={onOpenAuth}
              title={isAuthenticated ? `Sesión activa: ${currentUser.nombre} (${currentRole})` : 'Iniciar sesión'}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center gap-1.5 text-xs text-stone-700 transition-colors shrink-0 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden md:inline font-medium text-[11px] max-w-[100px] truncate">
                {isAuthenticated ? currentUser.nombre.split(' ')[0] : 'Ingresar'}
              </span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-200/50"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-stone-200">
            <span className="text-xs text-stone-500">Rol activo:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  switchRole('CLIENTE');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded ${
                  currentRole === 'CLIENTE' ? 'bg-amber-700 text-white font-medium' : 'bg-stone-200 text-stone-700'
                }`}
              >
                Huésped
              </button>
              <button
                onClick={() => {
                  switchRole('ADMINISTRADOR');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded ${
                  currentRole === 'ADMINISTRADOR' ? 'bg-stone-900 text-amber-300 font-medium' : 'bg-stone-200 text-stone-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
            {currentRole === 'CLIENTE' ? (
              <>
                <button
                  onClick={() => {
                    setActiveView('inicio');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Inicio
                </button>
                <button
                  onClick={() => {
                    setActiveView('habitaciones');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Habitaciones
                </button>
                <button
                  onClick={() => {
                    setActiveView('disponibilidad');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Consultar Disponibilidad
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setActiveView('mis-reservas');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 hover:text-amber-800 flex items-center justify-between"
                  >
                    <span>Mis Reservas</span>
                    {clientActiveCount > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono-numbers">
                        {clientActiveCount}
                      </span>
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveView('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Dashboard Ejecutivo
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin-habitaciones');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Gestión Habitaciones
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin-reservas');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Reservas del Hotel
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin-calendario');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Calendario Visual
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin-clientes');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Directorio Clientes
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin-reportes');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-amber-800"
                >
                  Reportes & Ocupación
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
