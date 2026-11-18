import React, { useState } from 'react';
import { TipoDocumentoLegal } from '../types/hotel';
import { LEGAL_DOCUMENTS } from '../data/legalContent';
import {
  Scale,
  ShieldCheck,
  Cookie,
  RotateCcw,
  X,
  FileText,
  Printer,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  initialDoc?: TipoDocumentoLegal;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialDoc = 'terminos',
  onClose,
}) => {
  const [activeDoc, setActiveDoc] = useState<TipoDocumentoLegal>(initialDoc);

  // Sync if initialDoc changes when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveDoc(initialDoc);
    }
  }, [isOpen, initialDoc]);

  // Accesibilidad: Cerrar modal con tecla Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDoc = LEGAL_DOCUMENTS[activeDoc];

  const DOC_TABS: { id: TipoDocumentoLegal; label: string; icon: React.ElementType }[] = [
    { id: 'terminos', label: 'Términos & Condiciones', icon: Scale },
    { id: 'privacidad', label: 'Política de Tratamiento (Datos)', icon: ShieldCheck },
    { id: 'retracto', label: 'Cancelación & Retracto', icon: RotateCcw },
    { id: 'cookies', label: 'Política de Cookies', icon: Cookie },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Documentación Jurídica Oficial"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[850px] shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#FAF8F5] px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Marco Legal & Normativa Colombiana
                </span>
                <h3 className="font-display font-bold text-base text-stone-900 leading-tight">
                  Documentación Jurídica Oficial · Alborada Hotel Boutique
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
                title="Imprimir documento"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
                aria-label="Cerrar documento legal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-stone-100/80 px-6 py-2 border-b border-stone-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            {DOC_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDoc === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDoc(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900 border border-stone-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Document Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
            {/* Title Header */}
            <div className="pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono-numbers mb-1">
                <span>Vigencia: {currentDoc.fechaActualizacion}</span>
                <span>·</span>
                <span>República de Colombia</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-1.5">
                {currentDoc.titulo}
              </h1>
              <p className="text-xs text-stone-500 leading-normal">
                {currentDoc.subtitulo}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {currentDoc.secciones.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h2 className="font-display font-bold text-sm sm:text-base text-stone-900">
                    {sec.titulo}
                  </h2>
                  <p className="text-stone-600 leading-relaxed text-xs sm:text-[13px]">
                    {sec.contenido}
                  </p>
                  {sec.puntos && (
                    <ul className="mt-2 space-y-1.5 pl-2">
                      {sec.puntos.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-stone-600 text-xs sm:text-[13px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Legal Authority Box */}
            <div className="mt-8 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div>
                <span className="font-bold block">Autoridad Nacional de Protección al Consumidor y Hábeas Data:</span>
                <span className="text-amber-800 text-[11px]">
                  Superintendencia de Industria y Comercio (SIC) · Carrera 13 No. 27 - 00, Bogotá D.C., Colombia
                </span>
              </div>
              <a
                href="https://www.sic.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shrink-0 self-start sm:self-auto"
              >
                <span>Portal SIC</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Footer Close */}
          <div className="bg-[#FAF8F5] px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-stone-500">
              ALBORADA HOSPITALITY S.A.S. · NIT 901.849.204-1 · RNT No. 89452
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
            >
              Cerrar Documento
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
