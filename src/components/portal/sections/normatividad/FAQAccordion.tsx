'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      { q: '¿Qué es el Registro Mercantil?', a: 'El Registro Mercantil es un registro público de carácter administrativo, dependiente del Ministerio de Justicia, donde se inscriben las sociedades mercantiles, sus modificaciones, los actos y documentos sujetos a inscripción, proporcionando publicidad formal y seguridad jurídica al tráfico mercantil.' },
      { q: '¿Quién puede constituir una sociedad mercantil en Cuba?', a: 'Pueden constituir sociedades mercantiles las personas naturales cubanas, las personas jurídicas cubanas, los inversionistas extranjeros mediante las modalidades previstas en la Ley de Inversión Extranjera (VUCE), y las cooperativas conforme a la legislación específica.' },
      { q: '¿Cuántos tipos de sociedades existen en Cuba?', a: 'Las principales formas societarias son: Sociedad de Responsabilidad Limitada (SRL), Sociedad Anónima (SA), Sociedad Cooperativa, Empresa Estatal, Empresa Mixta y Empresa de Capital 100% Extranjero.' },
    ],
  },
  {
    category: 'Trámites',
    questions: [
      { q: '¿Cuánto tiempo toma constituir una sociedad?', a: 'El proceso de constitución puede tomar entre 15 y 30 días hábiles dependiendo del tipo societario y la complejidad del caso. Las constituciones digitales tienen un tiempo promedio de procesamiento menor.' },
      { q: '¿Qué documentos necesito para constituir una SRL?', a: 'Se requiere: solicitud formal, estatutos sociales (mínimo 2 socios), documento de reserva de denominación, acreditación de capital social inicial (mínimo 5,000 CUP), documento de designación de administrador y comprobante de pago del arancel.' },
      { q: '¿Puedo realizar trámites en línea?', a: 'Sí, la plataforma digital permite realizar la totalidad de los trámites registrales de forma electrónica, incluyendo constitución, modificaciones, depósito de cuentas y solicitud de certificaciones.' },
      { q: '¿Cómo solicito una certificación registral?', a: 'Puede solicitarla a través del portal digital, seleccionando el tipo de certificación deseada, indicando el NIRE o denominación de la sociedad. Recibirá el documento digital con firma electrónica y código de verificación CSV.' },
    ],
  },
  {
    category: 'Costos y Pagos',
    questions: [
      { q: '¿Cuál es el costo de constituir una sociedad?', a: 'La Resolución 51/2021 unifica la tarifa: presentación de primera inscripción 900 CUP y asiento de primera inscripción 1,200 CUP. La reserva de denominación cuesta 600 CUP. Las tarifas no incluyen impuestos.' },
      { q: '¿Cómo puedo realizar el pago de los aranceles?', a: 'Los pagos pueden realizarse en línea a través de la plataforma mediante transferencia bancaria o en las oficinas del Registro Mercantil en efectivo o con tarjeta.' },
    ],
  },
  {
    category: 'Certificaciones y Documentos',
    questions: [
      { q: '¿Qué es una nota simple?', a: 'La nota simple es un documento que contiene la información pública básica de una sociedad inscrita en el Registro Mercantil, incluyendo denominación, NIRE, tipo societario, capital, domicilio, administradores y estado actual.' },
      { q: '¿Cómo verifico la autenticidad de un documento registral?', a: 'Cada documento emitido por el Registro Mercantil incluye un código de verificación CSV. Puede verificar su autenticidad ingresando este código en la sección "Verificar Documento" del portal.' },
    ],
  },
];

export default function FAQAccordion() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#9E3A2E]" />
          <CardTitle className="text-[#1A1A1A]">Preguntas Frecuentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          {FAQ_DATA.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Badge variant="outline" className="text-[#9E3A2E] border-[#7A2A1E]/30">{category.category}</Badge>
              </h3>
              <Accordion type="multiple" className="mb-4">
                {category.questions.map((faq, i) => (
                  <AccordionItem key={i} value={`${category.category}-${i}`}>
                    <AccordionTrigger className="text-sm hover:no-underline text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
