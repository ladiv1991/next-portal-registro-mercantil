'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeInUp } from '@/data/portal-data';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Enlace inválido. Solicita uno nuevo desde el formulario de recuperación.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Error al restablecer');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div {...fadeInUp} className="flex items-center justify-center min-h-[60vh] py-10">
        <Card className="w-full max-w-md glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <CardTitle>Contraseña Actualizada</CardTitle>
            </div>
            <CardDescription>
              Tu contraseña ha sido restablecida exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button onClick={() => router.push('#acceso')} className="w-full">
              Ir al login
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
              <Lock className="w-3 h-3 mr-1" />
              Nueva Contraseña
            </Badge>
          </div>
          <CardTitle className="text-[var(--rm-text)]">Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para el correo {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repite la contraseña"
                className="mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-[var(--rm-text)] hover:bg-[var(--rm-text)]-light text-white" disabled={loading}>
              {loading ? 'Procesando...' : 'Restablecer contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
