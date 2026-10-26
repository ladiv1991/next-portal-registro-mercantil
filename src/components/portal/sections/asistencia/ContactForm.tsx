'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Headphones, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  email?: string;
  subject?: string;
  message?: string;
  captcha?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [submittedAt] = useState<string>(() => new Date().toISOString());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch('/api/captcha/new')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCaptchaSvg(json.svg);
          setCaptchaId(json.id);
        }
      })
      .catch(() => {});
  }, []);

  const refreshCaptcha = () => {
    setCaptchaAnswer('');
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

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.email.trim()) {
      e.email = 'El correo electrónico es obligatorio';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      e.email = 'Formato de correo electrónico inválido';
    }
    if (!formData.subject) {
      e.subject = 'Debe seleccionar un asunto';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      e.message = 'El mensaje es obligatorio (mínimo 10 caracteres)';
    }
    if (!captchaAnswer.trim()) {
      e.captcha = 'Ingrese la verificación de seguridad';
    }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSending(true);
    fetch('/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        website: '', // honeypot: must be empty
        captchaId,
        captchaAnswer,
        submittedAt,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al enviar');
        setSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setCaptchaAnswer('');
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Error al enviar la consulta';
        if (msg.includes('CAPTCHA') || msg.includes('seguridad')) {
          refreshCaptcha();
        }
        setErrors({ message: msg });
      })
      .finally(() => setSending(false));
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (sent) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <CardTitle className="text-[var(--rm-text)]">Consulta Enviada</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--rm-muted)]">
            Su consulta ha sido recibida. Nuestro equipo le responderá a la brevedad
            al correo electrónico proporcionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Mesa de Ayuda</CardTitle>
        </div>
        <CardDescription>Envíe su consulta y nuestro equipo le responderá a la brevedad</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Honeypot field — hidden, bots fill it; real users never see it */}
          <Input
            type="text"
            name="website"
            className="hidden opacity-0 absolute -z-10 pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name">Nombre</Label>
              <Input
                id="contact-name"
                placeholder="Su nombre"
                className="mt-1"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">
                Correo electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="correo@ejemplo.cu"
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.email}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="contact-subject">
              Asunto <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.subject}
              onValueChange={(v) => updateField('subject', v)}
            >
              <SelectTrigger className={`mt-1 ${errors.subject ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Debe seleccionar un asunto" />
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
            {errors.subject && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.subject}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="contact-message">
              Mensaje <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="contact-message"
              placeholder="Describa su consulta (mínimo 10 caracteres)..."
              className={`mt-1 min-h-[100px] ${errors.message ? 'border-red-500' : ''}`}
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.message}
              </p>
            )}
          </div>
          {/* CAPTCHA challenge */}
          <div>
            <Label>
              Verificación de seguridad <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3 mt-1">
              {captchaSvg ? (
                <div
                  className="border rounded-md p-2 bg-white flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
              ) : (
                <div className="w-[200px] h-[70px] border rounded-md bg-gray-100 flex-shrink-0" />
              )}
              <Input
                type="text"
                placeholder="Escriba lo que ve en la imagen"
                className={`flex-1 ${errors.captcha ? 'border-red-500' : ''}`}
                value={captchaAnswer}
                onChange={(e) => {
                  setCaptchaAnswer(e.target.value);
                  if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: undefined }));
                }}
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={refreshCaptcha}
                title="Actualizar CAPTCHA"
                className="flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {errors.captcha && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.captcha}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[var(--rm-text)] hover:bg-[var(--rm-text)]/90 text-white"
            disabled={sending}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
