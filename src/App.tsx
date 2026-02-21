import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SubscriptionDetails } from './components/SubscriptionDetails';
import { AddSubscription } from './components/AddSubscription';
import { Members } from './components/Members';
import { Payments } from './components/Payments';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Register } from './components/Register';
import AcceptInvitation from './components/AcceptInvitation';
import { signOut } from './lib/supabaseApi';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('es');
  const [inviteToken, setInviteToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });

  // After login, check if there was a pending invite stored in sessionStorage
  useEffect(() => {
    if (isLoggedIn) {
      const stored = sessionStorage.getItem('pendingInviteToken');
      if (stored) {
        sessionStorage.removeItem('pendingInviteToken');
        setInviteToken(stored);
      }
    }
  }, [isLoggedIn]);

  const clearInviteToken = () => {
    setInviteToken(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

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
    try {
      await signOut();
      setIsLoggedIn(false);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // ── Invitation landing page — shown even before login ──────────────────────
  if (inviteToken) {
    return (
      <AcceptInvitation
        token={inviteToken}
        isLoggedIn={isLoggedIn}
        onAccepted={() => { clearInviteToken(); setCurrentView('dashboard'); }}
        onDeclined={() => { clearInviteToken(); }}
        onNeedLogin={() => { /* token is stored in sessionStorage by AcceptInvitation */ setShowRegister(false); }}
      />
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister} 
          onBackToLogin={handleBackToLogin}
          language={language} 
          onLanguageChange={setLanguage} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onShowRegister={handleShowRegister}
        language={language} 
        onLanguageChange={setLanguage} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard onNavigate={handleViewChange} language={language} onLanguageChange={setLanguage} />
      )}
      {currentView === 'details' && selectedSubscription && (
        <SubscriptionDetails 
          subscription={selectedSubscription} 
          onNavigate={handleViewChange}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      {currentView === 'add' && (
        <AddSubscription onNavigate={handleViewChange} language={language} onLanguageChange={setLanguage} />
      )}
      {currentView === 'members' && (
        <Members onNavigate={handleViewChange} language={language} onLanguageChange={setLanguage} />
      )}
      {currentView === 'payments' && (
        <Payments onNavigate={handleViewChange} language={language} onLanguageChange={setLanguage} />
      )}
      {currentView === 'settings' && (
        <Settings onNavigate={handleViewChange} language={language} onLanguageChange={setLanguage} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;