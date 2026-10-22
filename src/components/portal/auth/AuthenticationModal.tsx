'use client';

import React, { useState } from 'react';
import { Lock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface AuthenticationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

export default function AuthenticationModal({ open, onOpenChange, onAuthSuccess }: AuthenticationModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('portal_token', data.token);
          localStorage.setItem('portal_user', JSON.stringify(data.user));
          onOpenChange(false);
          onAuthSuccess?.();
          window.location.reload();
        } else {
          setError(data.message || 'Login fallido');
        }
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEnzonaRedirect = () => {
    window.location.href = `/api/auth/enzona/callback?redirect=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-[var(--rm-primary)]" />
            <DialogTitle>Autenticarse</DialogTitle>
          </div>
          <DialogDescription>
            Ingrese sus credenciales o autentíquese con ENZONA para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-[var(--rm-text)]">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="border-gray-300 focus:border-[var(--rm-primary)] focus:ring-[var(--rm-primary)]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--rm-text)]">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="border-gray-300 focus:border-[var(--rm-primary)] focus:ring-[var(--rm-primary)]/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--rm-text)] text-white hover:bg-[var(--rm-text)]-light transition-all duration-300 rounded-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-gray-200" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
              <span className="text-xs text-gray-500 font-medium">O</span>
            </div>
          </div>

          {/* ENZONA Login */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center font-medium">
              Autentíquese con su cuenta de ENZONA
            </p>
            <Button
              className="w-full bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 transition-all duration-300 rounded-lg font-medium shadow-sm"
              onClick={handleEnzonaRedirect}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Autenticarse con ENZONA
            </Button>
            <p className="text-xs text-gray-500 text-center">
              ¿No tienes cuenta de ENZONA?{' '}
              <a
                href="https://www.enzona.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--rm-primary)] hover:underline font-medium"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
