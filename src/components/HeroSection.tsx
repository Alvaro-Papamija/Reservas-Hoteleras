import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Calendar, Users, BedDouble, Search, ChevronRight, Award, Compass, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onSearch: (params: { entrada: string; salida: string; huespedes: number; tipoId?: number }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { tipos } = useHotel();

  // Dates initialized with realistic upcoming dates (e.g. 15/12/2026 from user flow)
  const [fechaEntrada, setFechaEntrada] = useState('2026-12-15');
  const [fechaSalida, setFechaSalida] = useState('2026-12-18');
  const [huespedes, setHuespedes] = useState(2);
  const [tipoId, setTipoId] = useState<number | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fechaEntrada || !fechaSalida) {
      setErrorMsg('Por favor selecciona las fechas de entrada y salida.');
      return;
    }

    const start = new Date(fechaEntrada);
    const end = new Date(fechaSalida);

    if (end <= start) {
      setErrorMsg('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    if (huespedes <= 0) {
      setErrorMsg('El número de huéspedes debe ser al menos 1.');
      return;
    }

    onSearch({
      entrada: fechaEntrada,
      salida: fechaSalida,
      huespedes,
      tipoId,
    });
  };

  return (
    <section className="relative min-h-[620px] lg:min-h-[680px] flex items-center justify-center overflow-hidden">
      {/* Background Image with WebP format, Fallback, LCP High Fetch Priority and Explicit Dimensions */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source
            srcSet="/src/assets/images/hero_resort_solarium_1794431399560.webp"
            type="image/webp"
          />
          <img
            src="/src/assets/images/hero_resort_solarium_1794431399560.jpg"
            alt="Alborada Hotel Boutique Solárium y Piscina"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            width={1920}
            height={1080}
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          />
        </picture>
        {/* Measured dark scrim for 4.5:1 WCAG contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-stone-900/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center lg:text-left flex flex-col justify-between h-full">
        <div className="max-w-3xl mb-12">
          {/* Quiet editorial text kicker (no pill boxes) */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold tracking-widest uppercase text-amber-300 mb-4">
            <span>Hospitalidad Colombiana</span>
            <span aria-hidden="true">·</span>
            <span>Arquitectura Sensorial</span>
            <span aria-hidden="true">·</span>
            <span>30 Suites Exclusivas</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.15] text-balance mb-6"
          >
            Donde el descanso sereno se funde con la calidez caribeña
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-stone-200/90 font-normal leading-relaxed max-w-2xl"
          >
            Descubre un refugio de diseño con piscina sinfín, gastronomía autóctona y terrazas panorámicas. Reserva directamente con disponibilidad garantizada y sin intermediarios.
          </motion.p>
        </div>

        {/* Availability Search Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-stone-200/60 max-w-5xl mx-auto lg:mx-0 w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Check-in */}
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Fecha de Entrada</span>
                </label>
                <input
                  type="date"
                  value={fechaEntrada}
                  onChange={(e) => setFechaEntrada(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 outline-none transition-all font-mono-numbers"
                  required
                />
              </div>

              {/* Check-out */}
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Fecha de Salida</span>
                </label>
                <input
                  type="date"
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 outline-none transition-all font-mono-numbers"
                  required
                />
              </div>

              {/* Guests */}
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>Huéspedes</span>
                </label>
                <select
                  value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 outline-none transition-all"
                >
                  <option value={1}>1 Huésped</option>
                  <option value={2}>2 Huéspedes</option>
                  <option value={3}>3 Huéspedes</option>
                  <option value={4}>4 Huéspedes</option>
                  <option value={5}>5 Huéspedes</option>
                </select>
              </div>

              {/* Room type filter (optional) */}
              <div className="flex flex-col text-left">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tipo de Habitación</span>
                </label>
                <select
                  value={tipoId || ''}
                  onChange={(e) => setTipoId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 outline-none transition-all"
                >
                  <option value="">Todas las opciones</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nombre} (máx. {t.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error banner if invalid dates */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left">
                {errorMsg}
              </div>
            )}

            {/* Bottom action row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-200/60">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía de mejor tarifa directa · Sin comisiones ocultas</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 group active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>Consultar Disponibilidad</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
