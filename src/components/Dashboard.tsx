import { useEffect, useState } from 'react';
import { Bell, Search, Settings, CreditCard, Users, MoreVertical, ArrowRight, Plus } from 'lucide-react';
import type { View, Subscription } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { Sidebar } from './Sidebar';
import { getCurrentUserProfile, getCurrentUserName, getUserInitials } from '../lib/userService';
import { getUserSubscriptions } from '../lib/subscriptionService';

interface DashboardProps {
  onNavigate: (view: View, subscription?: Subscription) => void;
  language: 'en' | 'es';
}

// Translations - Solo español
const translations = {
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
  noSubscriptions: 'Sin suscripciones',
  noSubscriptionsDesc: 'Aún no perteneces a ninguna suscripción. ¡Crea una nueva o espera a una invitación!',
  loading: 'Cargando...',
};

export function Dashboard({ onNavigate, language }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState('Usuario');
  const [userInitials, setUserInitials] = useState('U');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Cargar perfil del usuario
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);

        // Cargar nombre
        const name = await getCurrentUserName();
        setUserName(name);

        // Cargar iniciales
        const initials = await getUserInitials();
        setUserInitials(initials);

        // Cargar suscripciones
        const userSubs = await getUserSubscriptions();
        // Mapear datos de Supabase al formato de Subscription
        const formattedSubs = userSubs.map((item: any) => ({
          ...item.subscription,
          yourShare: item.amount,
          isOwner: item.is_owner,
          members: [],
        }));
        setSubscriptions(formattedSubs);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Filtrar solo suscripciones activas
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive === true);
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView="dashboard" onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{translations.overview}</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={translations.search}
                  className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <NotificationPanel />
              <div 
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {userInitials}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Active Subscriptions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{translations.activeSubscriptions}</h3>
                <p className="text-gray-600 mt-1">{translations.manageSubscriptions}</p>
              </div>
              <button 
                onClick={() => onNavigate('add')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {translations.addSubscription}
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">{translations.loading}</p>
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 border-dashed text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{translations.noSubscriptions}</h3>
                <p className="text-gray-600 mb-6">{translations.noSubscriptionsDesc}</p>
                <button 
                  onClick={() => onNavigate('add')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {translations.addSubscription}
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
                          <div className="text-xs text-gray-500">{sub.totalMembers} {translations.screens} • {sub.members.length}+ Miembros</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{translations.yourShare}</div>
                        <div className="text-blue-600 font-semibold">{sub.yourShare?.toFixed(2) || '0.00'}€</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{sub.price}€/{sub.billing_cycle}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{translations.billingCycle}</span>
                        <span>0% {translations.complete}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}