import React, { useMemo } from 'react';
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
  Tag,
  Star,
  Award,
  Percent,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { habitaciones, tipos, reservas, cupones, resenas, calcularPrediccionOcupacion } = useHotel();

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

  // 14-Day Occupancy Forecast / History Chart (Dec 10 to Dec 23, 2026)
  const occupancy14Days = useMemo(() => {
    const days: { dateStr: string; label: string; occupied: number; rate: number }[] = [];
    for (let day = 10; day <= 23; day++) {
      const dateStr = `2026-12-${String(day).padStart(2, '0')}`;
      const occupiedCount = reservas.filter((r) => {
        if (r.estado === 'CANCELADA') return false;
        return dateStr >= r.fecha_entrada && dateStr < r.fecha_salida;
      }).length;
      
      const rate = Math.min(100, Math.round((occupiedCount / habitaciones.length) * 100));
      days.push({
        dateStr,
        label: `${day} Dic`,
        occupied: occupiedCount,
        rate,
      });
    }
    return days;
  }, [reservas, habitaciones]);

  // Coupon performance analytics
  const couponStats = useMemo(() => {
    const redemptions = reservas.filter((r) => r.cupon_aplicado && r.descuento);
    const totalDiscountAmount = redemptions.reduce((acc, r) => acc + (r.descuento || 0), 0);
    
    // Usage counts by coupon code
    const byCode: Record<string, { count: number; totalSavings: number }> = {};
    redemptions.forEach((r) => {
      const c = r.cupon_aplicado!;
      if (!byCode[c]) byCode[c] = { count: 0, totalSavings: 0 };
      byCode[c].count++;
      byCode[c].totalSavings += r.descuento || 0;
    });

    return {
      totalRedemptions: redemptions.length,
      totalDiscountAmount,
      byCode,
    };
  }, [reservas]);

  // Overall satisfaction & ratings analytics
  const ratingStats = useMemo(() => {
    if (resenas.length === 0) {
      return { promedio: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    const promedio = Number((sum / resenas.length).toFixed(1));
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    resenas.forEach((r) => {
      if (dist[r.calificacion] !== undefined) {
        dist[r.calificacion]++;
      }
    });

    return {
      promedio,
      total: resenas.length,
      distribution: dist,
    };
  }, [resenas]);

  // Predictive Occupancy Forecast (Next 21 days)
  const predicciones = useMemo(() => {
    return calcularPrediccionOcupacion(21);
  }, [calcularPrediccionOcupacion, reservas, habitaciones]);

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
            Análisis consolidado de ocupación, curvas temporales, cupones promocionales y satisfacción de huéspedes.
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

      {/* Feature 2: High-Level Occupancy Curve & Daily Occupancy Chart */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-700" />
              <h2 className="font-display font-bold text-lg text-stone-900">
                Curva de Ocupación Diaria (Temporada Alta - Diciembre 2026)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Porcentaje de ocupación sobre la capacidad total de 30 habitaciones boutique.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-700 inline-block" />
              <span>Alta Ocupación (&ge; 60%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>Moderada (&lt; 60%)</span>
            </div>
          </div>
        </div>

        {/* Bar & SVG Line Chart */}
        <div className="pt-4">
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-56 pb-4 border-b border-stone-100">
            {occupancy14Days.map((item) => {
              const isHigh = item.rate >= 60;
              return (
                <div key={item.dateStr} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip value */}
                  <span className="text-[10px] font-mono-numbers font-bold text-stone-600 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-amber-900 transition-opacity">
                    {item.rate}%
                  </span>

                  {/* Vertical bar */}
                  <div className="w-full bg-stone-100 rounded-t-lg h-40 flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        isHigh ? 'bg-amber-700 group-hover:bg-amber-800' : 'bg-emerald-600 group-hover:bg-emerald-700'
                      }`}
                      style={{ height: `${Math.max(8, item.rate)}%` }}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[10px] text-stone-500 font-medium mt-2 whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono-numbers">
                    {item.occupied} habs
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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

      {/* Grid: Coupons & Reviews Systems Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cupones y Descuentos */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-700" />
              <h3 className="font-display font-bold text-base text-stone-900">
                Efectividad de Cupones y Descuentos
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              {cupones.length} cupones activos
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Ahorro otorgado a huéspedes y rendimiento por código promocional.
          </p>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
              <span className="text-stone-400 block text-[11px]">Reservas con Descuento</span>
              <span className="text-xl font-bold font-mono-numbers text-stone-900 mt-0.5 block">
                {couponStats.totalRedemptions}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
              <span className="text-emerald-700 block text-[11px]">Total Ahorro Otorgado</span>
              <span className="text-xl font-bold font-mono-numbers text-emerald-950 mt-0.5 block">
                {formatCOP(couponStats.totalDiscountAmount)}
              </span>
            </div>
          </div>

          {/* List of active promotional codes */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Códigos de Descuento Disponibles
            </h4>
            <div className="space-y-2">
              {cupones.map((c) => (
                <div
                  key={c.codigo}
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {c.codigo}
                      </span>
                      <span className="text-stone-600">{c.descripcion}</span>
                    </div>
                    {c.minimo_noches && (
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Mínimo {c.minimo_noches} noches
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-amber-800 shrink-0 font-mono-numbers">
                    {c.tipo === 'PORCENTAJE' ? `${c.valor}% OFF` : `-${formatCOP(c.valor)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sistema de Calificaciones */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="font-display font-bold text-base text-stone-900">
                Índice de Calificaciones & Reputación
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-mono-numbers">
              {ratingStats.promedio} / 5.0
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Evaluaciones y retroalimentación dejadas por huéspedes verificados.
          </p>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
              <span className="text-stone-400 block text-[11px]">Opiniones Verificadas</span>
              <span className="text-xl font-bold font-mono-numbers text-stone-900 mt-0.5 block">
                {ratingStats.total}
              </span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
              <span className="text-amber-800 block text-[11px]">Puntuación Promedio</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono-numbers text-amber-950">
                  {ratingStats.promedio}
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(ratingStats.promedio)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Star distribution */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
            <h4 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Distribución de Estrellas
            </h4>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = (ratingStats.distribution as any)[stars] || 0;
              const pct = ratingStats.total > 0 ? Math.round((count / ratingStats.total) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 text-stone-600 font-mono-numbers flex items-center gap-1">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-400 font-mono-numbers text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature 3: Predicción Básica de Ocupación con IA / Modelo de Demanda */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h2 className="font-display font-bold text-lg text-stone-900">
                Predicción Básica de Demanda y Ocupación (Próximos 21 Días)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Modelo predictivo basado en reservas confirmadas, estacionalidad decembrina y factor multiplicador de fin de semana.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              Real Confirmado
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              Proyección IA
            </span>
          </div>
        </div>

        {/* Prediction Chart Bars */}
        <div className="pt-2">
          <div className="grid grid-cols-7 sm:grid-cols-21 gap-1.5 items-end h-60 pb-3 border-b border-stone-100">
            {predicciones.map((p) => {
              const isWeekend = p.diaSemana === 'Vie' || p.diaSemana === 'Sáb';
              return (
                <div key={p.fecha} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip percentage */}
                  <span className="text-[9px] font-mono-numbers font-bold text-amber-900 opacity-90 group-hover:scale-110 transition-transform mb-1">
                    {p.ocupacionProyectada}%
                  </span>

                  {/* Dual bar: real on bottom, projected fill */}
                  <div className="w-full bg-stone-100 rounded-t-md h-40 flex flex-col justify-end p-0.5 overflow-hidden relative">
                    {/* Projected demand fill */}
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        p.demandaNivel === 'MUY_ALTA'
                          ? 'bg-amber-600'
                          : p.demandaNivel === 'ALTA'
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                      }`}
                      style={{ height: `${Math.max(10, p.ocupacionProyectada)}%` }}
                    />
                  </div>

                  {/* Date label */}
                  <span className={`text-[9px] mt-1 font-semibold ${isWeekend ? 'text-amber-800' : 'text-stone-500'}`}>
                    {p.diaSemana}
                  </span>
                  <span className="text-[8px] text-stone-400 font-mono-numbers">
                    {p.fecha.split('-')[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive Insights and Dynamic Pricing Advice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Pico de Demanda Navideña
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">
              Ocupación proyectada &gt; 85% entre el 23 y 31 de diciembre. Se proyecta ocupación total en suites con terraza.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Tarifa Dinámica Recomendada
            </span>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Mantener tarifa preferencial de temporada ($240.000 - $265.000 COP) los fines de semana para optimizar el RevPAR.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider block">
              Estrategia de Cupones
            </span>
            <p className="text-xs text-stone-700 leading-relaxed">
              Restringir cupón `BIENVENIDA20` a estancias de domingo a jueves para incentivar reservas en días de baja demanda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
