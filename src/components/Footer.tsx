import React from 'react';
import { Sparkles, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800 text-xs">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Alborada Hotel Boutique
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Hospitalidad contemporánea inspirada en el paisaje colombiano. 30 estancias exclusivas diseñadas para desconectar y descansar.
            </p>
            <div className="text-[11px] text-stone-500 font-mono-numbers">
              RNT No. 89452 · Ministerio de Comercio, Industria y Turismo
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Explorar Estancias
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>Individual Ejecutiva</li>
              <li>Doble Deluxe con Balcón</li>
              <li>Triple Familiar</li>
              <li>Familiar Penthouse</li>
              <li>Suite Presidencial Solárium</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Contacto & Recepción
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Sector Solárium Km 4, Colombia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono-numbers">+57 (605) 650 9000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>reservas@hotelalborada.com</span>
              </div>
            </div>
          </div>

          {/* Policies & Warranties */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Garantías de Reserva
            </h4>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Cancelación gratuita hasta 48 horas antes del check-in. Sin cargos sorpresivos, tarifas expresadas en pesos colombianos (COP) con impuestos hoteleros incluidos.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Reserva directa 100% garantizada</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-4">
          <div>
            © {new Date().getFullYear()} Alborada Hotel Boutique. Desarrollado por Alvaro Andrés Papamija.
          </div>
          <div className="flex items-center gap-4">
            <span>Términos & Condiciones</span>
            <span aria-hidden="true">·</span>
            <span>Política de Privacidad</span>
            <span aria-hidden="true">·</span>
            <span>Reglamento Interno</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
