'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Eye } from 'lucide-react';

const VIDEO_TUTORIALS = [
  { title: 'Cómo constituir una sociedad en línea', duration: '12:34', views: 8450, category: 'Constitución' },
  { title: 'Gestión de modificaciones societarias', duration: '8:21', views: 5620, category: 'Modificaciones' },
  { title: 'Depósito digital de estado de situación', duration: '6:45', views: 3890, category: 'Cuentas' },
  { title: 'Verificación de documentos registrales', duration: '4:12', views: 7200, category: 'Certificaciones' },
  { title: 'Uso de la plataforma de trámites', duration: '10:08', views: 11200, category: 'Plataforma' },
  { title: 'Interpretación de certificaciones', duration: '7:55', views: 4500, category: 'Certificaciones' },
];

export default function VideoTutorials() {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-[var(--rm-text)] mb-6 flex items-center gap-2">
        <Video className="w-5 h-5 text-[var(--rm-primary)]" />
        Tutoriales en Video
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEO_TUTORIALS.map((video) => (
          <Card key={video.title} className="glass-card-inner overflow-hidden cursor-pointer">
            <div className="relative bg-[var(--rm-text)] h-40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
              <Badge className="absolute top-3 left-3 bg-[var(--rm-primary)] text-white text-xs">{video.category}</Badge>
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-[var(--rm-text)] leading-snug">{video.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                {video.views.toLocaleString('es-ES')} visualizaciones
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
