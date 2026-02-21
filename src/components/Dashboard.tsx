import { CreditCard, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { View, Subscription } from '../App';
import { Navbar } from './Navbar';
import { getCurrentProfile, getUserSubscriptions, getSubscriptionMembers } from '../lib/supabaseApi';

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

  // Filtrar solo suscripciones activas
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive === true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentView="dashboard" language={language} onLanguageChange={onLanguageChange} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Subscriptions */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{translations[language].activeSubscriptions}</h3>
                <p className="text-gray-600 mt-1">{translations[language].manageSubscriptions}</p>
              </div>
              <button 
                onClick={() => onNavigate('add')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {translations[language].addSubscription}
              </button>
            </div>

            {activeSubscriptions.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{translations[language].noSubscriptions}</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">{translations[language].noSubscriptionsDesc}</p>
                <button 
                  onClick={() => onNavigate('add')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  {translations[language].getStarted}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {activeSubscriptions.map((sub, index) => (
                <div 
                  key={sub.id} 
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate('details', sub)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-red-600' : index === 1 ? 'bg-green-600' : 'bg-red-700'
                        }`}
                      >
                        {sub.logo}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{sub.name}</div>
                        <div className="text-xs text-gray-500">{sub.totalMembers} {translations[language].screens} • {sub.members.length}+ {language === 'en' ? 'Members' : 'Miembros'}</div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      
                    </button>
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{translations[language].yourShare}</div>
                      <div className="text-blue-600 font-semibold">${sub.yourShare.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${sub.price}/{sub.billingCycle}</div>
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
                        style={{ width: `${sub.billingProgress}%` }}
                      ></div>
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