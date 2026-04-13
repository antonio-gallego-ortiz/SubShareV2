import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SubscriptionDetails } from './components/SubscriptionDetails';
import { AddSubscription } from './components/AddSubscription';
import { Members } from './components/Members';
import { Payments } from './components/Payments';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { supabase } from './lib/supabase';

export type View = 'dashboard' | 'details' | 'add' | 'members' | 'payments' | 'settings';

export interface Subscription {
  id: string;
  name: string;
  logo: string;
  price: number;
  billingCycle: string;
  yourShare: number;
  savings: number;
  members: Member[];
  billingProgress: number;
  nextRenewal?: string;
  paymentMethod?: string;
  totalMembers?: number;
  isActive?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  amount: number;
  status: 'paid' | 'pending' | 'auto-paid';
  isOwner?: boolean;
}

export interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  logout: () => void;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Idioma fijo en español
  const language = 'es';

  // Verificar sesión existente al cargar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user && !error) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleViewChange = (view: View, subscription?: Subscription) => {
    setCurrentView(view);
    if (subscription) {
      setSelectedSubscription(subscription);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setShowRegister(false);
  };

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister} 
          onBackToLogin={handleBackToLogin}
          language={language}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onShowRegister={handleShowRegister}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard onNavigate={handleViewChange} language={language} onLogout={handleLogout} />
      )}
      {currentView === 'details' && selectedSubscription && (
        <SubscriptionDetails 
          subscription={selectedSubscription} 
          onNavigate={handleViewChange}
          language={language}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'add' && (
        <AddSubscription onNavigate={handleViewChange} language={language} onLogout={handleLogout} />
      )}
      {currentView === 'members' && (
        <Members onNavigate={handleViewChange} language={language} onLogout={handleLogout} />
      )}
      {currentView === 'payments' && (
        <Payments onNavigate={handleViewChange} language={language} onLogout={handleLogout} />
      )}
      {currentView === 'settings' && (
        <Settings onNavigate={handleViewChange} language={language} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;