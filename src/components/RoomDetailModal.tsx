import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion } from '../types/hotel';
import { formatCOP, getEstadoHabitacionColor } from '../utils/formatters';
import {
  X,
  BedDouble,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  Wifi,
  Tv,
  Coffee,
  Waves,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomDetailModalProps {
  habitacion: Habitacion | null;
  onClose: () => void;
  onProceedToBook: (hab: Habitacion, entrada?: string, salida?: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  habitacion,
  onClose,
  onProceedToBook,
}) => {
  const { tipos, checkOverlap, calculateNights } = useHotel();

  const [fechaEntrada, setFechaEntrada] = useState('2026-12-15');
  const [fechaSalida, setFechaSalida] = useState('2026-12-18');

  if (!habitacion) return null;

  const tipo = tipos.find((t) => t.id_tipo === habitacion.id_tipo);
  const precio = tipo ? tipo.precio_base : 180000;
  const statusStyle = getEstadoHabitacionColor(habitacion.estado);

  const nights = calculateNights(fechaEntrada, fechaSalida);
  const hasOverlap = checkOverlap(habitacion.id_habitacion, fechaEntrada, fechaSalida);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Image Banner */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-stone-900">
            <img
              src={habitacion.imagen}
              alt={`Habitación ${habitacion.numero}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                <span>{tipo?.nombre}</span>
                <span aria-hidden="true">·</span>
                <span>Piso {habitacion.piso}</span>
                <span aria-hidden="true">·</span>
                <span>Capacidad {tipo?.capacidad} Huéspedes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">
                Habitación {habitacion.numero} · {tipo?.nombre}
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-20rem)] overflow-y-auto">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Descripción del Espacio
              </h4>
              <p className="text-stone-700 text-sm leading-relaxed">
                {habitacion.descripcion} Cada detalle ha sido concebido para garantizar reposo profundo: lencería de algodón egipcio, climatización silenciosa de alta eficiencia y acabados en maderas nativas certificadas.
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-stone-100 text-xs text-stone-600">
              <div className="flex flex-col">
                <span className="text-stone-400">Capacidad:</span>
                <span className="font-semibold text-stone-900 mt-0.5">Hasta {tipo?.capacidad} huéspedes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-stone-400">Ubicación:</span>
                <span className="font-semibold text-stone-900 mt-0.5">Piso {habitacion.piso}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-stone-400">Check-in:</span>
                <span className="font-semibold text-stone-900 mt-0.5">3:00 PM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-stone-400">Check-out:</span>
                <span className="font-semibold text-stone-900 mt-0.5">12:00 PM</span>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Servicios & Amenidades Incluidas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
                {habitacion.servicios.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Availability & Pricing Calculator inside modal */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Comprobar Estancia para esta Habitación
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] text-stone-500 block mb-1">Fecha de Entrada</label>
                  <input
                    type="date"
                    value={fechaEntrada}
                    onChange={(e) => setFechaEntrada(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono-numbers bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-1">Fecha de Salida</label>
                  <input
                    type="date"
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono-numbers bg-white"
                  />
                </div>
              </div>

              {/* Status Message */}
              {hasOverlap ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    La habitación {habitacion.numero} ya tiene una reserva activa en esas fechas. Te invitamos a seleccionar otras fechas.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-stone-700 pt-2 border-t border-stone-200">
                  <span>{nights} {nights === 1 ? 'noche' : 'noches'} x {formatCOP(precio)}</span>
                  <span className="font-bold text-amber-900 text-sm font-mono-numbers">
                    Total: {formatCOP(precio * nights)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block">Tarifa base por noche</span>
              <span className="text-xl font-bold text-stone-900 font-mono-numbers">
                {formatCOP(precio)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => onProceedToBook(habitacion, fechaEntrada, fechaSalida)}
                disabled={hasOverlap || habitacion.estado === 'MANTENIMIENTO' || !habitacion.activa}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  hasOverlap || habitacion.estado === 'MANTENIMIENTO' || !habitacion.activa
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
                }`}
              >
                Proceder a Reservar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
