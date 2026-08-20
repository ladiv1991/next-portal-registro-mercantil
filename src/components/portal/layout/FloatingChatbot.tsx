'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, BookOpen, HelpCircle, BookText, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  loading?: boolean;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  steps?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const FALLBACK_LLM_MSG = `¿Podría ser más específico sobre lo que necesita? Puedo ayudarle con:\n\n- **Solicitud de Primera Inscripción de un Sujeto** (SRL, SA, Cooperativa)\n- **Modificaciones** de datos de sociedad\n- **Estado de Situación** y depósitos\n- **Inversión extranjera**\n- **Certificaciones** y notas simples\n\n📞 **(+53) 7 862-3456** (Lun-Vie 8:30-16:30)\n📧 **soporte@registromercantil.cu**\n📝 [Mesa de Ayuda](#asistencia)`;

export default function FloatingChatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: '👋 Hola, soy el asistente virtual del Registro Mercantil de Cuba. Puedo consultarle sobre trámites, normativas, guías paso a paso y más. ¿En qué puedo ayudarle?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dynamicGuides, setDynamicGuides] = useState<GuideItem[]>([]);
  const [dynamicFAQs, setDynamicFAQs] = useState<FAQItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;

  // Keep refs in sync for async access
  const guidesRef = useRef(dynamicGuides);
  guidesRef.current = dynamicGuides;
  const faqsRef = useRef(dynamicFAQs);
  faqsRef.current = dynamicFAQs;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatOpen]);

  // ─── Fetch data immediately on mount (not on chat open) ───
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDynamicGuides(json.data.guides || []);
            setDynamicFAQs(json.data.faqs || []);
          }
        }
      } catch { /* empty */ } finally {
        setDataLoaded(true);
      }
    };
    load();
  }, []);

  // Normalize accents for matching: "trámite" → "tramite"
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // ─── Search the backend knowledge index for a direct answer ───
  const searchKnowledgeBase = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/chat/search?q=${encodeURIComponent(text)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.response) {
          return json.data.response;
        }
      }
    } catch { /* fall through to LLM */ }
    return null;
  }, []);

  // ─── Core LLM call (user msg must already be in chatMessages) ───
  const callLLM = useCallback(async () => {
    setIsLoading(true);
    setChatMessages(prev => [...prev, { role: 'bot', text: '', loading: true }]);

    try {
      const history = chatMessagesRef.current
        .filter(m => !m.loading)
        .slice(-10)
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const json = await res.json();

      setChatMessages(prev => {
        const withoutLoading = prev.filter(m => !m.loading);
        if (json.success && json.data?.reply) {
          return [...withoutLoading, { role: 'bot', text: json.data.reply }];
        }
        return [...withoutLoading, { role: 'bot', text: FALLBACK_LLM_MSG }];
      });
    } catch {
      setChatMessages(prev => {
        const withoutLoading = prev.filter(m => !m.loading);
        return [...withoutLoading, { role: 'bot', text: FALLBACK_LLM_MSG }];
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Send any message: knowledge search first → LLM fallback ───
  const send = useCallback(async (text: string) => {
    if (isLoading) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: trimmed }]);

    // Try knowledge base search FIRST
    const kbReply = await searchKnowledgeBase(trimmed);
    if (kbReply) {
      setChatMessages(prev => [...prev, { role: 'bot', text: kbReply }]);
      return;
    }

    // No KB match → LLM
    callLLM();
  }, [isLoading, searchKnowledgeBase, callLLM]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
      e.preventDefault();
      send(chatInput);
    }
  };

  // ─── Build button lists from loaded data ───
  const guideButtons: { icon: string; label: string }[] =
    dynamicGuides.length > 0
      ? dynamicGuides.slice(0, 5).map(g => ({ icon: g.icon || '📋', label: g.title }))
      : [];

  const nonGlosarioFAQs = dynamicFAQs.filter(f => f.category?.toLowerCase() !== 'glosario');
  const faqButtons: string[] =
    nonGlosarioFAQs.length > 0
      ? nonGlosarioFAQs.slice(0, 5).map(f => f.question)
      : [];

  const glossaryFAQs = dynamicFAQs.filter(f => f.category?.toLowerCase() === 'glosario');
  const glossaryTags: string[] =
    glossaryFAQs.length > 0
      ? glossaryFAQs.map(f => f.question)
      : [];

  const generalTags = [
    '📞 Horarios de atención',
    '💰 Costo de trámites',
    '🔍 Verificar certificación',
    '📜 Normativas vigentes',
  ];

  const [showMoreTags, setShowMoreTags] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState<'guides' | 'faq'>('guides');

  // Only show quick actions if data is loaded (keep visible even after user messages)
  const hasQuickContent = guideButtons.length > 0 || faqButtons.length > 0 || glossaryTags.length > 0;

  // Simple markdown-like rendering
  const renderBotText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    // Section hash mapping
    const sectionMap: Record<string, string> = {
      '#asistencia': 'asistencia',
      '#consultas': 'consultas',
      '#tramites': 'tramites',
      '#normatividad': 'normatividad',
      '#estadisticas': 'estadisticas',
      '#home': 'home',
      '#acceso': 'acceso',
    };

    const handleLinkClick = (href: string) => {
      // Check if it's an internal section link
      const hash = href.startsWith('#') ? href : href.split('#')[1];
      if (hash && sectionMap[`#${hash}`]) {
        const section = sectionMap[`#${hash}`];
        sessionStorage.setItem('navigateToSection', section);
        window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: section }));
        setChatOpen(false);
      } else if (href.startsWith('http')) {
        window.open(href, '_blank');
      }
    };

    lines.forEach((line, i) => {
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Replace markdown links with onclick handlers
      processed = processed.replace(
        /\[(.+?)\]\((.+?)\)/g,
        (_match, label, href) => {
          const sectionId = href.startsWith('#') ? href.slice(1) : href.split('#')[1];
          const isInternal = sectionId && sectionMap[`#${sectionId}`];
          if (isInternal) {
            return `<a href="javascript:void(0)" class="text-[#9E3A2E] hover:underline font-medium" data-nav="${sectionId}">${label}</a>`;
          }
          return `<a href="${href}" class="text-[#9E3A2E] hover:underline font-medium" target="_blank" rel="noopener">${label}</a>`;
        }
      );

      if (processed.startsWith('- ') || processed.startsWith('• ')) {
        const content = processed.replace(/^[-•]\s*/, '');
        elements.push(
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-[#9E3A2E] mt-0.5 shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      } else if (processed.startsWith('## ')) {
        elements.push(
          <div key={i} className="font-bold text-[#1A1A1A] mt-2 text-sm" dangerouslySetInnerHTML={{ __html: processed.replace('## ', '') }} />
        );
      } else if (processed.trim() === '') {
        elements.push(<div key={i} className="h-1" />);
      } else {
        elements.push(<div key={i} dangerouslySetInnerHTML={{ __html: processed }} />);
      }
    });

    return elements;
  };

  // Attach click handlers to rendered links after DOM updates
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-nav]');
      if (link) {
        e.preventDefault();
        const sectionId = link.getAttribute('data-nav');
        if (sectionId) {
          sessionStorage.setItem('navigateToSection', sectionId);
          window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: sectionId }));
          setChatOpen(false);
        }
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [chatMessages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-card w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden !p-0"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-navy to-navy-light px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#9E3A2E]/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#9E3A2E]" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Asistente Virtual</p>
                  <p className="text-gray-400 text-xs">Registro Mercantil de Cuba</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={messagesContainerRef} className="h-[340px] overflow-y-auto p-4 space-y-3 bg-gray-50/50 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.loading ? (
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9E3A2E]" />
                        Escribiendo...
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#1A1A1A] text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.role === 'bot' ? renderBotText(msg.text) : msg.text}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Panel — keep visible as long as data is loaded */}
            {!isLoading && hasQuickContent && dataLoaded && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-white/80">
                {/* Tabs */}
                <div className="flex gap-1 mb-2.5 p-0.5 bg-gray-100 rounded-lg">
                  {guideButtons.length > 0 && (
                    <button
                      onClick={() => setActiveQuickTab('guides')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md transition-all duration-200 ${
                        activeQuickTab === 'guides'
                          ? 'bg-white text-[#9E3A2E] shadow-sm'
                          : 'text-gray-500 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      Guías
                    </button>
                  )}
                  {faqButtons.length > 0 && (
                    <button
                      onClick={() => setActiveQuickTab('faq')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md transition-all duration-200 ${
                        activeQuickTab === 'faq'
                          ? 'bg-white text-[#9E3A2E] shadow-sm'
                          : 'text-gray-500 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3" />
                      Preguntas frecuentes
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {activeQuickTab === 'guides' && guideButtons.length > 0 ? (
                    <motion.div
                      key="guides-panel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-[10px] font-semibold text-[#9E3A2E]/80 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Guías más solicitadas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {guideButtons.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => send(q.label)}
                            className="text-[11px] px-2.5 py-1.5 rounded-full bg-[#7A2A1E]/8 text-[#1A1A1A] border border-[#7A2A1E]/20 hover:bg-[#7A2A1E]/15 hover:border-[#7A2A1E]/40 transition-all duration-200 font-medium text-left leading-tight hover:shadow-sm"
                          >
                            <span className="mr-0.5">{q.icon}</span> {q.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : faqButtons.length > 0 ? (
                    <motion.div
                      key="faq-panel"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-[10px] font-semibold text-[#9E3A2E]/80 mb-1.5 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        Preguntas frecuentes
                      </p>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                        {faqButtons.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => send(q)}
                            className="w-full text-left text-[11px] px-3 py-2 rounded-lg bg-[#7A2A1E]/5 text-[#1A1A1A]/80 border border-[#7A2A1E]/10 hover:bg-[#7A2A1E]/12 hover:border-[#7A2A1E]/25 transition-all duration-200 leading-tight hover:shadow-sm"
                          >
                            <span className="text-[#9E3A2E] mr-1.5 font-bold">❓</span>
                            {q}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Collapsible: Glossary + General */}
                <AnimatePresence>
                  {showMoreTags && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {glossaryTags.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-[#1A1A1A]/60 mb-1.5 flex items-center gap-1">
                            <BookText className="w-3 h-3" />
                            Glosario
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {glossaryTags.map((tag, idx) => (
                              <button
                                key={idx}
                                onClick={() => send(tag)}
                                className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]/70 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 transition-all duration-200 font-medium"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-2.5">
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                          <span>📎</span> General
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {generalTags.map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => send(tag.replace(/^[^\s]+\s/, ''))}
                              className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-[#1A1A1A] transition-all duration-200"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setShowMoreTags(!showMoreTags)}
                  className="text-[10px] text-gray-400 hover:text-[#9E3A2E] transition-colors mt-2 text-left w-full flex items-center gap-0.5"
                >
                  {showMoreTags ? (
                    <><span className="text-[9px]">▴</span> Ver menos opciones</>
                  ) : (
                    <><span className="text-[9px]">▾</span> Ver glosario y más opciones</>
                  )}
                </button>
              </div>
            )}

            {/* Chat Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escriba su consulta..."
                  disabled={isLoading}
                  className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#7A2A1E] focus:ring-1 focus:ring-cuban-red/20 disabled:opacity-50"
                  aria-label="Escribir mensaje"
                />
                <button
                  onClick={() => send(chatInput)}
                  disabled={isLoading || !chatInput.trim()}
                  className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#1A1A1A]-light transition-colors shrink-0 disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Asistente virtual con fines informativos. No sustituye el asesoramiento jurídico profesional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 relative ${
          chatOpen ? 'bg-gray-700 hover:bg-gray-800' : 'bg-[#7A2A1E] hover:bg-[#7A2A1E]-light'
        }`}
        aria-label={chatOpen ? 'Cerrar asistente' : 'Abrir asistente virtual'}
      >
        {chatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </>
        )}
      </motion.button>
    </div>
  );
}
