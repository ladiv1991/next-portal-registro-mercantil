'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock, Users } from 'lucide-react';

const WEBINARS = [
  { title: 'Nuevas normativas del Registro Mercantil 2025', date: '28 Enero 2025', time: '10:00 AM', status: 'Próximo', attendees: 234 },
  { title: 'Taller de constitución digital', date: '5 Febrero 2025', time: '2:00 PM', status: 'Próximo', attendees: 156 },
  { title: 'Seminario de inversiones extranjeras', date: '15 Enero 2025', time: '10:00 AM', status: 'Finalizado', attendees: 412 },
  { title: 'Jornada de actualización jurídica mercantil', date: '10 Diciembre 2024', time: '9:00 AM', status: 'Finalizado', attendees: 580 },
];

export default function WebinarsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <Radio className="w-5 h-5 text-[#9E3A2E]" />
        Webinars y Eventos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEBINARS.map((webinar) => (
          <Card key={webinar.title} className="glass-card-inner overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#1A1A1A]/5 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[#1A1A1A]">{webinar.date.split(' ')[0]}</span>
                  <span className="text-xs text-muted-foreground">{webinar.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm">{webinar.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{webinar.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{webinar.attendees}</span>
                  </div>
                  <Badge className={`mt-2 text-xs ${
                    webinar.status === 'Próximo' ? 'bg-[#7A2A1E]/10 text-[#9E3A2E]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {webinar.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
