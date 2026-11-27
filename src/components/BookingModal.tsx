import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion, Reserva, Cupon, TipoDocumentoLegal, MetodoPago } from '../types/hotel';
import { formatCOP, formatDateDMY } from '../utils/formatters';
import {
  validateEmail,
  validateColombianPhone,
  validateDocumento,
  validateLuhnCard,
  validateCardExpiry,
  validateCardCVV,
  validateReservationDates,
  validateGuestCapacity,
} from '../utils/validators';
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
  Scale,
  CheckCircle2,
  Building,
  Banknote,
  Smartphone,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  habitacion: Habitacion | null;
  defaultEntrada?: string;
  defaultSalida?: string;
  defaultHuespedes?: number;
  onClose: () => void;
  onSuccess: (reserva: Reserva) => void;
  onOpenLegal?: (doc: TipoDocumentoLegal) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  habitacion,
  defaultEntrada = '2026-12-15',
  defaultSalida = '2026-12-18',
  defaultHuespedes = 2,
  onClose,
  onSuccess,
  onOpenLegal,
}) => {
  const {
    tipos,
    currentCliente,
    currentUser,
    createReserva,
    registrarPago,
    calculateTotal,
    validarCupon,
    isApiConnected,
  } = useHotel();

  // Reservation details
  const [fechaEntrada, setFechaEntrada] = useState(defaultEntrada);
  const [fechaSalida, setFechaSalida] = useState(defaultSalida);
  const [huespedes, setHuespedes] = useState(defaultHuespedes);
  const [notas, setNotas] = useState('');

  // Legal consent states (Mandatory unselected by default per Ley 1581 and Ley 1480)
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [autorizaDatos, setAutorizaDatos] = useState(false);
  const [autorizaPromociones, setAutorizaPromociones] = useState(false);

  // Coupons
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState<{ cupon: Cupon; descuento: number } | null>(null);
  const [mensajeCupon, setMensajeCupon] = useState<{ exito: boolean; texto: string } | null>(null);

  // Guest details
  const [nombre, setNombre] = useState(currentCliente?.nombre || 'Laura');
  const [apellido, setApellido] = useState(currentCliente?.apellido || 'Gómez');
  const [tipoDocumento, setTipoDocumento] = useState<string>(currentCliente?.tipo_documento || 'CC');
  const [documento, setDocumento] = useState(currentCliente?.documento || '1085294821');
  const [telefono, setTelefono] = useState(currentCliente?.telefono || '+57 312 458 9012');
  const [correo, setCorreo] = useState(currentCliente?.correo || currentUser?.correo || 'laura.gomez@ejemplo.com');

  // Integrated Payment Selection
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('TARJETA');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState(currentCliente ? `${currentCliente.nombre} ${currentCliente.apellido}` : 'LAURA GOMEZ');
  const [expiracionTarjeta, setExpiracionTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('');
  const [bancoPSE, setBancoPSE] = useState('Bancolombia');

  // Form errors & submission
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accessibility: Close with Escape
  useEffect(() => {
    if (!habitacion) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [habitacion, onClose]);

  if (!habitacion) return null;

  const tipo = tipos.find((t) => t.id_tipo === habitacion.id_tipo);
  const precioNoche = tipo ? tipo.precio_base : 180000;
  const { noches, total: subtotal } = calculateTotal(precioNoche, fechaEntrada, fechaSalida);

  const descuento = cuponAplicado ? cuponAplicado.descuento : 0;
  const totalFinal = Math.max(0, subtotal - descuento);
  const ivaInformativo = Math.round(totalFinal * 0.19);

  // Format Card Number & detect brand
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 19);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroTarjeta(formatted);

    if (raw.length >= 1) {
      if (raw.startsWith('4')) setCardBrand('Visa');
      else if (/^(5[1-5]|2[2-7])/.test(raw)) setCardBrand('Mastercard');
      else if (/^3[47]/.test(raw)) setCardBrand('American Express');
      else setCardBrand('');
    } else {
      setCardBrand('');
    }
  };

  const handleExpiryChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setExpiracionTarjeta(clean);
  };

  const handleApplyCupon = () => {
    setMensajeCupon(null);
    const res = validarCupon(codigoCupon, subtotal, noches);
    if (res.valido && res.cupon) {
      setCuponAplicado({ cupon: res.cupon, descuento: res.descuento });
      setMensajeCupon({ exito: true, texto: res.mensaje || '¡Cupón aplicado exitosamente!' });
    } else {
      setCuponAplicado(null);
      setMensajeCupon({ exito: false, texto: res.mensaje || 'Cupón no válido o vencido.' });
    }
  };

  const handleRemoveCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setMensajeCupon(null);
  };

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};

    // Dates
    const datesRes = validateReservationDates(fechaEntrada, fechaSalida);
    if (!datesRes.valid) errors.fechas = datesRes.error!;

    // Capacity
    const capRes = validateGuestCapacity(huespedes, tipo?.capacidad || 4);
    if (!capRes.valid) errors.huespedes = capRes.error!;

    // Guest Info
    if (!nombre.trim() || nombre.trim().length < 2) errors.nombre = 'Ingrese un nombre válido (mínimo 2 caracteres).';
    if (!apellido.trim() || apellido.trim().length < 2) errors.apellido = 'Ingrese un apellido válido.';

    const docRes = validateDocumento(documento, tipoDocumento);
    if (!docRes.valid) errors.documento = docRes.error!;

    const phoneRes = validateColombianPhone(telefono);
    if (!phoneRes.valid) errors.telefono = phoneRes.error!;

    const emailRes = validateEmail(correo);
    if (!emailRes.valid) errors.correo = emailRes.error!;

    // Payment validation
    if (metodoPago === 'TARJETA') {
      const cardRes = validateLuhnCard(numeroTarjeta);
      if (!cardRes.valid) errors.tarjeta = cardRes.error!;

      const expRes = validateCardExpiry(expiracionTarjeta);
      if (!expRes.valid) errors.expiracion = expRes.error!;

      const cvvRes = validateCardCVV(cvvTarjeta, cardBrand);
      if (!cvvRes.valid) errors.cvv = cvvRes.error!;

      if (!nombreTarjeta.trim() || nombreTarjeta.trim().length < 4) {
        errors.nombreTarjeta = 'Ingrese el nombre del titular como aparece en el plástico.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Mandatory Legal Checkboxes
    if (!aceptaTerminos || !autorizaDatos) {
      setErrorMessage(
        'Debe aceptar los Términos y Condiciones y autorizar de forma expresa el tratamiento de sus datos personales conforme a la Ley 1581 de 2012 para confirmar la reserva.'
      );
      return;
    }

    // 2. Validate all inputs
    if (!validateAll()) {
      setErrorMessage('Por favor verifique los campos marcados en rojo antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    // 3. Create Reservation in Context & Backend API
    const result = createReserva({
      id_habitacion: habitacion.id_habitacion,
      fecha_entrada: fechaEntrada,
      fechaSalida: fechaSalida,
      cantidad_huespedes: huespedes,
      notas: `${notas}${metodoPago !== 'EFECTIVO' ? ` [Pago Online con ${metodoPago}]` : ' [Pago en Recepción]'}`,
      cupon_codigo: cuponAplicado?.cupon.codigo,
      cliente_override: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        tipo_documento: tipoDocumento as any,
        documento: documento.trim(),
        telefono: telefono.trim(),
        correo: correo.trim().toLowerCase(),
      },
      consentimiento_legal: {
        acepto_terminos: true,
        autorizo_tratamiento_datos: true,
        autorizo_comunicaciones_comerciales: autorizaPromociones,
        version_politica: 'v1.0-2026',
        fecha_consentimiento: new Date().toISOString(),
      },
    });

    if (result.success && result.reserva) {
      // 4. If payment was made online (Card or PSE), immediately register the payment
      if (metodoPago !== 'EFECTIVO') {
        const pagoRes = registrarPago(result.reserva.id_reserva, totalFinal, metodoPago);
        if (pagoRes.success && pagoRes.pago) {
          result.reserva.pagos = [pagoRes.pago];
          result.reserva.saldo = 0;
          result.reserva.estado = 'CONFIRMADA';
        }
      }

      setIsSubmitting(false);
      onSuccess(result.reserva);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Ocurrió un error al procesar la reserva en la plataforma.');
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Confirmación de Reserva y Pasarela de Pago"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-4 sm:my-6 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Fijo */}
          <div className="bg-[#FAF8F5] px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-700 text-amber-50 flex items-center justify-center font-bold text-xs shadow-xs">
                RH
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 leading-tight">
                  Checkout & Confirmación de Reserva
                </h3>
                <span className="text-[11px] text-stone-500">
                  Habitación {habitacion.numero} · {tipo?.nombre} (Piso {habitacion.piso})
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulario con Scroll Interno */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Bloque 1: Fechas y Huéspedes */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>1. Detalles de la Estancia</span>
                </h4>
                <span className="text-[11px] font-mono-numbers text-amber-800 font-bold bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {noches > 0 ? `${noches} ${noches === 1 ? 'noche' : 'noches'}` : 'Fechas inválidas'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Fecha de Entrada *
                  </label>
                  <input
                    type="date"
                    value={fechaEntrada}
                    onChange={(e) => {
                      setFechaEntrada(e.target.value);
                      delete fieldErrors.fechas;
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers bg-white focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.fechas ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Fecha de Salida *
                  </label>
                  <input
                    type="date"
                    value={fechaSalida}
                    onChange={(e) => {
                      setFechaSalida(e.target.value);
                      delete fieldErrors.fechas;
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers bg-white focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.fechas ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Huéspedes (máx. {tipo?.capacidad})
                  </label>
                  <select
                    value={huespedes}
                    onChange={(e) => {
                      setHuespedes(Number(e.target.value));
                      delete fieldErrors.huespedes;
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-white focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.huespedes ? 'border-rose-400' : 'border-stone-300'
                    }`}
                  >
                    {Array.from({ length: tipo?.capacidad || 2 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {fieldErrors.fechas && (
                <div className="text-[11px] text-rose-600 font-medium">{fieldErrors.fechas}</div>
              )}
            </div>

            {/* Bloque 2: Datos del Huésped */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>2. Datos del Huésped Principal (Validación Ley 1581)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      delete fieldErrors.nombre;
                    }}
                    placeholder="Ej: Laura"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.nombre ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    required
                  />
                  {fieldErrors.nombre && (
                    <span className="text-[10px] text-rose-600">{fieldErrors.nombre}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => {
                      setApellido(e.target.value);
                      delete fieldErrors.apellido;
                    }}
                    placeholder="Ej: Gómez"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.apellido ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    required
                  />
                  {fieldErrors.apellido && (
                    <span className="text-[10px] text-rose-600">{fieldErrors.apellido}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Tipo y Documento de Identidad *
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="w-20 px-2 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 font-medium"
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="PAS">PAS</option>
                      <option value="TI">TI</option>
                    </select>
                    <input
                      type="text"
                      value={documento}
                      onChange={(e) => {
                        setDocumento(e.target.value);
                        delete fieldErrors.documento;
                      }}
                      placeholder="Número de documento"
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono-numbers focus:ring-1 focus:ring-amber-700 outline-none ${
                        fieldErrors.documento ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.documento && (
                    <span className="text-[10px] text-rose-600">{fieldErrors.documento}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Teléfono Celular (WhatsApp Colombia) *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value);
                      delete fieldErrors.telefono;
                    }}
                    placeholder="Ej: 312 458 9012 o +57 312 458 9012"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.telefono ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    required
                  />
                  {fieldErrors.telefono && (
                    <span className="text-[10px] text-rose-600">{fieldErrors.telefono}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Correo Electrónico (Envío de Voucher & Confirmación) *
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      delete fieldErrors.correo;
                    }}
                    placeholder="ejemplo@correo.com"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-700 outline-none ${
                      fieldErrors.correo ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    required
                  />
                  {fieldErrors.correo && (
                    <span className="text-[10px] text-rose-600">{fieldErrors.correo}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bloque 3: Pasarela de Pago Integrada */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                  <span>3. Método de Pago Integrado</span>
                </h4>
                <span className="text-[10px] text-stone-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> Cifrado SSL 256-bit
                </span>
              </div>

              {/* Selector de Método */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'TARJETA', label: 'Tarjeta Crédito/Débito', icon: CreditCard },
                  { id: 'TRANSFERENCIA', label: 'PSE / Transferencia', icon: Building },
                  { id: 'EFECTIVO', label: 'Pago en Recepción', icon: Banknote },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = metodoPago === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMetodoPago(item.id as MetodoPago)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-700 bg-white text-stone-900 shadow-sm ring-1 ring-amber-700'
                          : 'border-stone-200 bg-stone-100/60 text-stone-600 hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                      <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Campos específicos según el método */}
              {metodoPago === 'TARJETA' && (
                <div className="space-y-3 pt-2 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                    <span>Datos de la Tarjeta</span>
                    {cardBrand && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {cardBrand}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                      Número de Tarjeta (Validación Algoritmo de Luhn) *
                    </label>
                    <input
                      type="text"
                      value={numeroTarjeta}
                      onChange={(e) => {
                        handleCardNumberChange(e.target.value);
                        delete fieldErrors.tarjeta;
                      }}
                      placeholder="4000 1234 5678 9010"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers tracking-widest outline-none ${
                        fieldErrors.tarjeta ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                      }`}
                    />
                    {fieldErrors.tarjeta && (
                      <span className="text-[10px] text-rose-600">{fieldErrors.tarjeta}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Vencimiento (MM/AA) *
                      </label>
                      <input
                        type="text"
                        value={expiracionTarjeta}
                        onChange={(e) => {
                          handleExpiryChange(e.target.value);
                          delete fieldErrors.expiracion;
                        }}
                        placeholder="MM/AA"
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers outline-none ${
                          fieldErrors.expiracion ? 'border-rose-400' : 'border-stone-300'
                        }`}
                      />
                      {fieldErrors.expiracion && (
                        <span className="text-[10px] text-rose-600">{fieldErrors.expiracion}</span>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvvTarjeta}
                        onChange={(e) => {
                          setCvvTarjeta(e.target.value.replace(/\D/g, ''));
                          delete fieldErrors.cvv;
                        }}
                        placeholder="123"
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono-numbers outline-none ${
                          fieldErrors.cvv ? 'border-rose-400' : 'border-stone-300'
                        }`}
                      />
                      {fieldErrors.cvv && (
                        <span className="text-[10px] text-rose-600">{fieldErrors.cvv}</span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Titular de la Tarjeta *
                      </label>
                      <input
                        type="text"
                        value={nombreTarjeta}
                        onChange={(e) => {
                          setNombreTarjeta(e.target.value.toUpperCase());
                          delete fieldErrors.nombreTarjeta;
                        }}
                        placeholder="COMO APARECE EN LA TARJETA"
                        className={`w-full px-3 py-2 rounded-xl border text-xs uppercase outline-none ${
                          fieldErrors.nombreTarjeta ? 'border-rose-400' : 'border-stone-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === 'TRANSFERENCIA' && (
                <div className="space-y-3 pt-2 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                    <span>Pago Seguro en Línea (PSE Colombia)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">PSE</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                      Seleccione su Banco / Billetera Digital *
                    </label>
                    <select
                      value={bancoPSE}
                      onChange={(e) => setBancoPSE(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-1 focus:ring-amber-700 outline-none"
                    >
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="BBVA Colombia">BBVA Colombia</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Al confirmar, se generará la referencia de pago oficial conectada con la pasarela bancaria.
                  </p>
                </div>
              )}

              {metodoPago === 'EFECTIVO' && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Garantía de Reserva con Pago al Check-In</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Tu suite quedará bloqueada en el inventario del hotel. Podrás liquidar el total en recepción al llegar en efectivo, datáfono o transferencia física.
                  </p>
                </div>
              )}
            </div>

            {/* Bloque 4: Cupón de Descuento */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>
                <span className="text-[10px] text-stone-400">Ej: ALBORADA10, VERANO2026</span>
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
                <div
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    mensajeCupon.exito ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {mensajeCupon.exito && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{mensajeCupon.texto}</span>
                </div>
              )}
            </div>

            {/* Bloque 5: Liquidación Financiera Transparente */}
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

              <div className="flex justify-between text-xs text-stone-500">
                <span>Impuesto IVA (19% discriminado):</span>
                <span className="font-mono-numbers">{formatCOP(ivaInformativo)} (Incluido)</span>
              </div>

              <div className="pt-2 border-t border-amber-200 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Total a Pagar:</span>
                  <span className="text-[11px] text-stone-500">
                    {metodoPago === 'EFECTIVO' ? 'Pendiente al Check-In' : 'Liquidación Inmediata'}
                  </span>
                </div>
                <span className="text-xl font-bold text-amber-950 font-mono-numbers">
                  {formatCOP(totalFinal)}
                </span>
              </div>
            </div>

            {/* Bloque 6: Autorizaciones Legales (Ley 1581 de 2012 y Ley 1480 de 2011) */}
            <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200/90 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>Autorizaciones Legales & Protección de Datos</span>
              </div>

              {/* Checkbox 1: Terms & Cancellation */}
              <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-700 focus:ring-offset-0"
                  required
                />
                <span className="leading-relaxed">
                  He leído y acepto los{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal && onOpenLegal('terminos')}
                    className="text-amber-800 underline font-semibold hover:text-amber-900 inline"
                  >
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal && onOpenLegal('retracto')}
                    className="text-amber-800 underline font-semibold hover:text-amber-900 inline"
                  >
                    Política de Cancelación y Retracto
                  </button>{' '}
                  (Ley 1480 de 2011). <span className="text-rose-600 font-bold">*</span>
                </span>
              </label>

              {/* Checkbox 2: Habeas Data */}
              <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autorizaDatos}
                  onChange={(e) => setAutorizaDatos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-700 focus:ring-offset-0"
                  required
                />
                <span className="leading-relaxed">
                  Autorizo de manera previa y expresa a ALBORADA HOSPITALITY S.A.S. para tratar mis datos personales conforme a su{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal && onOpenLegal('privacidad')}
                    className="text-amber-800 underline font-semibold hover:text-amber-900 inline"
                  >
                    Política de Tratamiento de Datos Personales
                  </button>{' '}
                  (Ley 1581 de 2012). <span className="text-rose-600 font-bold">*</span>
                </span>
              </label>

              {/* Checkbox 3: Marketing */}
              <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer select-none pt-1 border-t border-stone-200/60">
                <input
                  type="checkbox"
                  checked={autorizaPromociones}
                  onChange={(e) => setAutorizaPromociones(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-700 focus:ring-offset-0"
                />
                <span className="leading-relaxed text-[11px]">
                  (Opcional) Deseo recibir ofertas exclusivas y novedades por correo electrónico.
                </span>
              </label>
            </div>

            {/* Footer con Acciones */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                {isApiConnected ? 'Sincronización API REST Activa' : 'Modo Resiliente Local'}
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || noches <= 0}
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Procesando Pago y Reserva...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>
                        {metodoPago === 'EFECTIVO' ? 'Confirmar Reserva' : 'Pagar y Confirmar'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
