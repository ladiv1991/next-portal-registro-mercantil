'use client';

import React from 'react';
import { Save, Loader2, Bot, Zap, ExternalLink, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCmsToast } from '@/lib/cms-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { BotConfig as BotConfigType } from './cms-types';
import { getBotConfig, createBotConfig, updateBotConfig, testBotConnection } from './cms-api';

interface FormData {
  provider: string; model: string; apiUrl: string; apiKey: string;
  systemPrompt: string; maxTokens: number; temperature: number; enabled: boolean;
}

const INTERNAL_DEFAULTS: FormData = {
  provider: 'z-ai-web-dev-sdk',
  model: '',
  apiUrl: '',
  apiKey: '',
  systemPrompt: 'Eres un asistente virtual del Registro Mercantil de Cuba. Ayudas a los usuarios con consultas sobre solicitud de Primera Inscripción de un Sujeto, modificaciones, normativas legales y trámites comerciales.',
  maxTokens: 2048,
  temperature: 0.7,
  enabled: true,
};

const OPENAI_DEFAULTS: FormData = {
  provider: 'openai-compatible',
  model: 'gpt-3.5-turbo',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  systemPrompt: 'Eres un asistente virtual del Registro Mercantil de Cuba. Ayudas a los usuarios con consultas sobre solicitud de Primera Inscripción de un Sujeto, modificaciones, normativas legales y trámites comerciales.',
  maxTokens: 2048,
  temperature: 0.7,
  enabled: true,
};

export default function CmsBotConfig() {
  const [configs, setConfigs] = React.useState<BotConfigType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const [form, setForm] = React.useState<FormData>(INTERNAL_DEFAULTS);
  const [existingId, setExistingId] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  // Test state
  const [testMessage, setTestMessage] = React.useState('');
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [testError, setTestError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBotConfig();
      setConfigs(data);
      if (data.length > 0) {
        const c = data[0];
        setExistingId(c.id);
        setForm({
          provider: c.provider,
          model: c.model,
          apiUrl: c.apiUrl,
          apiKey: c.apiKey,
          systemPrompt: c.systemPrompt,
          maxTokens: c.maxTokens,
          temperature: c.temperature,
          enabled: c.enabled,
        });
        setFieldErrors({});
      }
    } catch (e) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleProviderChange = (provider: string) => {
    const defaults = provider === 'z-ai-web-dev-sdk' ? INTERNAL_DEFAULTS : OPENAI_DEFAULTS;
    setForm({ ...defaults, systemPrompt: form.systemPrompt, enabled: form.enabled });
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.provider) errs.provider = 'El proveedor es requerido';
    if (form.maxTokens < 256 || form.maxTokens > 8192) errs.maxTokens = 'Entre 256 y 8192';
    if (form.temperature < 0 || form.temperature > 2) errs.temperature = 'Entre 0 y 2';
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); toast.error('Corrija los errores antes de guardar'); return; }
    try {
      setSaving(true);
      const payload = { ...form };
      if (existingId) { await updateBotConfig(existingId, payload); toast.success(formatCmsToast('Configuración', 'IA', 'actualizada')); }
      else { const created = await createBotConfig(payload); setExistingId(created.id); toast.success(formatCmsToast('Configuración', 'IA', 'creada')); }
      setFieldErrors({});
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) { toast.error('Escriba un mensaje de prueba'); return; }
    try {
      setTesting(true);
      setTestResult(null);
      setTestError(null);
      const result = await testBotConnection({
        provider: form.provider,
        model: form.model,
        apiUrl: form.apiUrl,
        apiKey: form.apiKey,
        systemPrompt: form.systemPrompt,
        maxTokens: form.maxTokens,
        temperature: form.temperature,
        testMessage: testMessage.trim(),
      });
      setTestResult(result.reply);
      toast.success('Conexión exitosa');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error en la conexión';
      setTestError(msg);
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Configuración del Bot IA</h2>
          <p className="text-sm text-gray-500">Configure el asistente virtual del portal</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Configuración del Bot IA</h2>
        <p className="text-sm text-gray-500">Configure el asistente virtual del portal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Config Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#1A1A1A]" />
              <CardTitle className="text-base">Configuración del Modelo</CardTitle>
            </div>
            <CardDescription>Seleccione el proveedor y configure los parámetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Provider Selector */}
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { clearError('provider'); handleProviderChange('z-ai-web-dev-sdk'); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    form.provider === 'z-ai-web-dev-sdk'
                      ? 'border-[#7A2A1E] bg-[#7A2A1E]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#9E3A2E]" />
                    <span className="text-sm font-semibold">Interno</span>
                  </div>
                  <p className="text-xs text-gray-500">z-ai-web-dev-sdk</p>
                </button>
                <button
                  type="button"
                  onClick={() => { clearError('provider'); handleProviderChange('openai-compatible'); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    form.provider === 'openai-compatible'
                      ? 'border-[#7A2A1E] bg-[#7A2A1E]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink className="w-4 h-4 text-[#1A1A1A]" />
                    <span className="text-sm font-semibold">OpenAI Compatible</span>
                  </div>
                  <p className="text-xs text-gray-500">API externa</p>
                </button>
              </div>
              {fieldErrors.provider && <p className="text-xs text-[#9E3A2E]">{fieldErrors.provider}</p>}
            </div>

            {/* Provider Info Banner */}
            {form.provider === 'z-ai-web-dev-sdk' && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#1A1A1A]/5 border border-[#1A1A1A]/10">
                <Info className="w-4 h-4 text-[#1A1A1A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[#1A1A1A]">Proveedor Interno (z-ai-web-dev-sdk)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Utiliza el SDK interno preconfigurado. No requiere API Key ni URL personalizada. Modelo y configuración se manejan automáticamente.</p>
                </div>
              </div>
            )}

            {form.provider === 'openai-compatible' && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#7A2A1E]/5 border border-[#7A2A1E]/10">
                <AlertCircle className="w-4 h-4 text-[#9E3A2E] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[#9E3A2E]">OpenAI Compatible</p>
                  <p className="text-xs text-gray-500 mt-0.5">Conecta con cualquier API compatible con OpenAI (OpenAI, Azure OpenAI, Ollama, etc.). Debe proporcionar la URL del API, la API Key y el nombre del modelo.</p>
                </div>
              </div>
            )}

            {/* OpenAI Specific Fields */}
            {form.provider === 'openai-compatible' && (
              <>
                <div className="space-y-2">
                  <Label>Modelo <span className="text-[#9E3A2E]">*</span></Label>
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ej: gpt-3.5-turbo, gpt-4" />
                </div>
                <div className="space-y-2">
                  <Label>API URL <span className="text-[#9E3A2E]">*</span></Label>
                  <Input value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })} placeholder="https://api.openai.com/v1" maxLength={500} />
                  <p className="text-xs text-gray-400">{form.apiUrl.length}/500</p>
                </div>
                <div className="space-y-2">
                  <Label>API Key <span className="text-[#9E3A2E]">*</span></Label>
                  <PasswordInput value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="sk-..." maxLength={500} />
                  <p className="text-xs text-gray-400">{form.apiKey.length}/500</p>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>System Prompt</Label>
                <span className="text-xs text-gray-400">{form.systemPrompt.length}/5000</span>
              </div>
              <Textarea
                value={form.systemPrompt}
                onChange={(e) => {
                  if (e.target.value.length <= 5000) setForm({ ...form, systemPrompt: e.target.value });
                }}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input type="number" min={256} max={8192} value={form.maxTokens} onChange={(e) => { clearError('maxTokens'); setForm({ ...form, maxTokens: Math.min(8192, Math.max(256, parseInt(e.target.value) || 256)) }); }} />
                {fieldErrors.maxTokens && <p className="text-xs text-[#9E3A2E]">{fieldErrors.maxTokens}</p>}
                <p className="text-xs text-gray-400">Rango: 256 - 8192</p>
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input type="number" min={0} max={2} step={0.1} value={form.temperature} onChange={(e) => { clearError('temperature'); setForm({ ...form, temperature: Math.min(2, Math.max(0, parseFloat(e.target.value) || 0)) }); }} />
                {fieldErrors.temperature && <p className="text-xs text-[#9E3A2E]">{fieldErrors.temperature}</p>}
                <p className="text-xs text-gray-400">Rango: 0 - 2</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <Label>Bot Habilitado</Label>
                <p className="text-xs text-gray-400">Activar el chatbot en el portal</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(c) => setForm({ ...form, enabled: c })} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </CardContent>
        </Card>

        {/* Status & Test Card */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {configs.length === 0 ? (
                <div className="text-center py-6">
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin configuración guardada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Proveedor</span>
                    <Badge variant="outline" className="text-[#1A1A1A] border-[#1A1A1A]/20">
                      {configs[0].provider === 'z-ai-web-dev-sdk' ? 'Interno (z-ai-web-dev-sdk)' : 'OpenAI Compatible'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Modelo</span>
                    <span className="text-sm font-medium">{configs[0].model || 'Auto'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Max Tokens</span>
                    <span className="text-sm font-medium">{configs[0].maxTokens}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Temperature</span>
                    <span className="text-sm font-medium">{configs[0].temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estado</span>
                    <Badge variant={configs[0].enabled ? 'default' : 'secondary'} className={configs[0].enabled ? 'bg-green-100 text-green-700' : ''}>
                      {configs[0].enabled ? 'Habilitado' : 'Deshabilitado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Última actualización</span>
                    <span className="text-sm text-gray-600">{new Date(configs[0].updatedAt).toLocaleString('es-CU')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#9E3A2E]" />
                <CardTitle className="text-base">Probar Conexión</CardTitle>
              </div>
              <CardDescription>Envíe un mensaje de prueba al bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensaje de Prueba</Label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={2}
                  placeholder="Ej: ¿Cómo constituir una sociedad?"
                />
              </div>
              <Button onClick={handleTest} disabled={testing} variant="outline" className="w-full border-[#7A2A1E] text-[#9E3A2E] hover:bg-[#7A2A1E]/5">
                {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Zap className="w-4 h-4 mr-2" />
                {testing ? 'Probando...' : 'Probar Conexión'}
              </Button>

              {testResult && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Respuesta del Bot:</p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{testResult}</p>
                </div>
              )}

              {testError && (
                <div className="p-4 rounded-lg bg-[#7A2A1E]/5 border border-[#7A2A1E]/20">
                  <p className="text-xs font-medium text-[#9E3A2E] mb-1">Error:</p>
                  <p className="text-sm text-[#9E3A2E]">{testError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
