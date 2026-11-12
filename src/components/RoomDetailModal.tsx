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
  ChevronLeft,
  ChevronRight,
  Images,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomDetailModalProps {
  habitacion: Habitacion | null;
  onClose: () => void;
  onProceedToBook: (hab: Habitacion, entrada?: string, salida?: string) => void;
}

// Curated high-resolution boutique hotel gallery fallbacks
const getRoomGallery = (hab: Habitacion): string[] => {
  if (hab.galeria && hab.galeria.length > 0) {
    return hab.galeria;
  }

  const galleryMap: Record<number, string[]> = {
    1: [
      hab.imagen,
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      '/src/assets/images/hero_resort_solarium_1794431399560.jpg',
    ],
    2: [
      hab.imagen,
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      '/src/assets/images/hero_resort_solarium_1794431399560.jpg',
    ],
    3: [
      hab.imagen,
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      '/src/assets/images/hero_resort_solarium_1794431399560.jpg',
    ],
    4: [
      hab.imagen,
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      '/src/assets/images/hero_resort_solarium_1794431399560.jpg',
    ],
    5: [
      hab.imagen,
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      '/src/assets/images/hero_resort_solarium_1794431399560.jpg',
    ],
  };

  return galleryMap[hab.id_tipo] || [hab.imagen];
};

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  habitacion,
  onClose,
  onProceedToBook,
}) => {
  const { tipos, checkOverlap, calculateNights, getRatingHabitacion, getResenasHabitacion } = useHotel();

  const [fechaEntrada, setFechaEntrada] = useState('2026-12-15');
  const [fechaSalida, setFechaSalida] = useState('2026-12-18');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!habitacion) return null;

  const tipo = tipos.find((t) => t.id_tipo === habitacion.id_tipo);
  const precio = tipo ? tipo.precio_base : 180000;
  const statusStyle = getEstadoHabitacionColor(habitacion.estado);

  const photos = getRoomGallery(habitacion);
  const currentPhoto = photos[selectedPhotoIndex] || habitacion.imagen;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const nights = calculateNights(fechaEntrada, fechaSalida);
  const hasOverlap = checkOverlap(habitacion.id_habitacion, fechaEntrada, fechaSalida);
  const ratingData = getRatingHabitacion(habitacion.id_habitacion);
  const resenasHab = getResenasHabitacion(habitacion.id_habitacion);

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
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors shadow-md"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Interactive Image Gallery Banner */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-stone-950 select-none group">
            <motion.img
              key={currentPhoto}
              src={currentPhoto}
              alt={`Habitación ${habitacion.numero} - Foto ${selectedPhotoIndex + 1}`}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-black/30 pointer-events-none" />

            {/* Gallery Navigation Controls */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
                  aria-label="Siguiente foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Badge */}
            <div className="absolute top-4 left-4 z-20 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
              <Images className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Foto {selectedPhotoIndex + 1} de {photos.length}
              </span>
            </div>

            {/* Room Title on Banner Bottom */}
            <div className="absolute bottom-16 sm:bottom-20 left-6 right-6 text-white pointer-events-none">
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

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-6 right-6 z-20 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                {photos.map((imgUrl, idx) => (
                  <button
                    key={imgUrl + idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40'
                        : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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

            {/* Services List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Servicios y Comodidades Incluidas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {habitacion.servicios.map((srv) => (
                  <div key={srv} className="flex items-center gap-2 py-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings and Reviews Section */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Opiniones y Calificaciones
                  </h4>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900 font-mono-numbers">
                      {ratingData.promedio > 0 ? ratingData.promedio.toFixed(1) : 'Nuevo'}
                    </span>
                    <span className="text-[11px] text-amber-700 font-mono-numbers">
                      ({ratingData.total} {ratingData.total === 1 ? 'opinión' : 'opiniones'})
                    </span>
                  </div>
                </div>
              </div>

              {resenasHab.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-stone-500 text-xs text-center border border-stone-200/60">
                  Esta habitación aún no cuenta con reseñas de huéspedes. Sé el primero en compartir tu experiencia tras tu estancia.
                </div>
              ) : (
                <div className="space-y-3">
                  {resenasHab.slice(0, 3).map((r) => (
                    <div
                      key={r.id_resena}
                      className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">{r.cliente_nombre}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <Star
                              key={starVal}
                              className={`w-3 h-3 ${
                                starVal <= r.calificacion
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-stone-400 ml-1.5 font-mono-numbers">
                            {r.fecha}
                          </span>
                        </div>
                      </div>
                      <p className="text-stone-600 leading-relaxed italic">
                        "{r.comentario}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Availability Verification Box */}
            <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Verificar Disponibilidad y Cotizar</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
