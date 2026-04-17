import { useEffect, useState } from 'react';
import { Bell, Search, Settings, CreditCard, Users, MoreVertical, ArrowRight, Plus, Trash2, LogOut } from 'lucide-react';
import type { View, Subscription } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { Sidebar } from './Sidebar';
import { getCurrentUserProfile, getCurrentUserName, getUserInitials } from '../lib/userService';
import { getUserSubscriptions, deleteSubscription, leaveSubscription } from '../lib/subscriptionService';
import { getSubscriptionLogo, getSubscriptionColor } from '../lib/subscriptionHelper';

interface DashboardProps {
  onNavigate: (view: View, subscription?: Subscription) => void;
  language: 'en' | 'es';
  onLogout?: () => void;
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

export function Dashboard({ onNavigate, language, onLogout }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState('Usuario');
  const [userInitials, setUserInitials] = useState('U');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    try {
      console.log('Dashboard: Cargando suscripciones...');
      // Cargar perfil del usuario
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      console.log('Perfil cargado:', profile);

      // Cargar nombre
      const name = await getCurrentUserName();
      setUserName(name);
      console.log('Nombre cargado:', name);

      // Cargar iniciales
      const initials = await getUserInitials();
      setUserInitials(initials);
      console.log('Iniciales cargadas:', initials);

      // Cargar suscripciones
      const userSubs = await getUserSubscriptions();
      console.log('Suscripciones obtenidas de BD:', userSubs);
      // Los datos ya vienen mapeados de la función RPC
      const formattedSubs = userSubs.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        logo: sub.logo,
        price: sub.price,
        isActive: sub.isActive,
        totalMembers: sub.totalMembers,
        billingCycle: sub.billingCycle,
        nextRenewal: sub.nextRenewal,
        ownerId: sub.ownerId,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        payment_method: sub.payment_method,
        subscription_email: sub.subscription_email,
        subscription_password: sub.subscription_password,
        yourShare: sub.yourShare,
        isOwner: sub.isOwner,
        members: [],
      }));
      console.log('Suscripciones formateadas:', formattedSubs);
      setSubscriptions(formattedSubs);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string, subscriptionName: string) => {
    // Solicitar confirmación
    if (!window.confirm(`¿Está seguro de que desea eliminar la suscripción "${subscriptionName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const success = await deleteSubscription(subscriptionId);
      if (success) {
        alert('Suscripción eliminada exitosamente');
        setOpenMenuId(null);
        // Remover la suscripción de la lista
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      } else {
        alert('Error al eliminar la suscripción. Solo el dueño puede eliminarla.');
      }
    } catch (error) {
      console.error('Error deleteting subscription:', error);
      alert('Error al eliminar la suscripción');
    }
  };

  const handleLeaveSubscription = async (subscriptionId: string, subscriptionName: string) => {
    // Solicitar confirmación
    if (!window.confirm(`¿Está seguro de que desea salirse de la suscripción "${subscriptionName}"?`)) {
      return;
    }

    try {
      const success = await leaveSubscription(subscriptionId);
      if (success) {
        alert('Has salido de la suscripción exitosamente');
        setOpenMenuId(null);
        // Remover la suscripción de la lista
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      } else {
        alert('Error al salirse de la suscripción.');
      }
    } catch (error) {
      console.error('Error leaving subscription:', error);
      alert('Error al salirse de la suscripción');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadSubscriptions();
  }, [refreshTrigger]);

  // Exponer función de refresco a través del window para que AddSubscription pueda llamarla
  useEffect(() => {
    (window as any).refreshDashboard = () => {
      console.log('refreshDashboard llamado');
      setRefreshTrigger(prev => prev + 1);
    };
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, []);

  // Cerrar menú cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Filtrar solo suscripciones activas
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive === true || sub.is_active === true);
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center justify-end gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={translations.search}
                  className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <NotificationPanel onNavigate={onNavigate} />
              <div 
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
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
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1" onClick={() => onNavigate('details', sub)}>
                        <div 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-white border border-gray-200 overflow-hidden`}
                        >
                          {getSubscriptionLogo(sub.name) ? (
                            <img 
                              src={getSubscriptionLogo(sub.name)} 
                              alt={sub.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-gray-900 font-bold text-lg">{sub.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{sub.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {sub.totalMembers} {translations.screens} • {(sub.totalMembers || 1)} Miembros
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-4" onClick={() => onNavigate('details', sub)}>
                      <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">{translations.yourShare}</div>
                        <div className="text-2xl font-bold text-blue-600">€{sub.yourShare?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500">Total</div>
                        <div className="text-xl font-bold text-gray-900">€{sub.price}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100" onClick={() => onNavigate('details', sub)}>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="font-medium">{translations.billingCycle}</span>
                        <span className="text-green-600 font-medium">Activo</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: '60%' }}
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