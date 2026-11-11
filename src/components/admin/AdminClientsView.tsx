import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Cliente, Reserva } from '../../types/hotel';
import { formatCOP, formatDateDMY, formatDateReadable } from '../../utils/formatters';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  FileText,
  X,
  CreditCard,
  MapPin,
  ChevronRight,
} from 'lucide-react';

export const AdminClientsView: React.FC = () => {
  const { clientes, reservas } = useHotel();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  const filtered = clientes.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${c.nombre} ${c.apellido}`.toLowerCase();
    return (
      fullName.includes(q) ||
      c.documento.includes(q) ||
      c.correo.toLowerCase().includes(q)
    );
  });

  const getClientReservations = (correo: string): Reserva[] => {
    return reservas.filter((r) => r.cliente_correo.toLowerCase() === correo.toLowerCase());
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Gestión de Relación con Huéspedes (CRM)
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Directorio de Clientes ({clientes.length})
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Fichas de identificación, historial de estancias y datos de contacto de viajeros registrados.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:ring-1 focus:ring-amber-700 bg-white"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cliente) => {
          const clientReservas = getClientReservations(cliente.correo);
          const totalSpent = clientReservas
            .filter((r) => r.estado !== 'CANCELADA')
            .reduce((acc, r) => acc + r.total, 0);

          return (
            <div
              key={cliente.id_cliente}
              className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                      {cliente.nombre.charAt(0)}
                      {cliente.apellido ? cliente.apellido.charAt(0) : ''}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-900">
                        {cliente.nombre} {cliente.apellido}
                      </h3>
                      <span className="text-[11px] text-stone-400 font-mono-numbers">
                        CC: {cliente.documento}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {clientReservas.length} {clientReservas.length === 1 ? 'reserva' : 'reservas'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-600 my-4 py-3 border-y border-stone-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{cliente.correo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono-numbers">{cliente.telefono}</span>
                  </div>
                  {cliente.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{cliente.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-stone-400 block">Total consumido:</span>
                  <span className="font-bold text-amber-900 font-mono-numbers">
                    {formatCOP(totalSpent)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedClient(cliente)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Historial</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client History Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-display font-bold text-stone-900">
                  {selectedClient.nombre} {selectedClient.apellido}
                </h3>
                <span className="text-xs text-stone-500 font-mono-numbers">
                  Documento: {selectedClient.documento} · {selectedClient.correo}
                </span>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Historial de Reservas Realizadas
              </h4>

              {getClientReservations(selectedClient.correo).length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                  Este cliente no tiene reservas registradas en el sistema.
                </div>
              ) : (
                <div className="space-y-3">
                  {getClientReservations(selectedClient.correo).map((r) => (
                    <div
                      key={r.id_reserva}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono-numbers font-bold text-stone-900">
                          {r.codigo} · Habitación {r.habitacion_numero}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono-numbers">
                          {formatDateDMY(r.fecha_entrada)} al {formatDateDMY(r.fecha_salida)} ({r.cantidad_noches}n)
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-amber-900 font-mono-numbers block">
                          {formatCOP(r.total)}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-stone-500">
                          {r.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
