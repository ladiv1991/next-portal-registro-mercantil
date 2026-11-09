'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const TTS_STORAGE_KEY = 'rmc-tts-disabled';

// Check if browser supports SpeechSynthesis
const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Get available voices, prefer Spanish
function getPreferredVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  return esVoice ?? voices[0] ?? null;
}

// Extract readable text from the current visible section
function getContentText(): string {
  // Try to find the currently rendered section by data attribute or section id
  const sectionId = document.querySelector('[data-active-section]')?.getAttribute('data-active-section');
  let container: HTMLElement | null = null;

  if (sectionId) {
    container = document.querySelector(`[data-section="${sectionId}"]`);
  }

  // Fallback: use main content area, exclude header/footer/nav
  if (!container) {
    container = document.querySelector('main#main-content');
  }

  if (!container) return '';

  // Remove non-content elements
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript, [role="presentation"], svg').forEach(el => el.remove());

  // Collapse whitespace but keep paragraph breaks
  const text = clone.innerText || clone.textContent || '';
  return text.replace(/\s+/g, ' ').trim();
}

export default function TextToSpeechButton() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Respect prefers-reduced-motion: disable auto-start but keep manual toggle
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check localStorage for user override
  useEffect(() => {
    const stored = localStorage.getItem(TTS_STORAGE_KEY);
    setDisabled(stored === 'true');

    if (isSupported) {
      setSupported(true);
      voicesRef.current = window.speechSynthesis.getVoices();
    }
  }, []);

  // Reload voices on change (Chrome loads them async)
  useEffect(() => {
    if (!isSupported) return;
    const handler = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
  }, []);

  const handleToggle = useCallback(() => {
    if (!isSupported || disabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setSpeaking(false);
    utteranceRef.current = null;

    if (prefersReducedMotion) return;

    const text = getContentText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    const voice = getPreferredVoice(voicesRef.current);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95; // Slightly slower for clarity

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [disabled, prefersReducedMotion]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    utteranceRef.current = null;
  }, []);

  if (!supported || disabled) return null;

  return (
    <button
      onClick={speaking ? handleStop : handleToggle}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
        speaking
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : 'bg-[var(--rm-primary)] hover:bg-[var(--rm-primary)]/90 text-white'
      }`}
      aria-label={speaking ? 'Detener lectura' : 'Escuchar contenido'}
      title={speaking ? 'Detener lectura' : 'Escuchar contenido de la sección actual'}
    >
      {speaking ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
