'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Clock, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SgrPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rm-surface, #F2F4F7)', color: 'var(--rm-text, #1F2937)' }}>
      <header
        className="border-b"
        style={{ background: 'linear-gradient(180deg, #0B1F3A 0%, var(--rm-primary, #005A9C) 100%)', color: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-white/70">Registro Mercantil de Cuba</div>
            <div className="text-lg font-bold tracking-wide">Sistema de Gestión Registral</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            En desarrollo — Próximamente
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4" style={{ color: 'var(--rm-primary, #005A9C)' }}>
            Sistema de Gestión Registral
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            El SGR es el nuevo sistema de gestión registral que centralizará trámites, consultas y gestión de expedientes.
            Actualmente se encuentra en fase de desarrollo y no está disponible para uso público.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: FileText, title: 'Trámites digitales', desc: 'Gestión integral de solicitudes y expedientes.' },
              { icon: Shield, title: 'Seguridad registral', desc: 'Autenticación robusta para usuarios autorizados.' },
              { icon: Building2, title: 'Portal institucional', desc: 'Acceso centralizado a servicios del Registro.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <Icon className="w-8 h-8 mb-3" style={{ color: 'var(--rm-primary, #005A9C)' }} />
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al portal
              </Button>
            </Link>
            <Link href="/acceso">
              <Button
                className="gap-2 text-white"
                style={{ background: 'linear-gradient(135deg, var(--rm-primary, #005A9C) 0%, var(--rm-primary, #005A9C) 100%)' }}
              >
                <Shield className="w-4 h-4" />
                Acceso CMS (gestión de contenidos)
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-10">
            Para consultas sobre el SGR, contacte al equipo del Registro Mercantil de Cuba.
          </p>
        </div>
      </main>
    </div>
  );
}