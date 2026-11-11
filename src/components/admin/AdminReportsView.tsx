import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { formatCOP } from '../../utils/formatters';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Download,
  Calendar,
  Layers,
  BedDouble,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { habitaciones, tipos, reservas } = useHotel();

  // Metrics by Type
  const revenueByType = tipos.map((t) => {
    const total = reservas
      .filter((r) => r.habitacion_tipo === t.nombre && r.estado !== 'CANCELADA')
      .reduce((acc, r) => acc + r.total, 0);

    const count = reservas.filter((r) => r.habitacion_tipo === t.nombre).length;

    return {
      nombre: t.nombre,
      capacidad: t.capacidad,
      precio_base: t.precio_base,
      total,
      count,
    };
  });

  const maxRevenue = Math.max(1, ...revenueByType.map((r) => r.total));

  // Occupancy by Floor
  const floors = [1, 2, 3].map((piso) => {
    const rooms = habitaciones.filter((h) => h.piso === piso);
    const occupied = rooms.filter((h) => h.estado === 'OCUPADA' || h.estado === 'RESERVADA').length;
    const rate = Math.round((occupied / rooms.length) * 100);
    return {
      piso,
      total: rooms.length,
      occupied,
      rate,
    };
  });

  // Status breakdown
  const statusCounts = {
    CONFIRMADA: reservas.filter((r) => r.estado === 'CONFIRMADA').length,
    PENDIENTE: reservas.filter((r) => r.estado === 'PENDIENTE').length,
    FINALIZADA: reservas.filter((r) => r.estado === 'FINALIZADA').length,
    CANCELADA: reservas.filter((r) => r.estado === 'CANCELADA').length,
  };

  const totalReservasCount = Math.max(1, reservas.length);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Inteligencia de Negocio & Finanzas
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Reportes de Ocupación e Ingresos
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Análisis consolidado de rendimiento por tipo de habitación, pisos e historial de reservas del hotel.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar Reporte</span>
        </button>
      </div>

      {/* Grid: Charts & Visual breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Room Type Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-stone-900">
                Ingresos Liquidados por Tipo de Habitación
              </h3>
              <p className="text-xs text-stone-500">
                Excluye reservas canceladas.
              </p>
            </div>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-4 pt-2">
            {revenueByType.map((item) => {
              const percentage = Math.round((item.total / maxRevenue) * 100);

              return (
                <div key={item.nombre} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-stone-800">{item.nombre} ({item.count} res.)</span>
                    <span className="font-bold font-mono-numbers text-stone-900">
                      {formatCOP(item.total)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-700 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy by Floor */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-stone-900">
                Ocupación Relativa por Nivel
              </h3>
              <p className="text-xs text-stone-500">
                Basado en habitaciones ocupadas y reservadas por piso.
              </p>
            </div>
            <Layers className="w-4 h-4 text-amber-700" />
          </div>

          <div className="space-y-4 pt-2">
            {floors.map((fl) => (
              <div key={fl.piso} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-stone-800">Piso {fl.piso}</span>
                  <span className="font-mono-numbers text-stone-600">
                    {fl.occupied} de {fl.total} habitaciones ({fl.rate}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      fl.rate > 60 ? 'bg-amber-700' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${fl.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status Breakdown Box */}
          <div className="pt-4 border-t border-stone-100 mt-6">
            <h4 className="text-xs font-semibold text-stone-700 mb-3">
              Proporción de Estados de Reserva
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-800 font-semibold block">Confirmadas</span>
                <span className="text-lg font-bold text-emerald-950 font-mono-numbers">
                  {statusCounts.CONFIRMADA}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-800 font-semibold block">Pendientes</span>
                <span className="text-lg font-bold text-amber-950 font-mono-numbers">
                  {statusCounts.PENDIENTE}
                </span>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-700 font-semibold block">Finalizadas</span>
                <span className="text-lg font-bold text-stone-900 font-mono-numbers">
                  {statusCounts.FINALIZADA}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-[11px] text-rose-800 font-semibold block">Canceladas</span>
                <span className="text-lg font-bold text-rose-950 font-mono-numbers">
                  {statusCounts.CANCELADA}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
