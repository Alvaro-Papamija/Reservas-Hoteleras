import React, { useState } from 'react';
import { Reserva } from '../types/hotel';
import { formatCOP, formatDateDMY } from '../utils/formatters';
import { generarComprobantePDF } from '../utils/pdfGenerator';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import {
  CheckCircle2,
  Calendar,
  BedDouble,
  User,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Download,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';

interface BookingConfirmationModalProps {
  reserva: Reserva;
  onViewMyReservations: () => void;
  onContinueBrowsing: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  reserva,
  onViewMyReservations,
  onContinueBrowsing,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reserva.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    generarComprobantePDF(reserva);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-8"
      >
        {/* Success Header with Warm Terracotta/Amber accent */}
        <div className="bg-gradient-to-br from-amber-800 to-stone-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-4 border border-white/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
            Reserva Registrada con Éxito
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            ¡Te esperamos en Alborada!
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 max-w-md mx-auto leading-relaxed">
            Hemos recibido tu solicitud. Tu habitación ha sido reservada bajo el siguiente código oficial.
          </p>

          {/* Booking Code Voucher Box */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/25">
            <span className="text-xs text-amber-200 font-medium">Código:</span>
            <span className="font-mono-numbers text-base font-bold tracking-wider text-white">
              {reserva.codigo}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-white/80 hover:text-white p-1 transition-colors"
              title="Copiar código"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <div className="text-[11px] text-emerald-300 mt-1 font-medium">
              ¡Código copiado al portapapeles!
            </div>
          )}
        </div>

        {/* Voucher Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Estado: {reserva.estado}</span>
            </div>
            <span className="text-amber-700">Pendiente de check-in / confirmación</span>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-xs text-stone-700">
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Huésped principal:</span>
              <span className="font-semibold text-stone-900">{reserva.cliente_nombre}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Documento:</span>
              <span className="font-mono-numbers font-medium text-stone-900">{reserva.cliente_documento}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Habitación asignada:</span>
              <span className="font-semibold text-stone-900">
                Hab. {reserva.habitacion_numero} ({reserva.habitacion_tipo})
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Fechas de estancia:</span>
              <span className="font-mono-numbers font-semibold text-stone-900">
                {formatDateDMY(reserva.fecha_entrada)} al {formatDateDMY(reserva.fecha_salida)} ({reserva.cantidad_noches} noches)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Huéspedes:</span>
              <span className="font-medium text-stone-900">{reserva.cantidad_huespedes} personas</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-400">Tarifa por noche:</span>
              <span className="font-mono-numbers font-medium text-stone-900">{formatCOP(reserva.precio_noche)}</span>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <span className="text-sm font-bold text-stone-900">Total liquidado:</span>
              <span className="text-xl font-bold text-amber-900 font-mono-numbers">
                {formatCOP(reserva.total)}
              </span>
            </div>
          </div>

          {/* Cancellation Notice */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-500 leading-relaxed">
            <span className="font-semibold text-stone-800 block mb-0.5">Política de Cancelación (RN05):</span>
            Puedes gestionar o cancelar esta reserva sin penalidad hasta 48 horas antes del check-in directamente desde tu sección "Mis Reservas".
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>

              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full py-2.5 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-amber-700" />
                <span>Ver Correo</span>
              </button>
            </div>

            <button
              onClick={onViewMyReservations}
              className="w-full py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver mis reservas</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>

              <button
                onClick={onContinueBrowsing}
                className="py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
              >
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <EmailConfirmationModal
          reserva={reserva}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};
