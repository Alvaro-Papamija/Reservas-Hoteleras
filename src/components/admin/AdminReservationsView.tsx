import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Reserva, EstadoReserva, MetodoPago } from '../../types/hotel';
import { formatCOP, formatDateDMY, formatDateReadable, getEstadoReservaColor } from '../../utils/formatters';
import { generarComprobantePDF } from '../../utils/pdfGenerator';
import { EmailConfirmationModal } from '../EmailConfirmationModal';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  CheckCheck,
  Eye,
  AlertTriangle,
  Clock,
  Calendar,
  X,
  User,
  Download,
  Mail,
  CreditCard,
  Key,
  DollarSign,
  LogOut,
  Receipt,
  CalendarDays,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminReservationsView: React.FC = () => {
  const {
    reservas,
    cambiarEstadoReserva,
    modificarFechasReserva,
    registrarPago,
    registrarCheckIn,
    registrarCheckOut,
  } = useHotel();

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoReserva | 'TODAS'>('TODAS');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal HU-10: Pagos y Abonos
  const [reservaParaPago, setReservaParaPago] = useState<Reserva | null>(null);
  const [montoPago, setMontoPago] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [pagoError, setPagoError] = useState<string | null>(null);

  // Modal HU-11: Check-in y Asignación de Llave
  const [reservaParaCheckIn, setReservaParaCheckIn] = useState<Reserva | null>(null);
  const [numeroLlave, setNumeroLlave] = useState<string>('');
  const [checkInError, setCheckInError] = useState<string | null>(null);

  // Modal HU-08: Modificación de Fechas
  const [reservaParaModificar, setReservaParaModificar] = useState<Reserva | null>(null);
  const [nuevaEntrada, setNuevaEntrada] = useState<string>('');
  const [nuevaSalida, setNuevaSalida] = useState<string>('');
  const [modificarError, setModificarError] = useState<string | null>(null);

  const getSaldo = (r: Reserva): number => {
    const totalPagado = (r.pagos || []).reduce((acc, p) => acc + p.monto, 0);
    return r.saldo ?? Math.max(0, r.total - totalPagado);
  };

  const filtered = reservas.filter((r) => {
    if (filterEstado !== 'TODAS' && r.estado !== filterEstado) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCodigo = r.codigo.toLowerCase().includes(q);
      const matchNombre = r.cliente_nombre.toLowerCase().includes(q);
      const matchDoc = r.cliente_documento.toLowerCase().includes(q);
      const matchHab = r.habitacion_numero.toLowerCase().includes(q);
      return matchCodigo || matchNombre || matchDoc || matchHab;
    }
    return true;
  });

  const handleStateChange = (id: number, nuevoEstado: EstadoReserva) => {
    setActionError(null);
    const res = cambiarEstadoReserva(id, nuevoEstado);
    if (res.success) {
      setActionSuccess(`Estado de la reserva actualizado a ${nuevoEstado}.`);
      if (selectedReserva && selectedReserva.id_reserva === id) {
        setSelectedReserva({ ...selectedReserva, estado: nuevoEstado });
      }
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(res.error || 'No se pudo actualizar el estado.');
    }
  };

  // HU-10: Handler para registrar pago
  const handleGuardarPago = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaParaPago) return;
    setPagoError(null);

    const res = registrarPago(reservaParaPago.id_reserva, montoPago, metodoPago);
    if (res.success && res.pago) {
      setActionSuccess(`Pago de ${formatCOP(montoPago)} registrado con éxito (Recibo: ${res.pago.recibo_caja}).`);
      setReservaParaPago(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setPagoError(res.error || 'Error al procesar el pago.');
    }
  };

  // HU-11: Handler para registrar check-in
  const handleGuardarCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaParaCheckIn) return;
    setCheckInError(null);

    const res = registrarCheckIn(reservaParaCheckIn.id_reserva, numeroLlave);
    if (res.success) {
      setActionSuccess(`Check-in registrado para la Habitación ${reservaParaCheckIn.habitacion_numero} (Llave: ${numeroLlave}).`);
      setReservaParaCheckIn(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setCheckInError(res.error || 'Error al procesar el check-in.');
    }
  };

  // HU-12: Handler para registrar check-out
  const handleEjecutarCheckOut = (r: Reserva) => {
    setActionError(null);
    const saldo = getSaldo(r);
    if (saldo > 0) {
      setActionError(`No se puede realizar Check-out: la reserva tiene un saldo pendiente de ${formatCOP(saldo)}. Por favor registra el pago antes de cerrar la cuenta.`);
      setReservaParaPago(r);
      setMontoPago(saldo);
      return;
    }

    const res = registrarCheckOut(r.id_reserva);
    if (res.success) {
      setActionSuccess(`Check-out completado. Habitación ${r.habitacion_numero} liberada a Disponible.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(res.error || 'Error al procesar check-out.');
    }
  };

  // HU-08: Handler para modificar fechas
  const handleGuardarModificacionFechas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaParaModificar) return;
    setModificarError(null);

    const res = modificarFechasReserva(reservaParaModificar.id_reserva, nuevaEntrada, nuevaSalida);
    if (res.success) {
      setActionSuccess(`Fechas de la reserva ${reservaParaModificar.codigo} actualizadas exitosamente.`);
      setReservaParaModificar(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setModificarError(res.error || 'Error al modificar fechas.');
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Front-Desk, Caja & Control Operativo
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Gestión Integral de Reservas
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Recepción, registro de abonos en caja, asignación de llaves (Check-in), liquidación y Check-out.
          </p>
        </div>

        <div className="text-xs text-stone-500 font-mono-numbers">
          Total registradas: <strong className="text-stone-900">{reservas.length}</strong>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(['TODAS', 'PENDIENTE', 'CONFIRMADA', 'CHECK_IN', 'FINALIZADA', 'CANCELADA'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterEstado(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                filterEstado === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'TODAS'
                ? 'Todas'
                : st === 'CHECK_IN'
                ? 'En Hospedaje'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por código, huésped, doc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Código</th>
                <th className="py-3.5 px-4 font-semibold">Huésped</th>
                <th className="py-3.5 px-4 font-semibold">Habitación</th>
                <th className="py-3.5 px-4 font-semibold">Fechas</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total / Saldo</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Operaciones de Front-Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => {
                const badge = getEstadoReservaColor(r.estado);
                const saldo = getSaldo(r);

                return (
                  <tr key={r.id_reserva} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono-numbers font-bold text-stone-900">
                      {r.codigo}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{r.cliente_nombre}</div>
                      <div className="text-[11px] text-stone-400 font-mono-numbers">
                        CC: {r.cliente_documento}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700">
                      <div>Hab. {r.habitacion_numero} ({r.habitacion_tipo})</div>
                      {r.numero_llave && (
                        <div className="text-[10px] text-blue-700 font-mono-numbers flex items-center gap-1 mt-0.5">
                          <Key className="w-2.5 h-2.5" />
                          <span>Llave: {r.numero_llave}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers text-stone-600">
                      <div>{formatDateDMY(r.fecha_entrada)} → {formatDateDMY(r.fecha_salida)}</div>
                      <div className="text-[10px] text-stone-400">{r.cantidad_noches}n ({r.cantidad_huespedes}p)</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-numbers">
                      <div className="font-bold text-stone-900">{formatCOP(r.total)}</div>
                      {saldo > 0 ? (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Debe: {formatCOP(saldo)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Saldado $0
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* HU-10: Registrar Abono */}
                        {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA' || r.estado === 'CHECK_IN') && saldo > 0 && (
                          <button
                            onClick={() => {
                              setReservaParaPago(r);
                              setMontoPago(saldo);
                              setPagoError(null);
                            }}
                            className="px-2 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                            title="Registrar Abono o Pago en Caja"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Abonar</span>
                          </button>
                        )}

                        {/* HU-08: Modificar Fechas */}
                        {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                          <button
                            onClick={() => {
                              setReservaParaModificar(r);
                              setNuevaEntrada(r.fecha_entrada);
                              setNuevaSalida(r.fecha_salida);
                              setModificarError(null);
                            }}
                            className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                            title="Modificar Fechas de Reserva"
                          >
                            <CalendarDays className="w-3.5 h-3.5 text-amber-800" />
                          </button>
                        )}

                        {/* Transición PENDIENTE -> CONFIRMAR */}
                        {r.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => handleStateChange(r.id_reserva, 'CONFIRMADA')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px]"
                            title="Confirmar Reserva"
                          >
                            Confirmar
                          </button>
                        )}

                        {/* HU-11: Check-in con Llave */}
                        {r.estado === 'CONFIRMADA' && (
                          <button
                            onClick={() => {
                              setReservaParaCheckIn(r);
                              setNumeroLlave(`Llave-${r.habitacion_numero}`);
                              setCheckInError(null);
                            }}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] flex items-center gap-1"
                            title="Realizar Check-in y asignar llave física"
                          >
                            <Key className="w-3 h-3" />
                            <span>Check-in</span>
                          </button>
                        )}

                        {/* HU-12: Check-out con validación de saldo */}
                        {(r.estado === 'CONFIRMADA' || r.estado === 'CHECK_IN') && (
                          <button
                            onClick={() => handleEjecutarCheckOut(r)}
                            className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white font-medium text-[11px] flex items-center gap-1"
                            title="Realizar Check-out (exige saldo $0)"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check-out</span>
                          </button>
                        )}

                        {/* Cancelar Reserva */}
                        {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                          <button
                            onClick={() => handleStateChange(r.id_reserva, 'CANCELADA')}
                            className="px-2 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px]"
                            title="Cancelar reserva"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReserva(r)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition-colors"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal HU-10: Registrar Pago / Abono */}
      {reservaParaPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Registrar Pago en Counter</h3>
                  <span className="text-xs text-stone-400 font-mono-numbers">Reserva: {reservaParaPago.codigo}</span>
                </div>
              </div>
              <button
                onClick={() => setReservaParaPago(null)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Huésped:</span>
                <span className="font-semibold text-stone-900">{reservaParaPago.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Liquidado:</span>
                <span className="font-mono-numbers">{formatCOP(reservaParaPago.total)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-1 font-bold">
                <span className="text-rose-700">Saldo Pendiente:</span>
                <span className="text-rose-700 font-mono-numbers">{formatCOP(getSaldo(reservaParaPago))}</span>
              </div>
            </div>

            {pagoError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {pagoError}
              </div>
            )}

            <form onSubmit={handleGuardarPago} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Monto a Abonar (COP)</label>
                <input
                  type="number"
                  min={1000}
                  max={getSaldo(reservaParaPago)}
                  value={montoPago}
                  onChange={(e) => setMontoPago(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono-numbers outline-none focus:ring-1 focus:ring-amber-700 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Método de Pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700 bg-white"
                >
                  <option value="EFECTIVO">Efectivo en Recepción</option>
                  <option value="TARJETA">Tarjeta Débito / Crédito (Datafono)</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria / QR</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReservaParaPago(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs"
                >
                  Confirmar e Imprimir Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal HU-11: Check-in con Llave Física */}
      {reservaParaCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Check-in de Huésped</h3>
                  <span className="text-xs text-stone-400">Habitación {reservaParaCheckIn.habitacion_numero}</span>
                </div>
              </div>
              <button
                onClick={() => setReservaParaCheckIn(null)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Confirma la llegada del titular <strong>{reservaParaCheckIn.cliente_nombre}</strong> (Doc: {reservaParaCheckIn.cliente_documento}) y asigna el identificador de la llave física entregada.
            </p>

            {checkInError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {checkInError}
              </div>
            )}

            <form onSubmit={handleGuardarCheckIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Identificador de Llave Física / Tarjeta</label>
                <input
                  type="text"
                  value={numeroLlave}
                  onChange={(e) => setNumeroLlave(e.target.value)}
                  placeholder="ej. Llave 204-A / Tarjeta RF-08"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReservaParaCheckIn(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                >
                  Confirmar Entrega de Llave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal HU-08: Modificar Fechas */}
      {reservaParaModificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Modificar Fechas de Reserva</h3>
                  <span className="text-xs text-stone-400">{reservaParaModificar.codigo} · Hab. {reservaParaModificar.habitacion_numero}</span>
                </div>
              </div>
              <button
                onClick={() => setReservaParaModificar(null)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modificarError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {modificarError}
              </div>
            )}

            <form onSubmit={handleGuardarModificacionFechas} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Nueva Entrada</label>
                  <input
                    type="date"
                    value={nuevaEntrada}
                    onChange={(e) => setNuevaEntrada(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700 font-mono-numbers"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Nueva Salida</label>
                  <input
                    type="date"
                    value={nuevaSalida}
                    onChange={(e) => setNuevaSalida(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700 font-mono-numbers"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500">
                El sistema verificará automáticamente la disponibilidad sin sobreventa y recalculará el costo total y saldo.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReservaParaModificar(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs text-stone-400 font-mono-numbers">
                  Expediente de Reserva
                </span>
                <h3 className="text-lg font-bold font-mono-numbers text-stone-900">
                  {selectedReserva.codigo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReserva(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Huésped:</span>
                <span className="font-semibold text-stone-900">{selectedReserva.cliente_nombre}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Documento / Cédula:</span>
                <span className="font-mono-numbers">{selectedReserva.cliente_documento}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Habitación:</span>
                <span className="font-semibold text-stone-900">
                  Habitación {selectedReserva.habitacion_numero} ({selectedReserva.habitacion_tipo})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Período de alojamiento:</span>
                <span className="font-mono-numbers">
                  {formatDateDMY(selectedReserva.fecha_entrada)} al {formatDateDMY(selectedReserva.fecha_salida)} ({selectedReserva.cantidad_noches} noches)
                </span>
              </div>
              {selectedReserva.numero_llave && (
                <div className="flex justify-between py-1.5 border-b border-stone-100 text-blue-800">
                  <span>Llave asignada:</span>
                  <span className="font-bold">{selectedReserva.numero_llave}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Total liquidado:</span>
                <span className="font-bold font-mono-numbers text-stone-900">
                  {formatCOP(selectedReserva.total)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 font-bold">
                <span className="text-stone-400">Saldo pendiente:</span>
                <span className="font-mono-numbers text-amber-900">
                  {formatCOP(getSaldo(selectedReserva))}
                </span>
              </div>

              {/* Historial de Pagos / Abonos */}
              <div className="pt-2">
                <span className="font-semibold text-stone-800 block mb-1.5">Historial de Abonos / Pagos:</span>
                {(!selectedReserva.pagos || selectedReserva.pagos.length === 0) ? (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 italic text-center">
                    No se han registrado pagos en counter aún.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedReserva.pagos.map((p) => (
                      <div key={p.id_pago} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/70 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-900">{formatCOP(p.monto)} · {p.metodo}</div>
                          <div className="text-[10px] text-stone-400 font-mono-numbers">{p.recibo_caja} · {p.fecha.slice(0, 10)}</div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Asentado
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedReserva.motivo_cancelacion && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-semibold block mb-0.5">Motivo de cancelación:</span>
                  {selectedReserva.motivo_cancelacion}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generarComprobantePDF(selectedReserva)}
                  className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ver Correo</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedReserva(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email confirmation modal */}
      {showEmailModal && selectedReserva && (
        <EmailConfirmationModal
          reserva={selectedReserva}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};
