'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeInUp } from '@/data/portal-data';

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordSection({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const fetchCaptcha = () => {
    fetch('/api/captcha/new')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCaptchaSvg(json.svg);
          setCaptchaId(json.id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingrese su correo electrónico');
      return;
    }
    if (!captchaAnswer.trim()) {
      setError('Complete la verificación de seguridad');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaId, captchaAnswer }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.error?.includes('CAPTCHA')) fetchCaptcha();
        setError(json.error || 'Error al enviar');
        return;
      }
      setSent(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div {...fadeInUp} className="flex items-center justify-center min-h-[60vh] py-10">
        <Card className="w-full max-w-md glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <CardTitle>Correo Enviado</CardTitle>
            </div>
            <CardDescription>
              Si el correo existe en nuestro sistema, recibirá un enlace para restablecer su contraseña en los próximos minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verifique su bandeja de entrada y spam. El enlace expira en 1 hora.
            </p>
            <Button onClick={onBack} variant="outline" className="w-full">
              Volver al login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeInUp} className="flex items-center justify-center min-h-[60vh] py-10">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-[var(--rm-primary)] border-[var(--rm-primary)]/30">
              <Mail className="w-3 h-3 mr-1" />
              Recuperación
            </Badge>
          </div>
          <CardTitle className="text-[var(--rm-text)]">¿Olvidó su contraseña?</CardTitle>
          <CardDescription>
            Ingrese su correo registrado y resolverá una verificación de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="forgot-email">Correo electrónico</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="nombre.apellido@minjus.cu"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verificación de seguridad
              </Label>
              <div
                className="mt-1 border rounded-md p-2 bg-white inline-block"
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                aria-label="Imagen CAPTCHA para verificación de seguridad"
              />
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Escriba exactamente los caracteres que ve en la imagen. Use mayúsculas si las hay.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Escriba lo que ve"
                  className={`flex-1 ${error && !captchaAnswer ? 'border-red-500' : ''}`}
                  value={captchaAnswer}
                  onChange={(e) => { setCaptchaAnswer(e.target.value); if (error) setError(''); }}
                  autoFocus
                  disabled={loading}
                  maxLength={8}
                  aria-label="Respuesta del CAPTCHA"
                />
                <Button type="button" variant="outline" size="icon" onClick={fetchCaptcha} disabled={loading} aria-label="Actualizar imagen CAPTCHA">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[var(--rm-text)] hover:bg-[var(--rm-text)]-light text-white" disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" />Enviar enlace de recuperación</>
              )}
            </Button>

            <Button type="button" variant="ghost" onClick={onBack} className="w-full">
              Volver al login
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
