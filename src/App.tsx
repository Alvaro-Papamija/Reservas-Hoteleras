import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { DisponibilidadView } from './components/DisponibilidadView';
import { MyReservationsView } from './components/MyReservationsView';
import { RoomDetailModal } from './components/RoomDetailModal';
import { BookingModal } from './components/BookingModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRoomsView } from './components/admin/AdminRoomsView';
import { AdminReservationsView } from './components/admin/AdminReservationsView';
import { AdminClientsView } from './components/admin/AdminClientsView';
import { AdminReportsView } from './components/admin/AdminReportsView';

import { Habitacion, Reserva } from './types/hotel';
import {
  Sparkles,
  Waves,
  UtensilsCrossed,
  ShieldCheck,
  Compass,
  ArrowRight,
  Wifi,
  Coffee,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeView, setActiveView, currentRole } = useHotel();

  // Search parameters for availability view
  const [searchParams, setSearchParams] = useState<{
    entrada: string;
    salida: string;
    huespedes: number;
    tipoId?: number;
  }>({
    entrada: '2026-12-15',
    salida: '2026-12-18',
    huespedes: 2,
    tipoId: undefined,
  });

  // Modal states
  const [detailModalHab, setDetailModalHab] = useState<Habitacion | null>(null);
  const [bookingModalHab, setBookingModalHab] = useState<Habitacion | null>(null);
  const [confirmedReserva, setConfirmedReserva] = useState<Reserva | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handlers
  const handleHeroSearch = (params: { entrada: string; salida: string; huespedes: number; tipoId?: number }) => {
    setSearchParams(params);
    setActiveView('disponibilidad');
  };

  const handleOpenRoomDetails = (hab: Habitacion) => {
    setDetailModalHab(hab);
  };

  const handleProceedToBooking = (hab: Habitacion, customEntrada?: string, customSalida?: string) => {
    setDetailModalHab(null);
    if (customEntrada && customSalida) {
      setSearchParams((prev) => ({
        ...prev,
        entrada: customEntrada,
        salida: customSalida,
      }));
    }
    setBookingModalHab(hab);
  };

  const handleBookingSuccess = (newReserva: Reserva) => {
    setBookingModalHab(null);
    setConfirmedReserva(newReserva);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-200">
      {/* 3-Zone Contract Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSearch={() => setActiveView('disponibilidad')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* Guest View: Inicio */}
        {activeView === 'inicio' && (
          <div>
            <HeroSection onSearch={handleHeroSearch} />

            {/* Curated Hotel Philosophy Banner */}
            <section className="py-16 bg-white border-y border-stone-200/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      <Waves className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-stone-900 mb-1">
                        Piscina Infinita & Solárium
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Espejo de agua rodeado de palmeras nativas y terrazas de piedra coralina para disfrutar del atardecer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-stone-900 mb-1">
                        Gastronomía de Origen
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Desayuno buffet incluido con ingredientes de fincas locales, café especial de altura y panadería artesanal.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-stone-900 mb-1">
                        Reserva Directa Garantizada
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Sin cobros adicionales, confirmación instantánea con código oficial y política de cancelación sin costo hasta 48 horas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Room Catalog Section */}
            <CatalogSection
              onSelectHabitacion={(hab) => handleProceedToBooking(hab)}
              onOpenDetails={handleOpenRoomDetails}
            />

            {/* Luxury Story Section with Travertine Textures */}
            <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
                      Hospitalidad de Autor
                    </div>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal leading-tight mb-6">
                      Una experiencia creada para detener el tiempo y reconectar con los sentidos
                    </h2>
                    <p className="text-sm text-stone-300 leading-relaxed mb-6">
                      Cada una de nuestras 30 habitaciones combina acabados en travertino, maderas recuperadas y terrazas privadas concebidas para el descanso total. Ya sea en un viaje individual, una escapada romántica o vacaciones familiares, nuestro equipo brinda atención discreta y esmerada.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-800 text-xs">
                      <div>
                        <div className="text-2xl font-bold font-mono-numbers text-amber-400">30</div>
                        <div className="text-stone-400 mt-1">Suites Exclusivas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono-numbers text-amber-400">3</div>
                        <div className="text-stone-400 mt-1">Pisos de Diseño</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono-numbers text-amber-400">100%</div>
                        <div className="text-stone-400 mt-1">Disponibilidad Real</div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Mosaic */}
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
                    <img
                      src="/src/assets/images/suite_presidencial_lujo_1794431399634.jpg"
                      alt="Suite Presidencial con terraza"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Guest View: Catálogo completo de habitaciones */}
        {activeView === 'habitaciones' && (
          <div className="pt-6">
            <CatalogSection
              onSelectHabitacion={(hab) => handleProceedToBooking(hab)}
              onOpenDetails={handleOpenRoomDetails}
            />
          </div>
        )}

        {/* Guest View: Consulta de Disponibilidad */}
        {activeView === 'disponibilidad' && (
          <DisponibilidadView
            initialEntrada={searchParams.entrada}
            initialSalida={searchParams.salida}
            initialHuespedes={searchParams.huespedes}
            initialTipoId={searchParams.tipoId}
            onSelectHabitacion={(hab, ent, sal, hues) => {
              setSearchParams({
                entrada: ent,
                salida: sal,
                huespedes: hues,
                tipoId: hab.id_tipo,
              });
              handleProceedToBooking(hab, ent, sal);
            }}
            onOpenDetails={handleOpenRoomDetails}
            onBackToHome={() => setActiveView('inicio')}
          />
        )}

        {/* Guest View: Mis Reservas */}
        {activeView === 'mis-reservas' && (
          <MyReservationsView onExploreRooms={() => setActiveView('habitaciones')} />
        )}

        {/* Admin Views */}
        {activeView === 'admin-dashboard' && <AdminDashboard />}
        {activeView === 'admin-habitaciones' && <AdminRoomsView />}
        {activeView === 'admin-reservas' && <AdminReservationsView />}
        {activeView === 'admin-clientes' && <AdminClientsView />}
        {activeView === 'admin-reportes' && <AdminReportsView />}
      </main>

      {/* Modals */}
      <RoomDetailModal
        habitacion={detailModalHab}
        onClose={() => setDetailModalHab(null)}
        onProceedToBook={(hab, ent, sal) => handleProceedToBooking(hab, ent, sal)}
      />

      <BookingModal
        habitacion={bookingModalHab}
        defaultEntrada={searchParams.entrada}
        defaultSalida={searchParams.salida}
        defaultHuespedes={searchParams.huespedes}
        onClose={() => setBookingModalHab(null)}
        onSuccess={handleBookingSuccess}
      />

      {confirmedReserva && (
        <BookingConfirmationModal
          reserva={confirmedReserva}
          onViewMyReservations={() => {
            setConfirmedReserva(null);
            setActiveView('mis-reservas');
          }}
          onContinueBrowsing={() => {
            setConfirmedReserva(null);
            setActiveView('habitaciones');
          }}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <MainApp />
    </HotelProvider>
  );
}
