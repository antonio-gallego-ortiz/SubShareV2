/**
 * Supabase Edge Function: send-invitation
 *
 * Setup:
 *   1. Deploy: supabase functions deploy send-invitation
 *   2. Set secret (free account at resend.com → API Keys):
 *        supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
 */

// Deno global — types not bundled in standard TS, safe to declare here
declare const Deno: { env: { get(key: string): string | undefined } };

// Use Resend npm package (Deno supports npm: specifier natively)
// @ts-ignore
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Deno.serve is available in Deno 1.35+ (used by Supabase Edge Runtime)
// @ts-ignore — Deno global is injected at runtime
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { inviteeEmail, inviterName, subscriptionName, inviteLink, monthlyShare } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const resend = new Resend(RESEND_API_KEY);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación SubShare</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;margin-bottom:12px;">S</div>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">SubShare</h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Comparte suscripciones. Ahorra dinero.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">¡Tienes una invitación! 🎉</h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                <strong style="color:#111827;">${inviterName}</strong> te está invitando a compartir
                <strong style="color:#2563eb;">${subscriptionName}</strong> a través de SubShare.
              </p>

              <!-- Invite card -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <p style="color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;margin:0 0 12px;">Detalles del plan</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#374151;font-size:14px;padding-bottom:8px;">📦 Suscripción</td>
                    <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;padding-bottom:8px;">${subscriptionName}</td>
                  </tr>
                  <tr>
                    <td style="color:#374151;font-size:14px;padding-bottom:8px;">💶 Tu parte mensual</td>
                    <td style="color:#2563eb;font-size:16px;font-weight:700;text-align:right;padding-bottom:8px;">€${Number(monthlyShare).toFixed(2)}/mes</td>
                  </tr>
                  <tr>
                    <td style="color:#374151;font-size:14px;">👤 Invitado por</td>
                    <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;">${inviterName}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${inviteLink}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
                  Aceptar invitación →
                </a>
              </div>

              <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0 0 4px;">
                Este enlace expira en <strong>7 días</strong>.
              </p>
              <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                Si no reconoces esta invitación, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="color:#d1d5db;font-size:12px;margin:0;">© 2025 SubShare · Gestión de suscripciones compartidas</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { data, error: sendError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inviteeEmail,
      subject: `${inviterName} te invita a compartir ${subscriptionName} en SubShare`,
      html: htmlContent,
    });

    if (sendError) throw new Error((sendError as { message?: string }).message || 'Resend error');

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
