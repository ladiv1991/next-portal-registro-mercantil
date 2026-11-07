/**
 * Email templates for the Registro Mercantil portal.
 *
 * Uses inline styles for maximum email client compatibility.
 * Paleta MINJUS oficial: #005A9C (primary), #0074C8 (accent),
 * #F2F4F7 (light bg), #1F2937 (text), #6B7280 (muted).
 */

const BRAND = 'Registro Mercantil';
const DOMAIN = 'registromercantil.cu';
const COLORS = {
  primary: '#005A9C',
  accent: '#0074C8',
  lightBg: '#F2F4F7',
  text: '#1F2937',
  muted: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

// ---------------------------------------------------------------------------
// Shared HTML structure
// ---------------------------------------------------------------------------

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.lightBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.lightBg};">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:${COLORS.white};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 16px rgba(0,0,0,0.04);">

          <!-- Header band -->
          <tr>
            <td style="background:linear-gradient(135deg,${COLORS.primary} 0%,${COLORS.accent} 100%);padding:28px 32px;text-align:center;">
              <div style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:6px;">Ministerio de Justicia</div>
              <div style="font-size:20px;font-weight:700;color:${COLORS.white};margin:0;line-height:1.3;">Registro Mercantil</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${COLORS.lightBg};border-top:1px solid ${COLORS.border};padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${COLORS.muted};">
                Este es un mensaje automático, por favor no responda.<br/>
                ${BRAND} · ${DOMAIN}
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export function passwordReset(name: string, resetUrl: string): string {
  const body = `
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${COLORS.text};line-height:1.3;">
    Restablece tu contraseña
  </h1>
  <p style="margin:0 0 8px;font-size:15px;color:${COLORS.text};line-height:1.6;">
    Hola <strong>${name}</strong>,
  </p>
  <p style="margin:0 0 24px;font-size:15px;color:${COLORS.muted};line-height:1.6;">
    Hemos recibido una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el botón de abajo para crear una nueva.
  </p>
  <!-- CTA button -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td align="center" style="border-radius:8px;background:linear-gradient(135deg,${COLORS.primary} 0%,${COLORS.accent} 100%);">
        <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${COLORS.white};text-decoration:none;border-radius:8px;">
          Restablecer contraseña
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};line-height:1.6;">
    Si el botón no funciona, copia y pega este enlace en tu navegador:
  </p>
  <p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:${COLORS.muted};word-break:break-all;">
    <a href="${resetUrl}" style="color:${COLORS.accent};text-decoration:underline;">${resetUrl}</a>
  </p>
  <div style="background-color:${COLORS.lightBg};border-left:3px solid ${COLORS.accent};padding:12px 14px;border-radius:0 6px 6px 0;">
    <p style="margin:0;font-size:13px;color:${COLORS.muted};line-height:1.5;">
      ⏱️ Este enlace expira en <strong>1 hora</strong>. Si no solicitaste el cambio, ignora este correo.
    </p>
  </div>`;

  return shell('Restablece tu contraseña — Registro Mercantil', body);
}
