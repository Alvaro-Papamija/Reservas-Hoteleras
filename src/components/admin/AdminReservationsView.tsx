import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Reserva, EstadoReserva } from '../../types/hotel';
import { formatCOP, formatDateDMY, formatDateReadable, getEstadoReservaColor } from '../../utils/formatters';
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
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminReservationsView: React.FC = () => {
  const { reservas, cambiarEstadoReserva } = useHotel();

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoReserva | 'TODAS'>('TODAS');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Recepción & Control Operativo
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Gestión Integral de Reservas
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Administración de solicitudes, confirmación de pagos en counter y seguimiento del ciclo de vida del huésped.
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
          {(['TODAS', 'PENDIENTE', 'CONFIRMADA', 'FINALIZADA', 'CANCELADA'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterEstado(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                filterEstado === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'TODAS' ? 'Todas' : st.charAt(0) + st.slice(1).toLowerCase()}
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
                <th className="py-3.5 px-4 font-semibold">Noches</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total (COP)</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Transición de Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => {
                const badge = getEstadoReservaColor(r.estado);

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
                      Hab. {r.habitacion_numero} ({r.habitacion_tipo})
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers text-stone-600">
                      {formatDateDMY(r.fecha_entrada)} → {formatDateDMY(r.fecha_salida)}
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers text-stone-600">
                      {r.cantidad_noches}n ({r.cantidad_huespedes}p)
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers font-bold text-stone-900 text-right">
                      {formatCOP(r.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* State machine buttons according to HU10 */}
                        {r.estado === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={() => handleStateChange(r.id_reserva, 'CONFIRMADA')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors"
                              title="Pasar a Confirmada"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleStateChange(r.id_reserva, 'CANCELADA')}
                              className="px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px] transition-colors"
                              title="Cancelar reserva"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {r.estado === 'CONFIRMADA' && (
                          <>
                            <button
                              onClick={() => handleStateChange(r.id_reserva, 'FINALIZADA')}
                              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white font-medium text-[11px] transition-colors"
                              title="Pasar a Finalizada (Check-out)"
                            >
                              Finalizar
                            </button>
                            <button
                              onClick={() => handleStateChange(r.id_reserva, 'CANCELADA')}
                              className="px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px] transition-colors"
                              title="Cancelar reserva"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {(r.estado === 'FINALIZADA' || r.estado === 'CANCELADA') && (
                          <span className="text-[11px] text-stone-400 italic">Estado final</span>
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

      {/* Reservation Detail Modal */}
      {selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
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
                <span className="text-stone-400">Contacto:</span>
                <span>{selectedReserva.cliente_correo} · {selectedReserva.cliente_telefono}</span>
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
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Huéspedes:</span>
                <span>{selectedReserva.cantidad_huespedes} personas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-400">Total liquidado:</span>
                <span className="font-bold font-mono-numbers text-amber-900 text-sm">
                  {formatCOP(selectedReserva.total)}
                </span>
              </div>
              {selectedReserva.notas && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  <span className="font-semibold text-stone-800 block mb-0.5">Notas especiales:</span>
                  {selectedReserva.notas}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-end">
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
    </div>
  );
};
