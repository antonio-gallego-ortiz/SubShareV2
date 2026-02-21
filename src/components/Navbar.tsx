import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { View } from '../App';
import { LanguageSelector } from './LanguageSelector';
import { NotificationPanel } from './NotificationPanel';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  onNavigate: (view: View) => void;
  currentView: View;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
  /** Controlled search value — provided by the parent view when search is functional */
  searchTerm?: string;
  /** Called on every keystroke when the parent wants to handle filtering */
  onSearchChange?: (term: string) => void;
}

const navLabels = {
  en: {
    dashboard: 'Dashboard',
    payments: 'Payments',
    settings: 'Settings',
    search: 'Search subscriptions...',
  },
  es: {
    dashboard: 'Panel',
    payments: 'Pagos',
    settings: 'Configuración',
    search: 'Buscar suscripciones...',
  },
};

export function Navbar({
  onNavigate,
  currentView,
  language,
  onLanguageChange,
  searchTerm,
  onSearchChange,
}: NavbarProps) {
  const [fullName, setFullName] = useState('');
  // Local search state used when the parent does NOT provide controlled props
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setFullName(meta.full_name || session.user.email?.split('@')[0] || '');
      }
    });
  }, []);

  const t = navLabels[language];

  // Use controlled value when parent provides it, otherwise local state
  const isControlled = onSearchChange !== undefined;
  const inputValue = isControlled ? (searchTerm ?? '') : localSearch;
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlled) {
      onSearchChange!(e.target.value);
    } else {
      setLocalSearch(e.target.value);
    }
  };

  const navItems: { view: View; label: string }[] = [
    { view: 'dashboard', label: t.dashboard },
    { view: 'payments', label: t.payments },
    { view: 'settings', label: t.settings },
  ];

  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-semibold text-gray-900 text-lg">SubShare</span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleSearch}
                  placeholder={t.search}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {inputValue && (
                  <button
                    onClick={() => isControlled ? onSearchChange!('') : setLocalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
              <NotificationPanel language={language} />
              <div
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {fullName || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {navItems.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === view
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
