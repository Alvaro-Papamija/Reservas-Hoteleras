import React from 'react';
import { Sparkles, MapPin, Phone, Mail, ShieldCheck, Scale, ExternalLink, AlertTriangle } from 'lucide-react';
import { TipoDocumentoLegal } from '../types/hotel';

interface FooterProps {
  onOpenLegal?: (doc: TipoDocumentoLegal) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800 text-xs">
          {/* Brand & Corporate Identification (Art. 50 Ley 1480/2011) */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Alborada Hotel Boutique
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Operado por <strong className="text-stone-200">ALBORADA HOSPITALITY S.A.S.</strong><br />
              NIT: <span className="font-mono-numbers">901.849.204-1</span><br />
              RNT No. <span className="font-mono-numbers">89452</span> · MinCIT Colombia
            </p>
            <div className="pt-1">
              <a
                href="https://www.sic.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-800 text-amber-300 text-[11px] font-semibold border border-stone-700 transition-colors"
                title="Superintendencia de Industria y Comercio - Protección al Consumidor"
              >
                <span>Superintendencia de Industria y Comercio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
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
              <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                <span>PQR:</span>
                <span className="text-amber-300">pqr@hotelalborada.com</span>
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
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Reserva directa 100% garantizada</span>
            </div>
          </div>
        </div>

        {/* Mandatory ESCNNA Warning (Ley 679 de 2001 y Ley 1336 de 2009) */}
        <div className="py-4 border-b border-stone-800 text-[10px] text-stone-400 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            <strong>Advertencia legal (Ley 679 de 2001 y Ley 1336 de 2009):</strong> En desarrollo de lo dispuesto en el artículo 17 de la Ley 679 de 2001, ALBORADA HOSPITALITY S.A.S. advierte que la explotación y el abuso sexual de niños, niñas y adolescentes en Colombia son castigados penal y civilmente conforme a las disposiciones legales vigentes. Toda conducta sospechosa será denunciada ante las autoridades competentes.
          </p>
        </div>

        {/* Bottom copyright & Interactive Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-4">
          <div>
            © {new Date().getFullYear()} Alborada Hotel Boutique. Todos los derechos reservados.
          </div>
          <div className="flex items-center flex-wrap justify-center gap-3 text-stone-400">
            <button
              onClick={() => onOpenLegal && onOpenLegal('terminos')}
              className="hover:text-amber-300 transition-colors underline"
            >
              Términos & Condiciones
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal && onOpenLegal('privacidad')}
              className="hover:text-amber-300 transition-colors underline"
            >
              Política de Tratamiento (Datos)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal && onOpenLegal('retracto')}
              className="hover:text-amber-300 transition-colors underline"
            >
              Cancelación & Retracto
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal && onOpenLegal('cookies')}
              className="hover:text-amber-300 transition-colors underline"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
