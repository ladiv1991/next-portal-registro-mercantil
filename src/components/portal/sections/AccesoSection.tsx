'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Shield, AlertCircle, FileSignature, FileCheck, Award,
  ClipboardList, BarChart3, FolderOpen, MessageCircle, UserCog,
  Settings, BadgeInfo, ExternalLink, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { fadeInUp } from '@/data/portal-data';

interface AccesoSectionProps {
  onLogin: (email: string, password: string, captchaId: string, captchaAnswer: string) => Promise<boolean>;
  loginError: string;
  onForgotPassword: () => void;
}

export default function AccesoSection({ onLogin, loginError, onForgotPassword }: AccesoSectionProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');

  const fetchCaptcha = () => {
    fetch('/api/captcha/new')
      .then((res) => res.json())
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

  const refreshCaptcha = () => {
    setCaptchaAnswer('');
    fetchCaptcha();
  };

  const displayError = localError || loginError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!loginEmail.trim()) {
      setLocalError('Por favor, ingrese su correo electrónico.');
      return;
    }
    if (!loginPassword.trim()) {
      setLocalError('Por favor, ingrese su contraseña.');
      return;
    }
    if (!captchaAnswer.trim()) {
      setLocalError('Complete la verificación de seguridad.');
      return;
    }

    setLoginLoading(true);
    try {
      const success = await onLogin(loginEmail, loginPassword, captchaId, captchaAnswer);
      if (!success) {
        refreshCaptcha();
      }
    } catch {
      setLocalError('Error de conexión. Intente nuevamente.');
      refreshCaptcha();
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <Badge className="mb-4 bg-white text-[var(--rm-primary)] border-[var(--rm-primary)]/30 shadow-sm">
            <Lock className="w-3 h-3 mr-1" />
            Acceso Registradores
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Portal de Registradores</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Acceso exclusivo para funcionarios del Registro Mercantil. Sistema de Gestión Registral.
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="rounded-t-[28px]">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--rm-primary)]" />
                <CardTitle className="text-[var(--rm-text)]">Acceso al Sistema</CardTitle>
              </div>
              <CardDescription>Ingrese sus credenciales para acceder al Sistema de Gestión Registral</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Display */}
                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-[var(--rm-primary)]/10 border border-[var(--rm-primary)]/20"
                    >
                      <AlertCircle className="w-4 h-4 text-[var(--rm-primary)] mt-0.5 shrink-0" />
                      <p className="text-sm text-[var(--rm-primary)]">{displayError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <Label htmlFor="login-email">Usuario</Label>
                  <Input
                    id="login-email"
                    placeholder="nombre.apellido@minjus.cu"
                    className="mt-1"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Contraseña</Label>
                  <PasswordInput
                    id="login-password"
                    placeholder="••••••••"
                    className="mt-1"
                    value={loginPassword}
                    onChange={(v) => setLoginPassword(v)}
                    disabled={loginLoading}
                  />
                </div>
                {/* CAPTCHA challenge */}
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
                      className={`flex-1 ${localError && !captchaAnswer ? 'border-red-500' : ''}`}
                      value={captchaAnswer}
                      onChange={(e) => {
                        setCaptchaAnswer(e.target.value);
                        if (localError) setLocalError('');
                      }}
                      autoFocus
                      disabled={loginLoading}
                      maxLength={8}
                      aria-label="Respuesta del CAPTCHA"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={refreshCaptcha}
                      title="Actualizar CAPTCHA"
                      disabled={loginLoading}
                      aria-label="Actualizar imagen CAPTCHA"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Recordar sesión
                  </label>
                  <button type="button" className="text-sm text-[var(--rm-primary)] hover:underline" onClick={onForgotPassword}>¿Olvidó su contraseña?</button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[var(--rm-text)] hover:bg-[var(--rm-text)]-light text-white h-11"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Acceso restringido a funcionarios autorizados del Registro Mercantil.
                </p>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-center text-muted-foreground">
                    <BadgeInfo className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                    El acceso es exclusivo para usuarios autorizados del Registro Mercantil.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* SGR Features */}
          <div className="space-y-6">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[var(--rm-primary)]" />
                  <CardTitle className="text-[var(--rm-text)]">Sistema de Gestión Registral (SGR)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  El SGR es la plataforma interna que permite a los registradores gestionar los trámites, inscripciones y certificaciones del Registro Mercantil.
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'Gestión de Inscripciones', desc: 'Procesamiento y registro de actos mercantiles', icon: FileSignature },
                    { title: 'Validación Documental', desc: 'Revisión y validación de documentos recibidos', icon: FileCheck },
                    { title: 'Emisión de Certificaciones', desc: 'Generación de certificaciones digitales con firma electrónica', icon: Award },
                    { title: 'Bandeja de Trámites', desc: 'Cola de trámites pendientes y en procesamiento', icon: ClipboardList },
                  ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <feature.icon className="w-5 h-5 text-[var(--rm-primary)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--rm-text)]">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="glass-card-inner overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-[var(--rm-primary)]" />
                    <h2 className="font-semibold text-sm text-[var(--rm-text)]">Estadísticas Internas</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Dashboard de métricas de gestión, productividad y carga de trabajo.</p>
                </CardContent>
              </Card>
              <Card className="glass-card-inner overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen className="w-4 h-4 text-[var(--rm-primary)]" />
                    <h2 className="font-semibold text-sm text-[var(--rm-text)]">Gestión Documental</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Archivo digital, búsqueda avanzada y gestión de expedientes.</p>
                </CardContent>
              </Card>
              <Card className="glass-card-inner overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[var(--rm-primary)]" />
                    <h2 className="font-semibold text-sm text-[var(--rm-text)]">Comunicación Interna</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Mensajería y notificaciones entre registradores y oficinas.</p>
                </CardContent>
              </Card>
              <Card className="glass-card-inner overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCog className="w-4 h-4 text-[var(--rm-primary)]" />
                    <h2 className="font-semibold text-sm text-[var(--rm-text)]">Administración</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Gestión de usuarios, permisos y configuración del sistema.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
