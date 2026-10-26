'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error] 500:', error.message, error.digest);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f9fc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(160deg, #0b3d6e, #082f56)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 0 }}>
          500
        </div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6776', marginTop: 4, marginBottom: 24 }}>
          Error interno del servidor
        </p>
        <h1 style={{ fontSize: '1.4rem', color: '#1f2937', marginBottom: 12 }}>Servicio no disponible</h1>
        <p style={{ color: '#5a6776', lineHeight: 1.65, marginBottom: 24 }}>
          Algo salió mal en el servidor. Intente nuevamente en unos minutos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={reset}
            style={{ width: '100%', padding: '13px 20px', borderRadius: 12, fontWeight: 600, fontSize: 0.95, fontFamily: 'inherit', cursor: 'pointer', background: '#0b3d6e', color: '#fff', border: '1px solid #0b3d6e', boxShadow: '0 8px 20px -8px rgba(11,61,110,0.55)' }}
          >
            Reintentar
          </button>
          <a
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 20px', borderRadius: 12, fontWeight: 600, fontSize: 0.95, fontFamily: 'inherit', textDecoration: 'none', background: 'transparent', color: '#0b3d6e', border: '1px solid #e3e9f0' }}
          >
            Volver al inicio
          </a>
        </div>
        {error?.digest && (
          <details style={{ marginTop: 20, fontSize: 0.76, color: '#5a6776', background: '#f6f9fc', border: '1px solid #e3e9f0', borderRadius: 10, padding: '10px 14px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#0b3d6e', userSelect: 'none' }}>
              Información técnica
            </summary>
            <div style={{ marginTop: 8, lineHeight: 1.7 }}>
              <strong>Error:</strong> {error.message}<br />
              <strong>Digest:</strong> <code>{error.digest}</code><br />
              <strong>Fecha:</strong> {new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' })}<br />
              <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
