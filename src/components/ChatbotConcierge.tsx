import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { MensajeChat, Habitacion } from '../types/hotel';
import { formatCOP } from '../utils/formatters';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
  Coffee,
  ShieldCheck,
  Tag,
  BedDouble,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatbotConciergeProps {
  onSelectHabitacion: (hab: Habitacion) => void;
  onOpenDetails: (hab: Habitacion) => void;
}

export const ChatbotConcierge: React.FC<ChatbotConciergeProps> = ({
  onSelectHabitacion,
  onOpenDetails,
}) => {
  const { consultarConciergeChat } = useHotel();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MensajeChat[]>([
    {
      id: 'welcome-1',
      emisor: 'asistente',
      texto: '¡Hola! Soy tu Concierge Virtual de Alborada Hotel Boutique. ¿En qué puedo orientarte hoy sobre tu estadía, servicios o reservas?',
      timestamp: 'Ahora',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: MensajeChat = {
      id: `usr-${Date.now()}`,
      emisor: 'usuario',
      texto: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // Real-time AI Token-by-Token Streaming
      setIsTyping(true);
      const fullReply = await consultarConciergeChat(text);
      setIsTyping(false);

      const msgId = fullReply.id;
      const initialAssistantMsg: MensajeChat = {
        ...fullReply,
        texto: '',
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);

      // Stream tokens with interval simulating streaming completion
      const words = fullReply.texto.split(' ');
      let currentWordIndex = 0;
      let accumulatedText = '';

      const streamTimer = setInterval(() => {
        if (currentWordIndex < words.length) {
          accumulatedText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          const textSnapshot = accumulatedText;
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, texto: textSnapshot } : m))
          );
          currentWordIndex++;
        } else {
          clearInterval(streamTimer);
        }
      }, 25);
    } catch (err) {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    { label: 'Check-in y Check-out', query: '¿Cuáles son los horarios de Check-in y Check-out?' },
    { label: 'Desayuno incluido', query: '¿El desayuno está incluido en la tarifa?' },
    { label: 'Política de cancelación', query: '¿Cuál es la política de cancelación?' },
    { label: 'Parqueadero gratis', query: '¿Tienen parqueadero privado gratuito?' },
    { label: 'Cupones de descuento', query: '¿Cómo puedo aplicar un cupón de descuento?' },
    { label: 'Recomiéndame una suite', query: 'Recomiéndame una habitación para pareja' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-stone-900 text-white shadow-xl hover:bg-stone-800 transition-all border border-amber-500/30 group"
          aria-label="Abrir Asistente Concierge"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            Concierge Virtual
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90vw] sm:w-96 h-[520px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-700/80 flex items-center justify-center text-amber-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>Concierge Alborada</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>En línea · Asistencia 24/7</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Pills Banner */}
            <div className="p-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleSendMessage(q.query)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-[11px] font-medium text-stone-700 hover:text-amber-900 border border-stone-200 whitespace-nowrap shrink-0 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.emisor === 'usuario' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      msg.emisor === 'usuario'
                        ? 'bg-amber-700 text-white rounded-br-xs'
                        : 'bg-stone-100 text-stone-800 rounded-bl-xs border border-stone-200/60'
                    }`}
                  >
                    <p>{msg.texto}</p>

                    {/* Room Suggestion Card */}
                    {msg.sugerencia_habitacion && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200/80 bg-white rounded-xl p-2.5 text-stone-900 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">
                            Hab. {msg.sugerencia_habitacion.numero}
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold">
                            Piso {msg.sugerencia_habitacion.piso}
                          </span>
                        </div>
                        <img
                          src={msg.sugerencia_habitacion.imagen}
                          alt={`Hab ${msg.sugerencia_habitacion.numero}`}
                          className="w-full h-24 object-cover rounded-lg border border-stone-200"
                        />
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onOpenDetails(msg.sugerencia_habitacion!);
                            }}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700"
                          >
                            Ver Fotos
                          </button>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onSelectHabitacion(msg.sugerencia_habitacion!);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-[10px] font-semibold text-white"
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono-numbers">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-stone-400 text-xs pl-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse delay-300" />
                  <span className="text-[10px] text-stone-500 ml-1">Escribiendo respuesta...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu consulta o pide una recomendación..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white transition-colors"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

