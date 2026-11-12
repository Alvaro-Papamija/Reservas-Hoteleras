import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion } from '../types/hotel';
import { formatCOP, getEstadoHabitacionColor } from '../utils/formatters';
import {
  SlidersHorizontal,
  BedDouble,
  Users,
  Eye,
  Calendar,
  Sparkles,
  Check,
  Images,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CatalogSectionProps {
  onSelectHabitacion: (hab: Habitacion) => void;
  onOpenDetails: (hab: Habitacion) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onSelectHabitacion,
  onOpenDetails,
}) => {
  const { habitaciones, tipos } = useHotel();

  const [selectedTipo, setSelectedTipo] = useState<number | 'todos'>('todos');
  const [selectedPiso, setSelectedPiso] = useState<number | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'menor' | 'mayor' | 'defecto'>('defecto');
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(false);

  // Filtered rooms
  const filteredRooms = habitaciones
    .filter((h) => {
      if (selectedTipo !== 'todos' && h.id_tipo !== selectedTipo) return false;
      if (selectedPiso !== 'todos' && h.piso !== selectedPiso) return false;
      if (soloDisponibles && h.estado !== 'DISPONIBLE') return false;
      return true;
    })
    .sort((a, b) => {
      const precioA = tipos.find((t) => t.id_tipo === a.id_tipo)?.precio_base || 0;
      const precioB = tipos.find((t) => t.id_tipo === b.id_tipo)?.precio_base || 0;
      if (sortBy === 'menor') return precioA - precioB;
      if (sortBy === 'mayor') return precioB - precioA;
      return a.id_habitacion - b.id_habitacion;
    });

  const getTipo = (idTipo: number) => tipos.find((t) => t.id_tipo === idTipo);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-stone-200 gap-4">
        <div>
          {/* Metadata kicker */}
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-2">
            Colección Arquitectónica · 30 Habitaciones
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 tracking-tight">
            Catálogo de Habitaciones & Suites
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Diseñadas con materiales nobles, textiles orgánicos y vistas despejadas. Cada estancia ofrece insonorización superior y descanso reparador.
          </p>
        </div>

        {/* Counter */}
        <div className="text-xs text-stone-500 font-mono-numbers text-right">
          Mostrando <span className="font-bold text-stone-900">{filteredRooms.length}</span> de 30 estancias
        </div>
      </div>

      {/* Filter and Segmented Controls (interactive buttons per §1.A) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs mb-10 space-y-4">
        {/* Row 1: Tipo de habitación tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-stone-500 mr-2 shrink-0">Tipo:</span>
          <button
            onClick={() => setSelectedTipo('todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedTipo === 'todos'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Todas ({habitaciones.length})
          </button>
          {tipos.map((t) => {
            const count = habitaciones.filter((h) => h.id_tipo === t.id_tipo).length;
            return (
              <button
                key={t.id_tipo}
                onClick={() => setSelectedTipo(t.id_tipo)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedTipo === t.id_tipo
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t.nombre} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary filters: Floor, Sort, and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          {/* Floors */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-500 mr-1">Ubicación:</span>
            {['todos', 1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPiso(p as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedPiso === p
                    ? 'bg-stone-900 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p === 'todos' ? 'Todos los pisos' : `Piso ${p}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Solo disponibles checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700 border-stone-300"
              />
              <span>Solo disponibles ahora</span>
            </label>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 bg-stone-100 rounded-md border-0 text-xs text-stone-800 outline-none"
              >
                <option value="defecto">Por número</option>
                <option value="menor">Precio: menor a mayor</option>
                <option value="mayor">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((hab) => {
          const tipo = getTipo(hab.id_tipo);
          const precio = tipo ? tipo.precio_base : 180000;
          const statusStyle = getEstadoHabitacionColor(hab.estado);

          return (
            <motion.div
              key={hab.id_habitacion}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image with 65-75% height proportion and Fallback Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={hab.imagen}
                  alt={`Habitación ${hab.numero} ${tipo?.nombre}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {/* Clean Top Tags */}
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  Habitación {hab.numero}
                </div>

                <div className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} backdrop-blur-xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  <span>{statusStyle.label}</span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-stone-950/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-white/10">
                  <Images className="w-3 h-3 text-amber-300" />
                  <span>Galería</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Quiet unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                    <span className="font-semibold text-amber-800">{tipo?.nombre}</span>
                    <span aria-hidden="true">·</span>
                    <span>Capacidad: {tipo?.capacidad} pers.</span>
                    <span aria-hidden="true">·</span>
                    <span>Piso {hab.piso}</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-2">
                    Suite {hab.numero} · {tipo?.nombre}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {hab.descripcion}
                  </p>

                  {/* Services metadata with text separators (no pill enclosure) */}
                  <div className="text-xs text-stone-500 line-clamp-1 mb-4 flex items-center gap-1.5">
                    {hab.servicios.slice(0, 3).map((s, idx) => (
                      <React.Fragment key={s}>
                        <span className="text-stone-700">{s}</span>
                        {idx < 2 && <span className="text-stone-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Footer with Price and Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Tarifa por noche</span>
                    <span className="text-base font-bold text-stone-900 font-mono-numbers">
                      {formatCOP(precio)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetails(hab)}
                      className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-xs font-semibold"
                      title="Ver ficha completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectHabitacion(hab)}
                      disabled={hab.estado === 'MANTENIMIENTO' || !hab.activa}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        hab.estado === 'MANTENIMIENTO' || !hab.activa
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
                      }`}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
