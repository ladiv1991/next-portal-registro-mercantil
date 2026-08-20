'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Headphones } from 'lucide-react';

export default function ContactForm() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#9E3A2E]" />
          <CardTitle className="text-[#1A1A1A]">Mesa de Ayuda</CardTitle>
        </div>
        <CardDescription>Envíe su consulta y nuestro equipo le responderá a la brevedad</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input placeholder="Su nombre" className="mt-1" />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input placeholder="correo@ejemplo.cu" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Asunto</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione un asunto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="constitucion">Solicitud de Primera Inscripción de un Sujeto</SelectItem>
                <SelectItem value="modificaciones">Modificaciones</SelectItem>
                <SelectItem value="cuentas">Estado de Situación</SelectItem>
                <SelectItem value="certificaciones">Certificaciones</SelectItem>
                <SelectItem value="tecnico">Soporte Técnico</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mensaje</Label>
            <Textarea placeholder="Describa su consulta..." className="mt-1 min-h-[100px]" />
          </div>
          <Button className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]-light text-white">
            <Send className="w-4 h-4 mr-2" />
            Enviar Consulta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
