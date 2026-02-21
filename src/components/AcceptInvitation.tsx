import { useEffect, useState } from 'react';
import { acceptInvitation, declineInvitation, getInvitationByToken } from '../lib/supabaseApi';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InvitationData {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitee_email: string;
  token: string;
  expires_at: string;
  subscription: {
    id: string;
    name: string;
    logo: string | null;
    price: number;
    billing_cycle: string;
    total_members: number;
  } | null;
  inviter: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface AcceptInvitationProps {
  token: string;
  isLoggedIn: boolean;
  onAccepted: () => void;
  onDeclined: () => void;
  onNeedLogin: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SERVICE_LOGOS: Record<string, string> = {
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  disney: 'disneyplus.com',
  youtube: 'youtube.com',
  hbo: 'hbomax.com',
  amazon: 'primevideo.com',
  apple: 'apple.com',
  chatgpt: 'openai.com',
  microsoft365: 'microsoft.com',
  dropbox: 'dropbox.com',
  discord: 'discord.com',
};

function getLogoUrl(slug: string): string {
  const domain = SERVICE_LOGOS[slug?.toLowerCase()] ?? `${slug?.toLowerCase()}.com`;
  return `https://logo.clearbit.com/${domain}`;
}

function getFaviconUrl(slug: string): string {
  const domain = SERVICE_LOGOS[slug?.toLowerCase()] ?? `${slug?.toLowerCase()}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function ServiceLogo({ id, name }: { id: string; name: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  if (step === 2) {
    const initials = (name || id || '?').slice(0, 2).toUpperCase();
    return (
      <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl select-none">
        {initials}
      </div>
    );
  }

  const src = step === 0 ? getLogoUrl(id) : getFaviconUrl(id);
  return (
    <img
      src={src}
      alt={name}
      className="w-20 h-20 object-contain rounded-2xl bg-white shadow"
      onError={() => setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : 2))}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Aceptada', className: 'bg-green-100 text-green-800' },
    declined: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
    expired: { label: 'Expirada', className: 'bg-gray-100 text-gray-700' },
  };
  const { label, className } = map[status] ?? map.expired;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AcceptInvitation({
  token,
  isLoggedIn,
  onAccepted,
  onDeclined,
  onNeedLogin,
}: AcceptInvitationProps) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null);

  // ── Fetch invitation on mount ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getInvitationByToken(token);
        if (!cancelled) setInvitation(data as InvitationData);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message ?? 'Invitación no encontrada.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // ── Before login: store token and redirect ──
  const handleNeedLogin = () => {
    sessionStorage.setItem('pendingInviteToken', token);
    onNeedLogin();
  };

  // ── Accept ──
  const handleAccept = async () => {
    if (!isLoggedIn) { handleNeedLogin(); return; }
    setActionLoading('accept');
    setError(null);
    try {
      await acceptInvitation(token);
      setDone('accepted');
      setTimeout(() => onAccepted(), 1500);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'No se pudo aceptar la invitación.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Decline ──
  const handleDecline = async () => {
    if (!isLoggedIn) { handleNeedLogin(); return; }
    setActionLoading('decline');
    setError(null);
    try {
      await declineInvitation(token);
      setDone('declined');
      setTimeout(() => onDeclined(), 1500);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'No se pudo rechazar la invitación.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Compute share ──
  const monthlyShare = invitation?.subscription
    ? invitation.subscription.price / (invitation.subscription.total_members || 1)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Invitación de Suscripción</h1>
          <p className="text-gray-500 mt-1 text-sm">Has recibido una invitación para compartir una suscripción</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Loading */}
          {loading && (
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          )}

          {/* Error */}
          {!loading && error && !done && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Invitación no válida</h2>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {/* Already acted / expired */}
          {!loading && invitation && invitation.status !== 'pending' && !done && (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <StatusBadge status={invitation.status} />
              </div>
              <p className="text-gray-500 text-sm">
                Esta invitación ya fue {invitation.status === 'accepted' ? 'aceptada' : invitation.status === 'declined' ? 'rechazada' : 'expirada'}.
              </p>
            </div>
          )}

          {/* Success states */}
          {done && (
            <div className="p-8 text-center">
              {done === 'accepted' ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">¡Invitación aceptada!</h2>
                  <p className="text-gray-500 text-sm mt-1">Ahora eres miembro de la suscripción. Cargando dashboard…</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Invitación rechazada</h2>
                  <p className="text-gray-500 text-sm mt-1">Has rechazado la invitación.</p>
                </>
              )}
            </div>
          )}

          {/* Main — pending invitation */}
          {!loading && invitation && invitation.status === 'pending' && !done && (
            <>
              {/* Subscription info */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <ServiceLogo
                    id={invitation.subscription?.logo || invitation.subscription?.name || ''}
                    name={invitation.subscription?.name || ''}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {invitation.subscription?.name ?? 'Suscripción'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Invitado por <span className="font-medium text-gray-700">{invitation.inviter?.full_name ?? invitation.inviter?.email ?? 'Alguien'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Precio total</p>
                  <p className="text-lg font-bold text-gray-900">
                    €{invitation.subscription?.price?.toFixed(2) ?? '—'}<span className="text-xs font-normal text-gray-500">/mes</span>
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">Tu parte</p>
                  <p className="text-lg font-bold text-indigo-700">
                    €{monthlyShare?.toFixed(2) ?? '—'}<span className="text-xs font-normal text-indigo-400">/mes</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Miembros del grupo</p>
                  <p className="text-base font-semibold text-gray-900">{invitation.subscription?.total_members ?? '—'} personas</p>
                </div>
              </div>

              {/* Error row */}
              {error && (
                <div className="px-6 pb-2">
                  <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
                </div>
              )}

              {/* CTA */}
              {!isLoggedIn ? (
                <div className="p-6 pt-2 flex flex-col gap-3">
                  <p className="text-sm text-gray-500 text-center">Debes iniciar sesión para aceptar o rechazar esta invitación.</p>
                  <button
                    onClick={handleNeedLogin}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Iniciar sesión / Registrarse
                  </button>
                </div>
              ) : (
                <div className="p-6 pt-2 flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'decline' ? 'Rechazando…' : 'Rechazar'}
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading !== null}
                    className="flex-2 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-indigo-200"
                  >
                    {actionLoading === 'accept' ? 'Aceptando…' : '✓ Aceptar invitación'}
                  </button>
                </div>
              )}

              {/* Expiry note */}
              <div className="px-6 pb-6 text-center">
                <p className="text-xs text-gray-400">
                  Esta invitación expira el {new Date(invitation.expires_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
