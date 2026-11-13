import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Reserva } from '../types/hotel';
import { formatCOP, formatDateDMY, formatDateReadable, getEstadoReservaColor } from '../utils/formatters';
import { generarComprobantePDF } from '../utils/pdfGenerator';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import {
  Calendar,
  BedDouble,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ArrowRight,
  ShieldAlert,
  Download,
  Mail,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyReservationsViewProps {
  onExploreRooms: () => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({ onExploreRooms }) => {
  const { reservas, currentUser, cancelarReserva, calificarReserva } = useHotel();

  const [activeTab, setActiveTab] = useState<'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA'>('TODAS');
  const [selectedReservaForCancel, setSelectedReservaForCancel] = useState<Reserva | null>(null);
  const [selectedReservaForEmail, setSelectedReservaForEmail] = useState<Reserva | null>(null);
  const [selectedReservaForRating, setSelectedReservaForRating] = useState<Reserva | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // Filter client's reservations
  const clientReservations = reservas.filter(
    (r) => currentUser?.correo && r.cliente_correo.toLowerCase() === currentUser.correo.toLowerCase()
  );

  const filtered = clientReservations.filter((r) => {
    if (activeTab === 'TODAS') return true;
    return r.estado === activeTab;
  });

  const handleConfirmCancel = () => {
    if (!selectedReservaForCancel) return;
    setCancelError(null);

    const result = cancelarReserva(selectedReservaForCancel.id_reserva, true);
    if (result.success) {
      setCancelSuccessMsg(`La reserva ${selectedReservaForCancel.codigo} ha sido cancelada satisfactoriamente.`);
      setSelectedReservaForCancel(null);
      setTimeout(() => setCancelSuccessMsg(null), 5000);
    } else {
      setCancelError(result.error || 'No se pudo cancelar la reserva.');
    }
  };

  const handleOpenRating = (reserva: Reserva) => {
    setSelectedReservaForRating(reserva);
    setRatingStars(reserva.calificacion || 5);
    setRatingComment(reserva.comentario_calificacion || '');
  };

  const handleSaveRating = () => {
    if (!selectedReservaForRating) return;
    const res = calificarReserva(selectedReservaForRating.id_reserva, ratingStars, ratingComment);
    if (res.success) {
      setRatingSuccessMsg(`Gracias por tu opinión sobre la Habitación ${selectedReservaForRating.habitacion_numero}.`);
      setSelectedReservaForRating(null);
      setTimeout(() => setRatingSuccessMsg(null), 5000);
    }
  };

  // Check 48 hour status
  const checkCanCancel = (reserva: Reserva) => {
    if (reserva.estado !== 'PENDIENTE' && reserva.estado !== 'CONFIRMADA') {
      return { canCancel: false, reason: 'Solo se pueden cancelar reservas en estado Pendiente o Confirmada.' };
    }
    const entradaDate = new Date(`${reserva.fecha_entrada}T15:00:00`);
    const now = new Date();
    const diffHours = (entradaDate.getTime() - now.getTime()) / (1000 * 3600);

    if (diffHours < 48) {
      return {
        canCancel: false,
        reason: `Fuera de plazo (faltan ${Math.max(0, Math.round(diffHours))}h para el check-in). La política exige al menos 48 horas de anticipación.`,
      };
    }

    return { canCancel: true, reason: 'Dentro del plazo de 48 horas.' };
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Portal del Huésped
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Mis Reservas
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Gestiona tus estadías activas, consulta comprobantes y revisa tu historial en Alborada Hotel Boutique.
          </p>
        </div>

        <button
          onClick={onExploreRooms}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Nueva Reserva</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Success alert */}
      {cancelSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {ratingSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{ratingSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {(['TODAS', 'PENDIENTE', 'CONFIRMADA', 'FINALIZADA', 'CANCELADA'] as const).map((tab) => {
          const count =
            tab === 'TODAS'
              ? clientReservations.length
              : clientReservations.filter((r) => r.estado === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab === 'TODAS' ? 'Todas las reservas' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State per USER_FLOW §4.2 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">
            {activeTab === 'TODAS' ? 'Aún no tienes reservas.' : `No tienes reservas en estado ${activeTab.toLowerCase()}.`}
          </h3>
          <p className="text-xs text-stone-500 mb-5 leading-relaxed">
            Explora nuestras 30 suites boutique y asegura tus fechas ideales con cancelación flexible.
          </p>
          <button
            onClick={onExploreRooms}
            className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Buscar habitaciones
          </button>
        </div>
      ) : (
        /* Reservation Cards */
        <div className="space-y-4">
          {filtered.map((reserva) => {
            const statusConfig = getEstadoReservaColor(reserva.estado);
            const cancelCheck = checkCanCancel(reserva);

            return (
              <motion.div
                key={reserva.id_reserva}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs hover:border-stone-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    {/* Header line with Code & Status */}
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="font-mono-numbers text-sm font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                        {reserva.codigo}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        Creada el {formatDateReadable(reserva.fecha_creacion.split('T')[0])}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900">
                      Habitación {reserva.habitacion_numero} · {reserva.habitacion_tipo}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-400 block">Total liquidado</span>
                    <span className="text-xl font-bold text-amber-900 font-mono-numbers">
                      {formatCOP(reserva.total)}
                    </span>
                  </div>
                </div>

                {/* Details row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs text-stone-600">
                  <div>
                    <span className="text-stone-400 block">Entrada:</span>
                    <span className="font-semibold text-stone-900 font-mono-numbers">
                      {formatDateDMY(reserva.fecha_entrada)}
                    </span>
                    <span className="text-[11px] text-stone-400 block">Desde las 3:00 PM</span>
                  </div>

                  <div>
                    <span className="text-stone-400 block">Salida:</span>
                    <span className="font-semibold text-stone-900 font-mono-numbers">
                      {formatDateDMY(reserva.fecha_salida)}
                    </span>
                    <span className="text-[11px] text-stone-400 block">Hasta las 12:00 PM</span>
                  </div>

                  <div>
                    <span className="text-stone-400 block">Duración:</span>
                    <span className="font-semibold text-stone-900">
                      {reserva.cantidad_noches} {reserva.cantidad_noches === 1 ? 'noche' : 'noches'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block">Huéspedes:</span>
                    <span className="font-semibold text-stone-900">
                      {reserva.cantidad_huespedes} personas
                    </span>
                  </div>
                </div>

                {/* Footer and cancel action */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generarComprobantePDF(reserva)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                      title="Descargar comprobante en formato PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>Comprobante PDF</span>
                    </button>

                    <button
                      onClick={() => setSelectedReservaForEmail(reserva)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                      title="Ver vista previa del correo de confirmación"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ver Correo</span>
                    </button>

                    {/* Calificar estancia */}
                    {reserva.calificacion ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Calificada: {reserva.calificacion}/5</span>
                      </div>
                    ) : reserva.estado === 'FINALIZADA' ? (
                      <button
                        onClick={() => handleOpenRating(reserva)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Calificar Estancia</span>
                      </button>
                    ) : null}
                  </div>

                  {/* Cancel button with 48h policy enforcement */}
                  {(reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') && (
                    <div className="flex items-center gap-2">
                      {cancelCheck.canCancel ? (
                        <button
                          onClick={() => {
                            setCancelError(null);
                            setSelectedReservaForCancel(reserva);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold transition-colors text-xs"
                        >
                          Cancelar Reserva
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-stone-400 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>No cancelable (&lt; 48h)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Email Confirmation Modal */}
      {selectedReservaForEmail && (
        <EmailConfirmationModal
          reserva={selectedReservaForEmail}
          onClose={() => setSelectedReservaForEmail(null)}
        />
      )}

      {/* Calificar Estancia Modal */}
      {selectedReservaForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-bold text-stone-900">
                  Calificar tu Estancia
                </h3>
              </div>
              <span className="text-xs font-mono-numbers text-stone-500">
                {selectedReservaForRating.codigo}
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              ¿Cómo fue tu experiencia en la <strong>Habitación {selectedReservaForRating.habitacion_numero} ({selectedReservaForRating.habitacion_tipo})</strong>? Tu opinión ayuda a otros huéspedes.
            </p>

            {/* Interactive Stars */}
            <div className="mb-4 text-center">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Tu Puntuación
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRatingStars(starVal)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${starVal} estrellas`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        starVal <= ratingStars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-900 block mt-1.5">
                {ratingStars === 5
                  ? 'Excelente - Superó expectativas'
                  : ratingStars === 4
                  ? 'Muy buena - Gran experiencia'
                  : ratingStars === 3
                  ? 'Aceptable - Experiencia estándar'
                  : ratingStars === 2
                  ? 'Regular - Varios aspectos por mejorar'
                  : 'Mala - No cumplió lo prometido'}
              </span>
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                Comentario u Observaciones
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                placeholder="Cuéntanos sobre la comodidad, atención del personal, limpieza o amenidades..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedReservaForRating(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRating}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Calificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedReservaForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-2">
              ¿Deseas cancelar esta reserva?
            </h3>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Estás a punto de cancelar la reserva <strong className="font-mono-numbers">{selectedReservaForCancel.codigo}</strong> para la <strong>Habitación {selectedReservaForCancel.habitacion_numero}</strong> ({formatDateDMY(selectedReservaForCancel.fecha_entrada)} al {formatDateDMY(selectedReservaForCancel.fecha_salida)}).
            </p>

            {cancelError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {cancelError}
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 mb-6">
              Esta acción liberará inmediatamente la habitación en el sistema para que otros viajeros puedan reservarla.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedReservaForCancel(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Conservar reserva
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
