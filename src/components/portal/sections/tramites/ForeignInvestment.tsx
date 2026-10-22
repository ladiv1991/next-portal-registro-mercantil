"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, Globe2, Info, MapPin, Phone, Mail } from "lucide-react";

export default function ForeignInvestment() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-[var(--rm-text)]">Inversión Extranjera</CardTitle>
        <CardDescription>
          Los trámites de inversión extranjera se gestionan a través de la Ventanilla Única de Comercio Exterior (VUCE) y la Ventanilla Única de Inversión Extranjera (VUINEX)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VUCE */}
        <div className="bg-[var(--rm-surface)] border border-[var(--rm-primary-light)]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--rm-primary)]/10 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6 text-[var(--rm-primary)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[var(--rm-text)] mb-1">Ventanilla Única de Comercio Exterior (VUCE)</h4>
              <p className="text-sm text-[var(--rm-muted)] mb-4">
                Conforme a la Disposición Especial Primera del Decreto-Ley 226/2001,
                los trámites de inversión extranjera —empresas mixtas y empresas de capital totalmente
                extranjero (sucursales y filiales)— se gestionan ante la VUCE. La inscripción registral posterior
                se realiza ante el Registro Mercantil Central (Art. 27, DL 226/2001).
              </p>
              <a
                href="https://home.vucecuba.mincex.gob.cu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--rm-primary)] text-white rounded-lg hover:bg-[var(--rm-primary-light)] transition-colors font-medium text-sm"
              >
                Acceder a la VUCE
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* VUINEX */}
        <div className="bg-[var(--rm-surface)] border border-[var(--rm-primary-light)]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--rm-primary)]/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[var(--rm-primary)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[var(--rm-text)] mb-1">Ventanilla Única de Inversión Extranjera (VUINEX)</h4>
              <p className="text-sm text-[var(--rm-muted)] mb-3">
                VUINEX centraliza y agiliza los trámites de autorización para la inversión extranjera en Cuba.
                El Registro Mercantil Central inscribe los actos societarios una vez autorizada la inversión
                por las autoridades competentes a través de esta ventanilla.
              </p>
              <ul className="text-sm text-[var(--rm-muted)] space-y-1 mb-4">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--rm-primary)]" /> Infanta #16 e/ 23 y Humboldt, Plaza de la Revolución, La Habana 10400</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--rm-primary)]" /> (07) 8331719</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--rm-primary)]" /> inversionextranjera@mincex.gob.cu</li>
              </ul>
              <a
                href="https://vuinex.mincex.gob.cu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--rm-primary)] text-white rounded-lg hover:bg-[var(--rm-primary-light)] transition-colors font-medium text-sm"
              >
                Acceder a VUINEX
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ZED Mariel */}
        <div className="bg-[var(--rm-surface)] border border-[var(--rm-primary-light)]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--rm-primary)]/10 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6 text-[var(--rm-primary)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[var(--rm-text)] mb-1">Zona Especial de Desarrollo Mariel (ZED Mariel)</h4>
              <p className="text-sm text-[var(--rm-muted)] mb-3">
                Para inversiones dentro de la Zona Especial de Desarrollo Mariel, los trámites se realizan
                a través de su sistema de ventanilla única.
              </p>
              <ul className="text-sm text-[var(--rm-muted)] space-y-1 mb-4">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--rm-primary)]" /> Zona Especial de Desarrollo Mariel, Cuba</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--rm-primary)]" /> ventanillaunica@zedmariel.co.cu</li>
              </ul>
              <a
                href="https://www.zedmariel.com/sistema-de-ventanilla-unica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--rm-primary)] text-white rounded-lg hover:bg-[var(--rm-primary-light)] transition-colors font-medium text-sm"
              >
                Acceder a ZED Mariel
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Nota */}
        <div className="flex items-start gap-3 p-4 bg-[var(--rm-surface)] rounded-lg">
          <Info className="w-5 h-5 text-[var(--rm-muted)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--rm-muted)]">
            <strong>Nota:</strong> El Registro Mercantil no gestiona directamente
            los trámites de inversión extranjera. Conforme a la Disposición
            Transitoria Tercera del DL 226, el traspaso del Registro de Inversiones
            Extranjeras desde la Cámara de Comercio al Ministerio de Justicia se
            completó. La solicitud de autorización se realiza ante VUINEX o VUCE según corresponda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
