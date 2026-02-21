import { useState, useEffect } from 'react';
import { Bell, Save, User, Lock, CreditCard as CreditCardIcon, Globe, Shield, Mail, Smartphone, LogOut, Eye } from 'lucide-react';
import type { View } from '../App';
import { Navbar } from './Navbar';
import { getCurrentProfile, getCurrentUser, updateProfile } from '../lib/supabaseApi';

interface SettingsProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
  onLogout: () => void;
}

const translations = {
  en: {
    title: 'Settings',
    subtitle: 'Manage your account preferences and security',
    search: 'Search settings...',
    saveChanges: 'Save Changes',
    profile: 'Profile Information',
    security: 'Security',
    payment: 'Payment Methods',
    notifications: 'Notifications',
    preferences: 'Preferences',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    timezone: 'Timezone',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    twoFactor: 'Two-Factor Authentication',
    twoFactorDesc: 'Add an extra layer of security to your account',
    enable: 'Enable',
    enabled: 'Enabled',
    defaultCard: 'Default Card',
    addPaymentMethod: 'Add Payment Method',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive email updates about your subscriptions',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Get notified about upcoming payments',
    paymentReminders: 'Payment Reminders',
    paymentRemindersDesc: 'Remind me 3 days before payment is due',
    currency: 'Currency',
    language: 'Language',
    darkMode: 'Dark Mode',
    autoRenewals: 'Auto-Renewals',
    autoRenewalsDesc: 'Automatically renew subscriptions',
    dangerZone: 'Danger Zone',
    deactivateAccount: 'Deactivate Account',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',
    changePhoto: 'Change Photo',
    remove: 'Remove',
    deactivateTitle: 'Deactivate Account',
    deactivateMessage: 'Are you sure you want to deactivate your account? You can reactivate it anytime by logging in again.',
    deleteTitle: 'Delete Account',
    deleteMessage: 'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    typeToConfirm: 'Type "DELETE" to confirm',
    contrastMode: 'Contrast Mode',
    viewPassword: 'View Account Password',
    verifyPasswordTitle: 'Verify Your Password',
    verifyPasswordMessage: 'Enter your password to view your account password',
    enterPassword: 'Enter password',
    verify: 'Verify',
    yourPassword: 'Your Password',
    incorrectPassword: 'Incorrect password',
    addCardTitle: 'Add Payment Method',
    cardNumber: 'Card Number',
    cardHolder: 'Cardholder Name',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    addCard: 'Add Card',
    logout: 'Logout',
    logoutDesc: 'Sign out of your account'
  },
  es: {
    title: 'Configuración',
    subtitle: 'Administra tus preferencias de cuenta y seguridad',
    search: 'Buscar configuración...',
    saveChanges: 'Guardar Cambios',
    profile: 'Información del Perfil',
    security: 'Seguridad',
    payment: 'Métodos de Pago',
    notifications: 'Notificaciones',
    preferences: 'Preferencias',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    phone: 'Número de Teléfono',
    timezone: 'Zona Horaria',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    twoFactor: 'Autenticación de Dos Factores',
    twoFactorDesc: 'Agrega una capa adicional de seguridad a tu cuenta',
    enable: 'Habilitar',
    enabled: 'Habilitado',
    defaultCard: 'Tarjeta Predeterminada',
    addPaymentMethod: 'Agregar Método de Pago',
    emailNotifications: 'Notificaciones por Email',
    emailNotificationsDesc: 'Recibe actualizaciones por email sobre tus suscripciones',
    pushNotifications: 'Notificaciones Push',
    pushNotificationsDesc: 'Recibe notificaciones sobre próximos pagos',
    paymentReminders: 'Recordatorios de Pago',
    paymentRemindersDesc: 'Recordarme 3 días antes del vencimiento del pago',
    currency: 'Moneda',
    language: 'Idioma',
    darkMode: 'Modo Oscuro',
    autoRenewals: 'Renovaciones Automáticas',
    autoRenewalsDesc: 'Renovar automáticamente las suscripciones',
    dangerZone: 'Zona de Peligro',
    deactivateAccount: 'Desactivar Cuenta',
    deleteAccount: 'Eliminar Cuenta',
    deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos los datos',
    changePhoto: 'Cambiar Foto',
    remove: 'Eliminar',
    deactivateTitle: 'Desactivar Cuenta',
    deactivateMessage: '¿Estás seguro de que quieres desactivar tu cuenta? Puedes reactivarla en cualquier momento iniciando sesión nuevamente.',
    deleteTitle: 'Eliminar Cuenta',
    deleteMessage: '¿Estás seguro de que quieres eliminar permanentemente tu cuenta? Esta acción no se puede deshacer y todos tus datos se perderán.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    typeToConfirm: 'Escribe "ELIMINAR" para confirmar',
    contrastMode: 'Modo de Contraste',
    viewPassword: 'Ver Contraseña de la Cuenta',
    verifyPasswordTitle: 'Verifica Tu Contraseña',
    verifyPasswordMessage: 'Ingresa tu contraseña para ver la contraseña de tu cuenta',
    enterPassword: 'Ingresa la contraseña',
    verify: 'Verificar',
    yourPassword: 'Tu Contraseña',
    incorrectPassword: 'Contraseña incorrecta',
    addCardTitle: 'Agregar Método de Pago',
    cardNumber: 'Número de Tarjeta',
    cardHolder: 'Nombre del Titular',
    expiryDate: 'Fecha de Vencimiento',
    cvv: 'CVV',
    addCard: 'Agregar Tarjeta',
    logout: 'Cerrar Sesión',
    logoutDesc: 'Salir de tu cuenta'
  }
};

export function Settings({ onNavigate, language, onLanguageChange, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'payment' | 'notifications' | 'preferences'>('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoRenewals, setAutoRenewals] = useState(true);
  const [contrastMode, setContrastMode] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showActualPassword, setShowActualPassword] = useState(false);
  const [actualPassword, setActualPassword] = useState('MySecurePass123');
  
  // User data states
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const t = translations[language];

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);

        // Always get auth user for metadata fallback
        const user = await getCurrentUser();
        const meta = user?.user_metadata || {};

        // Try to get full profile from DB
        const profile = await getCurrentProfile();

        // Merge: prefer DB values, fallback to auth metadata
        setUserId(profile?.id || user?.id || '');
        setFullName(profile?.full_name || meta.full_name || '');
        setEmail(profile?.email || user?.email || '');
        setPhone(profile?.phone || meta.phone || '');
        setAvatarUrl(profile?.avatar_url || meta.avatar_url || '');
        const createdAt = profile?.created_at || user?.created_at;
        setJoinedAt(createdAt ? new Date(createdAt).toLocaleDateString() : '');
        setUpdatedAt(profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '');

        // If DB profile has empty fields, auto-update it with auth metadata
        if (profile && user && (!profile.full_name || !profile.email)) {
          try {
            await updateProfile(user.id, {
              full_name: profile.full_name || meta.full_name || '',
              email: profile.email || user.email || '',
              phone: profile.phone || meta.phone || '',
            });
          } catch (e) {
            console.warn('Could not sync metadata to profile:', e);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Last resort: use auth user metadata only
        try {
          const user = await getCurrentUser();
          if (user) {
            const meta = user.user_metadata || {};
            setUserId(user.id || '');
            setFullName(meta.full_name || '');
            setEmail(user.email || '');
            setPhone(meta.phone || '');
            setAvatarUrl(meta.avatar_url || '');
            setJoinedAt(user.created_at ? new Date(user.created_at).toLocaleDateString() : '');
          }
        } catch (e) {
          console.error('Error loading auth user:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const user = await getCurrentUser();
      if (user) {
        await updateProfile(user.id, {
          full_name: fullName,
          email: email,
          phone: phone,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(language === 'en' ? 'Error saving changes' : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = () => {
    // Aquí iría la lógica para desactivar la cuenta
    console.log('Account deactivated');
    setShowDeactivateModal(false);
    // Redirigir al login
    alert(language === 'en' ? 'Account deactivated successfully' : 'Cuenta desactivada exitosamente');
  };

  const handleDeleteAccount = () => {
    const confirmWord = language === 'en' ? 'DELETE' : 'ELIMINAR';
    if (deleteConfirmText === confirmWord) {
      // Aquí iría la lógica para eliminar la cuenta permanentemente
      console.log('Account deleted permanently');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      // Redirigir al login
      alert(language === 'en' ? 'Account deleted successfully' : 'Cuenta eliminada exitosamente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentView="settings" language={language} onLanguageChange={onLanguageChange} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? (language === 'en' ? 'Saving...' : 'Guardando...') : t.saveChanges}
          </button>
          {saveSuccess && (
            <div className="text-sm text-green-600 font-medium">
              {language === 'en' ? '✓ Saved successfully' : '✓ Guardado exitosamente'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t.profile}</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">{t.security}</span>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'payment' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                <span className="font-medium">{t.payment}</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">{t.notifications}</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'preferences' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">{t.preferences}</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.profile}</h2>
                
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-gray-900 truncate">{fullName || (language === 'en' ? 'User' : 'Usuario')}</p>
                    <p className="text-sm text-gray-500 truncate">{email}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      {phone || (language === 'en' ? 'No phone added' : 'Sin teléfono')}
                    </p>
                    {joinedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'en' ? 'Member since' : 'Miembro desde'} {joinedAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* DB Data Summary — all fields from profiles table */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                      {language === 'en' ? 'Account Data (from database)' : 'Datos de la Cuenta (desde la base de datos)'}
                    </h3>
                  </div>
                  {loading ? (
                    <p className="text-sm text-blue-500 animate-pulse">
                      {language === 'en' ? 'Loading data...' : 'Cargando datos...'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t.fullName}</span>
                        <span className="text-gray-900 font-medium">{fullName || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t.email}</span>
                        <span className="text-gray-900 font-medium truncate">{email || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t.phone}</span>
                        <span className="text-gray-900 font-medium">{phone || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {language === 'en' ? 'Member since' : 'Miembro desde'}
                        </span>
                        <span className="text-gray-900 font-medium">{joinedAt || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {language === 'en' ? 'Last updated' : 'Última actualización'}
                        </span>
                        <span className="text-gray-900 font-medium">{updatedAt || '—'}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">User ID</span>
                        <span className="text-gray-500 text-xs font-mono break-all">{userId || '—'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.timezone}</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Central European Time (CET)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.currentPassword}</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.newPassword}</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t.viewPassword}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{t.twoFactor}</div>
                        <div className="text-sm text-gray-600">{t.twoFactorDesc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        twoFactor
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {twoFactor ? t.enabled : t.enable}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.payment}</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Visa ending in 4532</div>
                        <div className="text-sm text-gray-600">Expires 12/2025</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {t.defaultCard}
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Mastercard ending in 8821</div>
                        <div className="text-sm text-gray-600">Expires 08/2024</div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Make Default
                    </button>
                  </div>
                </div>

                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors" onClick={() => setShowAddCardModal(true)}>
                  + {t.addPaymentMethod}
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.notifications}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t.emailNotifications}</div>
                        <div className="text-sm text-gray-600">{t.emailNotificationsDesc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t.pushNotifications}</div>
                        <div className="text-sm text-gray-600">{t.pushNotificationsDesc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t.paymentReminders}</div>
                        <div className="text-sm text-gray-600">{t.paymentRemindersDesc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPaymentReminders(!paymentReminders)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        paymentReminders ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          paymentReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.preferences}</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.currency}</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>EUR - Euro</option>
                        <option>USD - US Dollar</option>
                        <option>GBP - British Pound</option>
                        <option>MXN - Mexican Peso</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.language}</label>
                      <select 
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as 'en' | 'es')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{t.autoRenewals}</div>
                        <div className="text-sm text-gray-600">{t.autoRenewalsDesc}</div>
                      </div>
                      <button
                        onClick={() => setAutoRenewals(!autoRenewals)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoRenewals ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoRenewals ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Section */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t.logout}</div>
                        <div className="text-sm text-gray-600">{t.logoutDesc}</div>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="font-semibold text-red-900 mb-4">{t.dangerZone}</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors" onClick={() => setShowDeactivateModal(true)}>
                      {t.deactivateAccount}
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={() => setShowDeleteModal(true)}>
                      {t.deleteAccount}
                    </button>
                    <p className="text-sm text-red-700">{t.deleteAccountDesc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.deactivateTitle}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.deactivateMessage}</p>
            <div className="flex items-center gap-3 justify-end">
              <button 
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" 
                onClick={() => setShowDeactivateModal(false)}
              >
                {t.cancel}
              </button>
              <button 
                className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium" 
                onClick={handleDeactivateAccount}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.deleteTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.deleteMessage}</p>
            <div className="mb-6">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t.typeToConfirm}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button 
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                {t.cancel}
              </button>
              <button 
                className={`px-5 py-2 rounded-lg transition-colors font-medium ${
                  deleteConfirmText === (language === 'en' ? 'DELETE' : 'ELIMINAR')
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== (language === 'en' ? 'DELETE' : 'ELIMINAR')}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.addCardTitle}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.cardNumber}</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.cardHolder}</label>
                <input
                  type="text"
                  placeholder="ALEX MARTINEZ"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.expiryDate}</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.cvv}</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button 
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" 
                onClick={() => setShowAddCardModal(false)}
              >
                {t.cancel}
              </button>
              <button 
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => {
                  setShowAddCardModal(false);
                  alert(language === 'en' ? 'Card added successfully!' : '¡Tarjeta agregada exitosamente!');
                }}
              >
                {t.addCard}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.verifyPasswordTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.verifyPasswordMessage}</p>
            
            {!showActualPassword ? (
              <>
                <div className="mb-6">
                  <input
                    type="password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder={t.enterPassword}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button 
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" 
                    onClick={() => {
                      setShowPasswordModal(false);
                      setVerifyPassword('');
                      setShowActualPassword(false);
                    }}
                  >
                    {t.cancel}
                  </button>
                  <button 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => {
                      // Simulamos que la contraseña correcta es "password123"
                      if (verifyPassword === 'password123') {
                        setShowActualPassword(true);
                        setVerifyPassword('');
                      } else {
                        alert(t.incorrectPassword);
                      }
                    }}
                  >
                    {t.verify}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">{t.yourPassword}</div>
                  <div className="text-lg font-semibold text-gray-900 font-mono">{actualPassword}</div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" 
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowActualPassword(false);
                      setVerifyPassword('');
                    }}
                  >
                    {t.confirm}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}