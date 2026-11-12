import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion, Reserva, Cupon } from '../types/hotel';
import { formatCOP, formatDateDMY } from '../utils/formatters';
import {
  X,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  Lock,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  habitacion: Habitacion | null;
  defaultEntrada?: string;
  defaultSalida?: string;
  defaultHuespedes?: number;
  onClose: () => void;
  onSuccess: (reserva: Reserva) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  habitacion,
  defaultEntrada = '2026-12-15',
  defaultSalida = '2026-12-18',
  defaultHuespedes = 2,
  onClose,
  onSuccess,
}) => {
  const { tipos, currentCliente, currentUser, createReserva, calculateTotal, validarCupon } = useHotel();

  const [fechaEntrada, setFechaEntrada] = useState(defaultEntrada);
  const [fechaSalida, setFechaSalida] = useState(defaultSalida);
  const [huespedes, setHuespedes] = useState(defaultHuespedes);
  const [notas, setNotas] = useState('');

  // Coupons
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState<{ cupon: Cupon; descuento: number } | null>(null);
  const [mensajeCupon, setMensajeCupon] = useState<{ exito: boolean; texto: string } | null>(null);

  // Guest details (prepopulated from logged-in client or default)
  const [nombre, setNombre] = useState(currentCliente?.nombre || 'Laura');
  const [apellido, setApellido] = useState(currentCliente?.apellido || 'Gómez');
  const [documento, setDocumento] = useState(currentCliente?.documento || '1085294821');
  const [telefono, setTelefono] = useState(currentCliente?.telefono || '+57 312 458 9012');
  const [correo, setCorreo] = useState(currentCliente?.correo || currentUser?.correo || 'laura.gomez@ejemplo.com');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!habitacion) return null;

  const tipo = tipos.find((t) => t.id_tipo === habitacion.id_tipo);
  const precioNoche = tipo ? tipo.precio_base : 180000;
  const { noches, total: subtotal } = calculateTotal(precioNoche, fechaEntrada, fechaSalida);

  const descuento = cuponAplicado ? cuponAplicado.descuento : 0;
  const totalFinal = Math.max(0, subtotal - descuento);

  const handleApplyCupon = () => {
    setMensajeCupon(null);
    const res = validarCupon(codigoCupon, subtotal, noches);
    if (res.valido && res.cupon) {
      setCuponAplicado({ cupon: res.cupon, descuento: res.descuento });
      setMensajeCupon({ exito: true, texto: res.mensaje || '¡Cupón aplicado!' });
    } else {
      setCuponAplicado(null);
      setMensajeCupon({ exito: false, texto: res.mensaje || 'Cupón no válido' });
    }
  };

  const handleRemoveCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setMensajeCupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Call context service
    const result = createReserva({
      id_habitacion: habitacion.id_habitacion,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      cantidad_huespedes: huespedes,
      notas,
      cupon_codigo: cuponAplicado?.cupon.codigo,
      cliente_override: {
        nombre,
        apellido,
        documento,
        telefono,
        correo,
      },
    });

    setIsSubmitting(false);

    if (result.success && result.reserva) {
      onSuccess(result.reserva);
    } else {
      setErrorMessage(result.error || 'Ocurrió un error al procesar la reserva.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-6"
        >
          {/* Header */}
          <div className="bg-[#FAF8F5] px-6 py-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center font-bold text-xs">
                RH
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900 leading-tight">
                  Confirmación de Reserva
                </h3>
                <span className="text-xs text-stone-500">
                  Habitación {habitacion.numero} · {tipo?.nombre} (Piso {habitacion.piso})
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Dates & Guests Block */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Detalles de la Estancia</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Fecha de Entrada
                  </label>
                  <input
                    type="date"
                    value={fechaEntrada}
                    onChange={(e) => setFechaEntrada(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono-numbers bg-white focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono-numbers bg-white focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Huéspedes (máx. {tipo?.capacidad})
                  </label>
                  <select
                    value={huespedes}
                    onChange={(e) => setHuespedes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-1 focus:ring-amber-700 outline-none"
                  >
                    {Array.from({ length: tipo?.capacidad || 2 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Guest Personal Information Block */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>Datos del Huésped Principal</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Documento de Identidad (Cédula o Pasaporte) *
                  </label>
                  <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-numbers focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Teléfono Móvil (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-numbers focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Correo Electrónico de Confirmación *
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-amber-700 outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Peticiones especiales o notas de llegada (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: Hora estimada de llegada, preferencia de almohadas..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-amber-700 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Coupon / Discount Input Block */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>
                <span className="text-[10px] text-stone-400">Ej: ALBORADA10, ESCAPADA50K</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={codigoCupon}
                  disabled={!!cuponAplicado}
                  onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                  placeholder="Ingresa tu cupón"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono-numbers uppercase tracking-wider outline-none focus:ring-1 focus:ring-amber-700 bg-white disabled:bg-stone-100 disabled:text-stone-500"
                />
                {cuponAplicado ? (
                  <button
                    type="button"
                    onClick={handleRemoveCupon}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  >
                    Remover
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCupon}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                  >
                    Aplicar
                  </button>
                )}
              </div>

              {mensajeCupon && (
                <div className={`text-[11px] font-medium flex items-center gap-1.5 ${mensajeCupon.exito ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {mensajeCupon.exito && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{mensajeCupon.texto}</span>
                </div>
              )}
            </div>

            {/* Pricing Calculation Summary (Server-authoritative per RN02) */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Tarifa por noche ({tipo?.nombre}):</span>
                <span className="font-mono-numbers">{formatCOP(precioNoche)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Número de noches:</span>
                <span className="font-mono-numbers font-medium">{noches} noches</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Subtotal estancia:</span>
                <span className="font-mono-numbers font-medium">{formatCOP(subtotal)}</span>
              </div>

              {cuponAplicado && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-1 rounded-lg border border-emerald-200/80">
                  <span>Descuento cupón ({cuponAplicado.cupon.codigo}):</span>
                  <span className="font-mono-numbers">- {formatCOP(descuento)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-stone-600">
                <span>Impuestos & Servicios hoteleros:</span>
                <span className="text-emerald-700 font-medium">Incluidos (100% transparente)</span>
              </div>

              <div className="pt-2 border-t border-amber-200 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Total a Pagar:</span>
                  <span className="text-[11px] text-stone-500">Se abona al momento del check-in</span>
                </div>
                <span className="text-xl font-bold text-amber-950 font-mono-numbers">
                  {formatCOP(totalFinal)}
                </span>
              </div>
            </div>

            {/* Trust and Policy Notice */}
            <div className="text-[11px] text-stone-500 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-800" />
                <span>Política de Cancelación Flexible</span>
              </div>
              <p>
                Puedes cancelar sin ningún costo hasta 48 horas antes de la fecha de entrada. La reserva se genera en estado PENDIENTE y queda asegurada con tu código único.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting || noches <= 0}
                className="px-7 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Confirmar Reserva</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
