import { useEffect, useState } from 'react';
import { CreditCard, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUserName, getUserInitials } from '../lib/userService';
import type { View } from '../App';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
}

const translations = {
  dashboard: 'Panel',
  payments: 'Pagos',
  settings: 'Configuración',
  logout: 'Cerrar Sesión',
};

export function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const [userName, setUserName] = useState('Usuario');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await getCurrentUserName();
        setUserName(name);
        const initials = await getUserInitials();
        setUserInitials(initials);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout?.();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  return (
    <div className="w-56 bg-white flex flex-col">
      <div className="-mt-4 pb-4 pr-4 pl-2 cursor-pointer hover:opacity-80 transition-opacity flex justify-center" onClick={() => onNavigate('dashboard')}>
        <img src={`${import.meta.env.BASE_URL}11.svg`} alt="SubShare" className="h-36 object-contain" />
      </div>

      <nav className="flex-1 p-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
            currentView === 'dashboard'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center font-bold">
            S
          </div>
          {translations.dashboard}
        </button>
        <button
          onClick={() => onNavigate('payments')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
            currentView === 'payments'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          {translations.payments}
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === 'settings'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          {translations.settings}
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-lg mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">Cuenta</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          {translations.logout}
        </button>
      </div>
    </div>
  );
}
