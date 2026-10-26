'use client';

import React from 'react';
import { Save, TestTube, AlertCircle, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getEnzonaConfig, createEnzonaConfig, updateEnzonaConfig, testEnzonaConnection } from './cms-api';

interface EnzonaConfig {
  id: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  merchantId: string;
  returnUrl: string;
  cancelUrl: string;
  testMode: boolean;
  currency: string;
}

export default function CmsEnzonaConfig() {
  const [config, setConfig] = useState<EnzonaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    apiUrl: 'https://api.enzona.net',
    consumerKey: '',
    consumerSecret: '',
    merchantId: '',
    returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/success`,
    cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/cancel`,
    testMode: true,
    currency: 'CUP',
  });

  React.useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const result = await getEnzonaConfig();
      if (result) {
        setConfig(result);
        setForm({
          apiUrl: result.apiUrl,
          consumerKey: result.consumerKey,
          consumerSecret: result.consumerSecret,
          merchantId: result.merchantId,
          returnUrl: result.returnUrl,
          cancelUrl: result.cancelUrl,
          testMode: result.testMode,
          currency: result.currency,
        });
      }
    } catch (error) {
      console.error('Error fetching ENZONA config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = config
        ? await updateEnzonaConfig(config.id, form)
        : await createEnzonaConfig(form);

      if (result) {
        setConfig(result);
        toast.success('Configuración de ENZONA guardada exitosamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testEnzonaConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Error de conexión' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Configuración de ENZONA
          </CardTitle>
          <CardDescription>
            Configura la integración con ENZONA.net para procesar pagos de suscripciones premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apiUrl">URL de API</Label>
              <Input
                id="apiUrl"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                placeholder="https://api.enzona.net"
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="CUP"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <PasswordInput
                id="consumerKey"
                value={form.consumerKey}
                onChange={(e) => setForm({ ...form, consumerKey: e.target.value })}
                placeholder="Tu consumer key de ENZONA"
              />
            </div>
            <div>
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <PasswordInput
                id="consumerSecret"
                value={form.consumerSecret}
                onChange={(e) => setForm({ ...form, consumerSecret: e.target.value })}
                placeholder="Tu consumer secret de ENZONA"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="merchantId">Merchant ID</Label>
            <Input
              id="merchantId"
              value={form.merchantId}
              onChange={(e) => setForm({ ...form, merchantId: e.target.value })}
              placeholder="Tu merchant ID de ENZONA"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="returnUrl">URL de Retorno (Éxito)</Label>
              <Input
                id="returnUrl"
                value={form.returnUrl}
                onChange={(e) => setForm({ ...form, returnUrl: e.target.value })}
                placeholder="/payment/success"
              />
            </div>
            <div>
              <Label htmlFor="cancelUrl">URL de Cancelación</Label>
              <Input
                id="cancelUrl"
                value={form.cancelUrl}
                onChange={(e) => setForm({ ...form, cancelUrl: e.target.value })}
                placeholder="/payment/cancel"
              />
            </div>
          </div>

          {/* Test Mode */}
          <div className="flex items-center space-x-2">
            <Switch
              id="testMode"
              checked={form.testMode}
              onCheckedChange={(checked) => setForm({ ...form, testMode: checked })}
            />
            <Label htmlFor="testMode">Modo de Prueba</Label>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Configuración
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
              Probar Conexión
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-800 mb-2">¿Cómo obtener las credenciales de ENZONA?</h3>
          <ol className="text-blue-700 space-y-1 text-sm">
            <li>1. Regístrate como comerciante en <a href="https://enzona.net" target="_blank" rel="noopener noreferrer" className="underline">enzona.net</a></li>
            <li>2. Accede al panel de desarrolladores</li>
            <li>3. Crea una aplicación y obtén tus credenciales API</li>
            <li>4. Configura las URLs de retorno en tu aplicación ENZONA</li>
            <li>5. Activa el modo de producción cuando estés listo</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}