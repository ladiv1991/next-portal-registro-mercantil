'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Zap, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnzonaLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generar state para CSRF protection
      const state = Math.random().toString(36).substring(7);
      
      // Guardar state en cookie
      document.cookie = `enzona_state=${state}; path=/; max-age=600; secure; samesite=lax`;

      // Obtener configuración de ENZONA
      const configRes = await fetch('/api/cms/enzona-config');
      const configData = await configRes.json();
      const config = configData.data;

      if (!config || !config.merchantId) {
        setError('ENZONA no está configurado. Contacte al administrador.');
        setLoading(false);
        return;
      }

      // Construir URL de autenticación ENZONA
      // TODO: Actualizar con URL real de ENZONA cuando esté disponible
      const enzonaAuthUrl = new URL('/oauth/authorize', config.apiUrl);
      enzonaAuthUrl.searchParams.append('client_id', config.merchantId);
      enzonaAuthUrl.searchParams.append('redirect_uri', `${window.location.origin}/api/auth/enzona/callback`);
      enzonaAuthUrl.searchParams.append('response_type', 'code');
      enzonaAuthUrl.searchParams.append('scope', 'profile email');
      enzonaAuthUrl.searchParams.append('state', state);

      // Redirigir a ENZONA
      window.location.href = enzonaAuthUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con ENZONA');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#1A1A1A] rounded-full p-3">
                <Shield className="w-6 h-6 text-[#9E3A2E]" />
              </div>
            </div>
            <CardTitle className="text-2xl">Portal del Usuario</CardTitle>
            <CardDescription>
              Auténtica con ENZONA para acceder a tus servicios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* ENZONA Login Button */}
            <Button
              onClick={handleEnzonaLogin}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-navy to-navy-light hover:from-navy-light hover:to-navy text-white font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Ingresar con ENZONA
                </>
              )}
            </Button>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">¿Qué puedes hacer?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#9E3A2E]" />
                  <span>Realizar trámites en línea</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#9E3A2E]" />
                  <span>Seguimiento de solicitudes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#9E3A2E]" />
                  <span>Descarga de documentos</span>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
              <p className="font-semibold mb-1">Seguridad Garantizada</p>
              <p>
                Tu información está protegida con autenticación ENZONA y encriptación de grado bancario.
              </p>
            </div>

            {/* Back Link */}
            <div className="text-center">
              <Link href="/" className="text-sm text-[#1A1A1A] hover:underline">
                ← Volver al portal público
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>¿Necesitas ayuda?</p>
          <a href="#" className="text-[#9E3A2E] hover:underline">
            Contacta a la Mesa de Ayuda
          </a>
        </div>
      </motion.div>
    </div>
  );
}