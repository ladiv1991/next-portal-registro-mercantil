"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, Globe2, Info } from "lucide-react";

export default function ForeignInvestment() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl">Inversión Extranjera</CardTitle>
        <CardDescription>
          Los trámites de inversión extranjera se gestionan a través de la Ventanilla Única de Comercio Exterior (VUCE)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Ventanilla Única de Comercio Exterior (VUCE)</h4>
              <p className="text-sm text-blue-800 mb-4">
                Conforme a la Disposición Especial Primera del Decreto-Ley 226/2001,
                los trámites de inversión extranjera —empresas mixtas, contratos de
                asociación económica internacional y empresas de capital totalmente
                extranjero— se gestionan ante la VUCE. La inscripción registral posterior
                se realiza ante el Registro Mercantil Central (Art. 27, DL 226/2001).
              </p>
              <a
                href="https://www.vuce.cu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Acceder a la VUCE
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> El Registro Mercantil no gestiona directamente
            los trámites de inversión extranjera. Conforme a la Disposición
            Transitoria Tercera del DL 226, el traspaso del Registro de Inversiones
            Extranjeras desde la Cámara de Comercio al Ministerio de Justicia se
            completó. Sin embargo, la solicitud de autorización se realiza ante la VUCE.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}