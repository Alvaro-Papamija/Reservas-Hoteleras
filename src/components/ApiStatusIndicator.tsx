import React, { useState, useEffect } from 'react';
import { hotelApi } from '../services/hotelApiService';
import { Server, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ApiStatusIndicatorProps {
  className?: string;
}

export const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const ok = await hotelApi.checkHealth();
      setIsConnected(ok);
      setLastCheck(new Date().toLocaleTimeString('es-CO'));
    } catch {
      setIsConnected(false);
      setLastCheck(new Date().toLocaleTimeString('es-CO'));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Verificar cada 60 segundos
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block text-xs font-sans ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-[11px] font-medium shadow-2xs ${
          isConnected === true
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : isConnected === false
            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            : 'bg-stone-50 text-stone-600 border-stone-200'
        }`}
        title="Estado de la conexión API Backend"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected === true
              ? 'bg-emerald-500 animate-pulse'
              : isConnected === false
              ? 'bg-amber-500'
              : 'bg-stone-400'
          }`}
        />
        <Server className="w-3 h-3 text-stone-500" />
        <span>
          {isConnected === true
            ? 'API REST Online'
            : isConnected === false
            ? 'Modo Local Resiliente'
            : 'Verificando API...'}
        </span>
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 text-stone-700 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
            <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-700" />
              Arquitectura de Backend
            </span>
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors disabled:opacity-50"
              title="Reverificar estado"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-700' : ''}`} />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Servidor API:</span>
              <span className="font-mono font-medium text-stone-800">Spring Boot 3.3.4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Persistencia:</span>
              <span className="font-mono font-medium text-stone-800">PostgreSQL / H2 JPA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Estado Conexión:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isConnected ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" /> Conectado a /api
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" /> Caché Local
                  </>
                )}
              </span>
            </div>
            {lastCheck && (
              <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-stone-400 text-[10px]">
                <span>Último sondeo:</span>
                <span>{lastCheck}</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 leading-tight">
            {isConnected
              ? 'Todas las reservas, pagos y clientes se sincronizan directamente con la base de datos relacional.'
              : 'El backend no está escuchando en el puerto 8080. El frontend continúa funcionando en modo resiliente.'}
          </div>
        </div>
      )}
    </div>
  );
};
