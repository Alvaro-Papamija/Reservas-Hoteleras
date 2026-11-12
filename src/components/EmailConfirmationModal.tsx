import React, { useState } from 'react';
import { Reserva } from '../types/hotel';
import { formatCOP, formatDateDMY } from '../utils/formatters';
import { generarComprobantePDF } from '../utils/pdfGenerator';
import {
  X,
  Mail,
  Send,
  Download,
  Copy,
  Check,
  Calendar,
  BedDouble,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface EmailConfirmationModalProps {
  reserva: Reserva;
  onClose: () => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  reserva,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reserva.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateResend = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  const handleDownloadPDF = () => {
    generarComprobantePDF(reserva);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-8"
      >
        {/* Modal Window Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                Correo de Confirmación de Reserva
              </h3>
              <p className="text-[11px] text-stone-400">
                Vista previa del correo transaccional enviado al huésped
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 space-y-1.5 text-xs text-stone-600 font-mono-numbers">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400 w-16">De:</span>
            <span className="text-stone-900 font-sans">
              Alborada Hotel Boutique &lt;reservas@alboradahotel.com&gt;
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400 w-16">Para:</span>
            <span className="text-stone-900 font-sans font-medium">
              {reserva.cliente_nombre} &lt;{reserva.cliente_correo}&gt;
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400 w-16">Asunto:</span>
            <span className="text-stone-900 font-sans font-semibold">
              Confirmación de Reserva {reserva.codigo} · Alborada Hotel Boutique
            </span>
          </div>
        </div>

        {/* Email Template Body (Styled as a clean HTML email) */}
        <div className="p-6 sm:p-8 max-h-[calc(80vh-14rem)] overflow-y-auto space-y-6 bg-stone-100/60">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Hotel Brand Header */}
            <div className="text-center pb-4 border-b border-stone-100">
              <span className="text-[11px] tracking-widest uppercase font-bold text-amber-700 block mb-1">
                Popayán, Cauca · Colombia
              </span>
              <h2 className="text-2xl font-display font-bold text-stone-900 tracking-tight">
                Alborada Hotel Boutique
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Refugio de serenidad y arquitectura colonial
              </p>
            </div>

            {/* Greeting */}
            <div>
              <p className="text-sm font-semibold text-stone-900 mb-1">
                Estimado/a {reserva.cliente_nombre},
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Nos complace informarte que tu reserva ha sido registrada satisfactoriamente. A continuación encontrarás todos los detalles de tu estancia:
              </p>
            </div>

            {/* Voucher Box */}
            <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                    Código Oficial de Reserva
                  </span>
                  <span className="text-lg font-mono-numbers font-bold text-stone-900 tracking-wider">
                    {reserva.codigo}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100/50 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar código'}</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-stone-700">
                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70">
                  <span className="text-stone-400 text-[11px] block">Habitación</span>
                  <span className="font-bold text-stone-900">
                    Hab. {reserva.habitacion_numero} · {reserva.habitacion_tipo}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70">
                  <span className="text-stone-400 text-[11px] block">Huéspedes</span>
                  <span className="font-bold text-stone-900">
                    {reserva.cantidad_huespedes} personas ({reserva.cantidad_noches} noches)
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70">
                  <span className="text-stone-400 text-[11px] block">Fecha de Check-in</span>
                  <span className="font-bold text-stone-900">
                    {formatDateDMY(reserva.fecha_entrada)} (desde 15:00)
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70">
                  <span className="text-stone-400 text-[11px] block">Fecha de Check-out</span>
                  <span className="font-bold text-stone-900">
                    {formatDateDMY(reserva.fecha_salida)} (hasta 12:00)
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-700">Total liquidado:</span>
                <span className="text-lg font-bold text-amber-900 font-mono-numbers">
                  {formatCOP(reserva.total)}
                </span>
              </div>
            </div>

            {/* Policies block */}
            <div className="text-[11px] text-stone-500 space-y-1.5 border-t border-stone-100 pt-4">
              <p className="font-semibold text-stone-800">Políticas importantes:</p>
              <p>• Cancelación gratuita hasta 48 horas antes del check-in (15:00 hrs).</p>
              <p>• Presentar documento original de identidad al momento del ingreso.</p>
              <p>• Desayuno buffet incluido de 07:00 a 10:30 hrs en el Patio Colonial.</p>
            </div>

            {/* Footer sign */}
            <div className="text-center pt-2 text-xs text-stone-400">
              <p className="font-serif italic">Esperamos brindarte una experiencia inolvidable.</p>
              <p className="font-sans text-[11px] mt-1 font-semibold text-stone-600">
                Equipo de Recepción & Concierge · Alborada Hotel Boutique
              </p>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {sentSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Correo de confirmación enviado exitosamente a {reserva.cliente_correo}</span>
            </div>
          ) : (
            <span className="text-xs text-stone-500">
              ¿Deseas reenviar este comprobante o descargarlo en PDF?
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSimulateResend}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-700" />
              <span>Reenviar Correo</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

