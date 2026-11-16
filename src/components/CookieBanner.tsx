import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CookieBannerProps {
  onOpenCookiesPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenCookiesPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('alborada_cookie_consent');
    if (!consent) {
      // Small timeout for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'alborada_cookie_consent',
      JSON.stringify({
        tecnicas: true,
        analiticas: true,
        publicitarias: true,
        fecha: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  const handleAcceptEssentialOnly = () => {
    localStorage.setItem(
      'alborada_cookie_consent',
      JSON.stringify({
        tecnicas: true,
        analiticas: false,
        publicitarias: false,
        fecha: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:max-w-3xl md:mx-auto z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/90 p-4 sm:p-5 text-xs text-stone-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-xs">
                  Aviso de Cookies y Almacenamiento Local
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-semibold">
                  Normativa Colombia
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Utilizamos cookies técnicas necesarias para el funcionamiento del motor de reservas y almacenamiento de sesión. Conforme a las directrices de la Superintendencia de Industria y Comercio (SIC), usted puede elegir si acepta cookies analíticas complementarias o únicamente las esenciales para su estancia.
              </p>
              <button
                type="button"
                onClick={onOpenCookiesPolicy}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 underline inline-block"
              >
                Consultar Política de Cookies y Tecnologías de Rastreo
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleAcceptEssentialOnly}
              className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              Solo Esenciales
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              Aceptar Todas
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
