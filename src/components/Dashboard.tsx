import { CreditCard, ArrowRight, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { View, Subscription } from '../App';
import { Navbar } from './Navbar';
import { getCurrentProfile, getUserSubscriptions, getSubscriptionMembers, deleteSubscription } from '../lib/supabaseApi';

// ── Service brand-color registry ────────────────────────────────────────────
const SERVICE_STYLES: Record<string, { bg: string; initial: string }> = {
  netflix:       { bg: 'bg-red-600',     initial: 'N' },
  spotify:       { bg: 'bg-green-500',   initial: 'S' },
  disney:        { bg: 'bg-blue-800',    initial: 'D' },
  disneyplus:    { bg: 'bg-blue-800',    initial: 'D' },
  youtube:       { bg: 'bg-red-500',     initial: 'Y' },
  hbo:           { bg: 'bg-purple-700',  initial: 'H' },
  hbomax:        { bg: 'bg-purple-700',  initial: 'H' },
  amazon:        { bg: 'bg-yellow-600',  initial: 'A' },
  amazonprime:   { bg: 'bg-yellow-600',  initial: 'A' },
  primevideo:    { bg: 'bg-yellow-600',  initial: 'P' },
  apple:         { bg: 'bg-gray-900',    initial: 'A' },
  appletv:       { bg: 'bg-gray-900',    initial: 'A' },
  chatgpt:       { bg: 'bg-teal-600',    initial: 'C' },
  openai:        { bg: 'bg-teal-600',    initial: 'O' },
  microsoft:     { bg: 'bg-blue-600',    initial: 'M' },
  microsoft365:  { bg: 'bg-blue-600',    initial: 'M' },
  office365:     { bg: 'bg-orange-600',  initial: 'O' },
  dropbox:       { bg: 'bg-blue-400',    initial: 'D' },
  twitch:        { bg: 'bg-purple-600',  initial: 'T' },
  discord:       { bg: 'bg-indigo-500',  initial: 'D' },
  slack:         { bg: 'bg-purple-500',  initial: 'S' },
  zoom:          { bg: 'bg-blue-500',    initial: 'Z' },
  adobe:         { bg: 'bg-red-700',     initial: 'A' },
  figma:         { bg: 'bg-orange-500',  initial: 'F' },
  github:        { bg: 'bg-gray-900',    initial: 'G' },
  notion:        { bg: 'bg-gray-800',    initial: 'N' },
  canva:         { bg: 'bg-cyan-500',    initial: 'C' },
  duolingo:      { bg: 'bg-green-500',   initial: 'D' },
  paramount:     { bg: 'bg-blue-700',    initial: 'P' },
  peacock:       { bg: 'bg-yellow-500',  initial: 'P' },
  crunchyroll:   { bg: 'bg-orange-500',  initial: 'C' },
  dazn:          { bg: 'bg-black',       initial: 'D' },
  mubi:          { bg: 'bg-rose-700',    initial: 'M' },
};

const FALLBACK_COLORS = [
  'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-500',
  'bg-teal-600', 'bg-indigo-600', 'bg-rose-600', 'bg-cyan-600',
  'bg-emerald-600', 'bg-amber-600',
];

// ── Clearbit logo domain map ─────────────────────────────────────────────────
const SERVICE_LOGOS: Record<string, string> = {
  netflix:       'netflix.com',
  spotify:       'spotify.com',
  disney:        'disneyplus.com',
  disneyplus:    'disneyplus.com',
  youtube:       'youtube.com',
  hbo:           'hbomax.com',
  hbomax:        'hbomax.com',
  amazon:        'amazon.com',
  amazonprime:   'primevideo.com',
  primevideo:    'primevideo.com',
  apple:         'apple.com',
  appletv:       'apple.com',
  chatgpt:       'openai.com',
  openai:        'openai.com',
  microsoft:     'microsoft.com',
  microsoft365:  'microsoft.com',
  office365:     'office.com',
  dropbox:       'dropbox.com',
  twitch:        'twitch.tv',
  discord:       'discord.com',
  slack:         'slack.com',
  zoom:          'zoom.us',
  adobe:         'adobe.com',
  figma:         'figma.com',
  github:        'github.com',
  notion:        'notion.so',
  canva:         'canva.com',
  duolingo:      'duolingo.com',
  paramount:     'paramountplus.com',
  peacock:       'peacocktv.com',
  crunchyroll:   'crunchyroll.com',
  dazn:          'dazn.com',
  mubi:          'mubi.com',
};

function getServiceStyle(identifier: string): { bg: string; initial: string } {
  const slug = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (SERVICE_STYLES[slug]) return SERVICE_STYLES[slug];
  for (const key of Object.keys(SERVICE_STYLES)) {
    if (slug.includes(key) || key.includes(slug)) return SERVICE_STYLES[key];
  }
  const colorIndex = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_COLORS.length;
  return { bg: FALLBACK_COLORS[colorIndex], initial: identifier.charAt(0).toUpperCase() };
}

function getServiceLogoUrl(identifier: string): string | null {
  const slug = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain = SERVICE_LOGOS[slug] ?? Object.entries(SERVICE_LOGOS).find(([k]) => slug.includes(k) || k.includes(slug))?.[1];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

/** Renders the service logo with two-tier fallback:
 *  1. Clearbit logo (high quality)
 *  2. Google Favicon (always available)
 *  3. Colored initial badge
 */
function ServiceLogo({ identifier, name }: { identifier: string; name: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0=clearbit 1=google 2=fallback
  const logoUrl = getServiceLogoUrl(identifier);
  const style = getServiceStyle(identifier);

  // If we have no known domain at all, go straight to badge
  if (!logoUrl && step === 0) {
    return (
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${style.bg}`}>
        {style.initial}
      </div>
    );
  }

  const slug = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain =
    SERVICE_LOGOS[slug] ??
    Object.entries(SERVICE_LOGOS).find(([k]) => slug.includes(k) || k.includes(slug))?.[1] ??
    '';

  const src =
    step === 0 && logoUrl
      ? logoUrl
      : step === 1 && domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : null;

  if (src) {
    return (
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-gray-100 flex-shrink-0">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setStep((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : 2))}
        />
      </div>
    );
  }

  // Final fallback: colored initial badge
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${style.bg}`}>
      {style.initial}
    </div>
  );
}

interface DashboardProps {
  onNavigate: (view: View, subscription?: Subscription) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

// Translations
const translations = {
  en: {
    overview: 'Overview',
    search: 'Search shared plans...',
    dashboard: 'Dashboard',
    subscriptions: 'Subscriptions',
    members: 'Members',
    payments: 'Payments',
    settings: 'Settings',
    inviteFriend: 'Invite Friend',
    helpCenter: 'Help Center',
    activeSubscriptions: 'Active Subscriptions',
    manageSubscriptions: 'Manage your shared subscription plans',
    addSubscription: 'Add Subscription',
    screens: 'Screens',
    yourShare: 'YOUR SHARE:',
    billingCycle: 'Billing Cycle',
    complete: 'complete',
    noSubscriptions: 'No Active Subscriptions',
    noSubscriptionsDesc: 'Start by adding your first shared subscription plan',
    getStarted: 'Get Started',
  },
  es: {
    overview: 'Resumen',
    search: 'Buscar planes compartidos...',
    dashboard: 'Panel',
    subscriptions: 'Suscripciones',
    members: 'Miembros',
    payments: 'Pagos',
    settings: 'Configuración',
    inviteFriend: 'Invitar Amigo',
    helpCenter: 'Centro de Ayuda',
    activeSubscriptions: 'Suscripciones Activas',
    manageSubscriptions: 'Gestiona tus planes de suscripción compartidos',
    addSubscription: 'Añadir Suscripción',
    screens: 'Pantallas',
    yourShare: 'TU PARTE:',
    billingCycle: 'Ciclo de Facturación',
    complete: 'completado',
    noSubscriptions: 'Sin Suscripciones Activas',
    noSubscriptionsDesc: 'Comienza añadiendo tu primer plan de suscripción compartido',
    getStarted: 'Comenzar',
  }
};

export function Dashboard({ onNavigate, language, onLanguageChange }: DashboardProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profile, subs] = await Promise.all([
          getCurrentProfile(),
          getUserSubscriptions()
        ]);
        
        if (subs) {
          // Transform database subscriptions to match UI format
          const transformedSubs = await Promise.all(subs.map(async (sub: any) => {
            const members = await getSubscriptionMembers(sub.id);
            const memberCount = members?.length || 0;
            const userMember = members?.find((m: any) => m.user_id === profile?.id);
            
            return {
              id: sub.id,
              name: sub.name,
              logo: sub.logo || sub.name.charAt(0).toUpperCase(),
              price: sub.price,
              billingCycle: sub.billing_cycle,
              yourShare: userMember?.amount || 0,
              savings: 0,
              members: members?.map((m: any) => ({
                id: m.id,
                name: m.profile?.full_name || 'User',
                email: m.profile?.email || '',
                avatar: m.profile?.full_name?.charAt(0).toUpperCase() || 'U',
                amount: m.amount,
                status: 'paid' as const
              })) || [],
              billingProgress: 0,
              nextRenewal: sub.next_renewal || 'N/A',
              paymentMethod: sub.payment_method || 'Not set',
              totalMembers: sub.total_members || memberCount,
              isActive: sub.is_active
            };
          }));
          
          setSubscriptions(transformedSubs);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search state — controlled here, passed to Navbar
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!window.confirm('¿Eliminar esta suscripción? Esta acción no se puede deshacer.')) return;
    try {
      setDeletingId(subId);
      await deleteSubscription(subId);
      setSubscriptions(prev => prev.filter(s => s.id !== subId));
    } catch (err) {
      console.error('Error deleting subscription:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter: active only + name matches search query
  const activeSubscriptions = subscriptions.filter(sub => {
    if (!sub.isActive) return false;
    if (!searchTerm.trim()) return true;
    return sub.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onNavigate={onNavigate}
        currentView="dashboard"
        language={language}
        onLanguageChange={onLanguageChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Subscriptions */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{translations[language].activeSubscriptions}</h3>
                <p className="text-gray-600 mt-1">
                  {searchTerm.trim()
                    ? language === 'en'
                      ? `${activeSubscriptions.length} result${activeSubscriptions.length !== 1 ? 's' : ''} for "${searchTerm}"`
                      : `${activeSubscriptions.length} resultado${activeSubscriptions.length !== 1 ? 's' : ''} para "${searchTerm}"`
                    : translations[language].manageSubscriptions}
                </p>
              </div>
              <button 
                onClick={() => onNavigate('add')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {translations[language].addSubscription}
              </button>
            </div>

            {loading ? (
              /* ── Skeleton loader ── */
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-xl p-6 border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                      {/* Logo placeholder */}
                      <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/6" />
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gray-200 h-2 rounded-full animate-pulse w-2/5" />
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-4">
                      {[1, 2, 3].map((a) => (
                        <div key={a} className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="w-10 h-10 text-gray-400" />
                </div>
                {searchTerm.trim() ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {language === 'en' ? 'No results found' : 'Sin resultados'}
                    </h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                      {language === 'en'
                        ? `No subscriptions match "${searchTerm}"`
                        : `Ninguna suscripción coincide con "${searchTerm}"`}
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      {language === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{translations[language].noSubscriptions}</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">{translations[language].noSubscriptionsDesc}</p>
                    <button
                      onClick={() => onNavigate('add')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                    >
                      {translations[language].getStarted}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {activeSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onNavigate('details', sub)}
                    className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative ${
                      deletingId === sub.id ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <ServiceLogo identifier={sub.logo || sub.name} name={sub.name} />
                        <div>
                          <div className="font-semibold text-gray-900">{sub.name}</div>
                          <div className="text-xs text-gray-500">
                            {sub.totalMembers} {translations[language].screens} • {sub.members.length}+ {language === 'en' ? 'Members' : 'Miembros'}
                          </div>
                        </div>
                      </div>

                      {/* Three-dot menu */}
                      <div className="relative" ref={openMenuId === sub.id ? menuRef : null}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sub.id ? null : sub.id); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === sub.id && (
                          <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44">
                            <button
                              onClick={(e) => handleDelete(e, sub.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              {language === 'en' ? 'Delete subscription' : 'Eliminar suscripción'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{translations[language].yourShare}</div>
                        <div className="text-blue-600 font-semibold">€{sub.yourShare.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">€{sub.price}/{sub.billingCycle}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{translations[language].billingCycle}</span>
                        <span>{sub.billingProgress}% {translations[language].complete}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${sub.billingProgress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {sub.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                          >
                            {member.avatar}
                          </div>
                        ))}
                        {sub.members.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                            +{sub.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}