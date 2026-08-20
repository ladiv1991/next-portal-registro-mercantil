'use client';

import { useState } from 'react';
import { PremiumGateButton, PremiumGateWrapper } from '@/components/portal/PremiumGate';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, Shield } from 'lucide-react';

/**
 * Página de ejemplo que demuestra cómo usar los componentes de Premium Gate
 * en características que requieren suscripción.
 */
export function PremiumFeaturesExample() {
  const { requireFeature } = useFeatureAccess();
  const [selectedData, setSelectedData] = useState<string | null>(null);

  const handleDownloadCertificate = async () => {
    // Esta función requiere verificación de premium
    if (requireFeature('download-certificate')) {
      // Aquí va la lógica real de descarga
      setSelectedData('Certificado de Inscripción descargado correctamente');
    }
  };

  const handleGenerateReport = async () => {
    if (requireFeature('generate-advanced-report')) {
      setSelectedData('Reporte avanzado generado exitosamente');
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Funciones Premium</h1>
        <p className="text-gray-600">
          Estos ejemplos muestran cómo se integran las validaciones premium en la interfaz.
        </p>
      </div>

      {/* Ejemplo 1: Botones con Premium Gate */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Descargar Certificado
            </CardTitle>
            <CardDescription>
              Descarga certificaciones oficiales del Registro Mercantil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Con un plan Premium o superior, podrás descargar certificados de inscripción,
              certificaciones de búsqueda y otros documentos oficiales.
            </p>
            <PremiumGateButton
              featureName="Descargar Certificado"
              onAccess={handleDownloadCertificate}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Descargar Ahora
            </PremiumGateButton>
            {selectedData && selectedData.includes('Certificado') && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-900 text-sm">
                ✓ {selectedData}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Generar Reportes Avanzados
            </CardTitle>
            <CardDescription>
              Crea reportes personalizados y análisis detallados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Disponible solo en el Plan Empresarial. Genera reportes custom,
              análisis de tendencias y estadísticas personalizadas.
            </p>
            <PremiumGateButton
              featureName="Generar Reporte Avanzado"
              onAccess={handleGenerateReport}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Crear Reporte Premium
            </PremiumGateButton>
            {selectedData && selectedData.includes('Reporte') && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-900 text-sm">
                ✓ {selectedData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ejemplo 2: Wrapper para contenido premium */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            Búsqueda Avanzada (Premium)
          </CardTitle>
          <CardDescription>
            Exclusiva para usuarios con suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PremiumGateWrapper 
            featureName="advanced-search"
            requiresPremium={true}
            fallback={
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-4">
                  Búsqueda Avanzada Bloqueada
                </p>
                <p className="text-gray-600 mb-6">
                  Los filtros avanzados están disponibles solo para usuarios premium.
                  Actualiza tu plan para acceder a:
                </p>
                <ul className="text-left max-w-xs mx-auto space-y-2 mb-6 text-sm text-gray-600">
                  <li>✓ Búsqueda por múltiples criterios</li>
                  <li>✓ Filtros por provincia y tipo</li>
                  <li>✓ Historial de búsquedas</li>
                  <li>✓ Alertas de cambios registrales</li>
                </ul>
              </div>
            }
          >
            <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Búsqueda Avanzada Disponible
                </label>
                <p className="text-sm text-gray-600">
                  Felicitaciones, tu plan tiene acceso a todas las funciones avanzadas.
                </p>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Acceder a Búsqueda Avanzada
              </Button>
            </div>
          </PremiumGateWrapper>
        </CardContent>
      </Card>

      {/* Ejemplo 3: Comparación de features */}
      <Card>
        <CardHeader>
          <CardTitle>Características por Plan</CardTitle>
          <CardDescription>
            Comparación de lo que incluye cada nivel de suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-3 font-semibold text-gray-900">Característica</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Gratis</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Básico</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Premium</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Búsqueda de sociedades', free: '✓', basic: '✓', premium: '✓', enterprise: '✓' },
                  { feature: 'Información pública', free: '✓', basic: '✓', premium: '✓', enterprise: '✓' },
                  { feature: 'Descarga certificados', free: '✗', basic: '✓', premium: '✓', enterprise: '✓' },
                  { feature: 'Búsqueda avanzada', free: '✗', basic: '✗', premium: '✓', enterprise: '✓' },
                  { feature: 'Reportes personalizados', free: '✗', basic: '✗', premium: '✗', enterprise: '✓' },
                  { feature: 'API Access', free: '✗', basic: '✗', premium: '✗', enterprise: '✓' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-700">{row.feature}</td>
                    <td className="py-3 px-3 text-center text-gray-600">{row.free}</td>
                    <td className="py-3 px-3 text-center text-green-600">{row.basic}</td>
                    <td className="py-3 px-3 text-center text-green-600">{row.premium}</td>
                    <td className="py-3 px-3 text-center text-green-600">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
