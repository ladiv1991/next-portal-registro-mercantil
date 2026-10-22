'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Phone, Mail, MessageCircle, MapPin, Bot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer } from '@/data/portal-data';
import GuidesSection from './asistencia/GuidesSection';
import VideoTutorials from './asistencia/VideoTutorials';
import WebinarsSection from './asistencia/WebinarsSection';
import ContactForm from './asistencia/ContactForm';
import FAQAccordion from './normatividad/FAQAccordion';

interface VideoTutorialItem {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: number;
  category?: string;
  order: number;
  visible: boolean;
}

interface WebinarItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  status?: string;
  maxAttendees?: number;
  order: number;
  visible: boolean;
}

interface ContactChannelItem {
  id: string;
  type: string;
  label: string;
  value: string;
  icon?: string;
  order: number;
  visible: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  visible: boolean;
}

export default function AsistenciaSection() {
  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<VideoTutorialItem[]>([]);
  const [webinars, setWebinars] = useState<WebinarItem[]>([]);
  const [contacts, setContacts] = useState<ContactChannelItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setTutorials(json.data.videoTutorials || []);
            setWebinars(json.data.webinars || []);
            setContacts(json.data.contactChannels || []);
            setFaqs(json.data.faqs || []);
          }
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const contactIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    phone: Phone,
    email: Mail,
    chat: MessageCircle,
    address: MapPin,
  };

  if (loading) {
    return (
      <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
        <section className="bg-[var(--rm-text)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-10 w-64 mx-auto mb-3 bg-white/20" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-white text-[var(--rm-primary)] border-[var(--rm-primary)]/30 shadow-sm">
            <GraduationCap className="w-3 h-3 mr-1" />
            Asistencia y Formación
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Centro de Ayuda</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Guías paso a paso, tutoriales, webinars y asistencia personalizada para todos los usuarios.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Guides */}
        <GuidesSection />

        {/* Video Tutorials */}
        {tutorials.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <VideoTutorials />
          </motion.div>
        )}
        {!tutorials.length && <VideoTutorials />}

        {/* Webinars */}
        {webinars.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <WebinarsSection />
          </motion.div>
        )}
        {!webinars.length && <WebinarsSection />}

        {/* Preguntas Frecuentes */}
        {faqs.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <FAQAccordion />
          </motion.div>
        )}
        {faqs.length === 0 && <FAQAccordion />}

        {/* Help Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <ContactForm />

          {/* Contact Channels */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[var(--rm-primary)]" />
                  <CardTitle className="text-[var(--rm-text)]">Canales de Contacto</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length > 0 ? contacts.map((ch) => {
                    const IconComp = contactIconMap[ch.type?.toLowerCase()] || Phone;
                    return (
                      <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <IconComp className="w-5 h-5 text-[var(--rm-primary)] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--rm-text)]">{ch.label}</p>
                          <p className="text-sm text-muted-foreground">{ch.value}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <Phone className="w-5 h-5 text-[var(--rm-primary)] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--rm-text)]">Teléfono</p>
                          <p className="text-sm text-muted-foreground">(+53) 7 862-3456 • Lun-Vie 8:30-16:30</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <Mail className="w-5 h-5 text-[var(--rm-primary)] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--rm-text)]">Correo Electrónico</p>
                          <p className="text-sm text-muted-foreground">soporte@registromercantil.cu</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <MessageCircle className="w-5 h-5 text-[var(--rm-primary)] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--rm-text)]">Chat en Línea</p>
                          <p className="text-sm text-muted-foreground">Disponible Lun-Vie 8:30-16:30</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                        <MapPin className="w-5 h-5 text-[var(--rm-primary)] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--rm-text)]">Oficina Central</p>
                          <p className="text-sm text-muted-foreground">Calle Obispo No. 154, La Habana Vieja</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chatbot */}
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--rm-primary)]/20 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-[var(--rm-primary)]" />
                </div>
                <h3 className="font-bold text-[var(--rm-text)] mb-2">Asistente Virtual</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nuestro asistente virtual está disponible 24/7 para responder sus preguntas frecuentes sobre trámites y servicios del Registro Mercantil.
                </p>
                <Button className="bg-[var(--rm-primary)] text-[var(--rm-text)] hover:bg-[var(--rm-primary)]-light">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
