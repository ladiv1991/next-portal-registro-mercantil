'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const GLOSSARY = [
  { term: 'NIRE', definition: 'Número de Identificación Registral. Código único asignado a cada sociedad mercantil inscrita.' },
  { term: 'SRL', definition: 'Sociedad de Responsabilidad Limitada. Tipo societario con capital dividido en cuotas y responsabilidad limitada al capital aportado.' },
  { term: 'SA', definition: 'Sociedad Anónima. Tipo societario con capital dividido en acciones y responsabilidad limitada al capital aportado.' },
  { term: 'Capital Social', definition: 'Patrimonio de la sociedad, constituido por las aportaciones de los socios.' },
  { term: 'Estatutos Sociales', definition: 'Documento normativo que regula el funcionamiento interno de la sociedad.' },
  { term: 'Objeto Social', definition: 'Actividades económicas para las que fue constituida la sociedad.' },
  { term: 'Nota Simple', definition: 'Documento informativo con los datos públicos esenciales de una sociedad.' },
  { term: 'Certificación Registral', definition: 'Documento oficial con valor probatorio que acredita la inscripción de actos en el Registro.' },
  { term: 'CSV', definition: 'Código de Verificación Seguro. Código alfanumérico para verificar la autenticidad de documentos.' },
  { term: 'Domicilio Social', definition: 'Dirección legal de la sociedad, donde se encuentran sus órganos de administración.' },
  { term: 'Fusión', definition: 'Operación societaria por la cual dos o más sociedades se unen para formar una nueva.' },
  { term: 'Escisión', definition: 'División de una sociedad en dos o más sociedades independientes.' },
];

export default function Glossary() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#9E3A2E]" />
          <CardTitle className="text-[#1A1A1A]">Glosario</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GLOSSARY.map((item) => (
            <div key={item.term} className="p-4 glass-card-inner hover:border-[#7A2A1E]/30 transition-colors">
              <p className="text-sm font-semibold text-[#1A1A1A]">{item.term}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
