import { CreditCard, Settings, Users } from 'lucide-react';
import type { View } from '../App';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const translations = {
  dashboard: 'Panel',
  payments: 'Pagos',
  settings: 'Configuración',
  inviteFriend: 'Invitar Amigo',
  helpCenter: 'Centro de Ayuda',
};

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <div className="font-semibold text-gray-900">SubShare</div>
          </div>
        </div>
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
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-3">
          <Users className="w-4 h-4" />
          {translations.inviteFriend}
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">?</div>
          {translations.helpCenter}
        </button>
      </div>
    </div>
  );
}
