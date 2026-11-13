import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Notificacion, TipoNotificacion } from '../types/hotel';
import {
  Bell,
  CheckCircle2,
  CalendarCheck,
  Clock,
  Tag,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationsDropdown: React.FC = () => {
  const {
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    currentRole,
    currentUser,
    setActiveView,
  } = useHotel();

  const [isOpen, setIsOpen] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications visible for current user & role
  const relevantNotifs = notificaciones.filter((n) => {
    if (n.destinatario_correo && n.destinatario_correo.toLowerCase() !== currentUser.correo.toLowerCase()) {
      return false;
    }
    if (n.destinatario_rol && n.destinatario_rol !== 'TODOS' && n.destinatario_rol !== currentRole) {
      return false;
    }
    return true;
  });

  const unreadCount = relevantNotifs.filter((n) => !n.leida).length;

  const displayedNotifs = filterUnread
    ? relevantNotifs.filter((n) => !n.leida)
    : relevantNotifs;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'CONFIRMACION':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'RECORDATORIO':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'PROMOCION':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'MANTENIMIENTO':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleNotifClick = (notif: Notificacion) => {
    marcarNotificacionLeida(notif.id_notificacion);
    if (notif.enlace_vista) {
      setActiveView(notif.enlace_vista);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors"
        title="Notificaciones automáticas"
        aria-label="Abrir centro de notificaciones"
      >
        <Bell className="w-4 h-4 text-stone-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-700 text-white text-[10px] font-mono-numbers font-bold rounded-full flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-stone-900">
                  Notificaciones del Sistema
                </h4>
                <span className="text-[11px] text-stone-500">
                  {unreadCount} sin leer
                </span>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={marcarTodasNotificacionesLeidas}
                  className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar leídas</span>
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex border-b border-stone-100 text-xs font-medium text-stone-600 px-3 py-1.5 bg-stone-50/50">
              <button
                onClick={() => setFilterUnread(false)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  !filterUnread ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                Todas ({relevantNotifs.length})
              </button>
              <button
                onClick={() => setFilterUnread(true)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterUnread ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                No leídas ({unreadCount})
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
              {displayedNotifs.length === 0 ? (
                <div className="p-6 text-center text-stone-400">
                  <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p>No tienes notificaciones pendientes.</p>
                </div>
              ) : (
                displayedNotifs.map((notif) => (
                  <div
                    key={notif.id_notificacion}
                    onClick={() => handleNotifClick(notif)}
                    className={`p-3.5 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.leida ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white border border-stone-200 shrink-0 mt-0.5">
                      {getNotifIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-stone-900 truncate">
                          {notif.titulo}
                        </span>
                        {!notif.leida && (
                          <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                        <span className="font-mono-numbers">{notif.fecha}</span>
                        {notif.enlace_vista && (
                          <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                            <span>Ver</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

