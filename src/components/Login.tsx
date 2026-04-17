import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, HelpCircle, CheckCircle, X, Loader } from 'lucide-react';
import { signInWithEmail } from '../lib/userService';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
  onShowRegister: () => void;
  language: 'en' | 'es';
}

const translations = {
  es: {
    welcomeBack: 'Bienvenido de Nuevo',
    signIn: 'Por favor inicia sesión en tu cuenta',
    emailAddress: 'CORREO ELECTRÓNICO',
    password: 'CONTRASEÑA',
    login: 'INICIAR SESIÓN',
    forgotPassword: '¿Olvidaste tu Contraseña?',
    createAccount: 'Crear Cuenta',
    systemReady: 'Sistema listo para acceso seguro',
    dismiss: 'DESCARTAR',
    needHelp: '¿Necesitas Ayuda?',
    emailPlaceholder: 'alex.m@ejemplo.com',
    tagline: 'Gestión para Todos',
    errorInvalidCredentials: 'Email o contraseña incorrectos',
    errorEmptyFields: 'Por favor completa todos los campos',
    logging: 'Iniciando sesión...',
    resetPassword: 'Recuperar Contraseña',
    resetPasswordDesc: 'Te enviaremos un enlace para recuperar tu contraseña',
    sendEmail: 'Enviar',
    resetEmailSent: 'Revisa tu correo para el enlace de recuperación',
    resetEmailError: 'Error al enviar el correo',
    cancel: 'Cancelar',
  }
};

export function Login({ onLogin, onShowRegister, language }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecurityAlert, setShowSecurityAlert] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const t = translations.es;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t.errorEmptyFields);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      
      if (result.success && result.user) {
        onLogin();
      } else {
        setError(result.error || t.errorInvalidCredentials);
      }
    } catch (err: any) {
      setError(err?.message ||  t.errorInvalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');

    if (!resetEmail) {
      setResetMessage(language === 'es' ? 'Por favor ingresa tu email' : 'Please enter your email');
      return;
    }

    setResetLoading(true);
    try {
      // Using Supabase password reset
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      
      if (error) {
        setResetMessage(t.resetEmailError);
      } else {
        setResetMessage(t.resetEmailSent);
        setTimeout(() => {
          setShowResetPassword(false);
          setResetEmail('');
          setResetMessage('');
        }, 3000);
      }
    } catch (err) {
      setResetMessage(t.resetEmailError);
    } finally {
      setResetLoading(false);
    }
  };

  // Light mode theme
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-lg">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="/11.svg"
            alt="SubShare Logo"
            className="w-48 mx-auto"
          />
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.welcomeBack}</h2>
            <p className="text-gray-600 text-sm">{t.signIn}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider">
                {t.emailAddress}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-900 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-900 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {t.login}
              <LogIn className="w-5 h-5" />
            </button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t.forgotPassword}
              </button>
              <button
                type="button"
                onClick={onShowRegister}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t.createAccount}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.resetPassword}</h2>
            <p className="text-gray-600 text-sm mb-6">{t.resetPasswordDesc}</p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Success/Error Message */}
              {resetMessage && (
                <div className={`p-4 rounded-lg ${
                  resetMessage === t.resetEmailSent
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <p className="text-sm">{resetMessage}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-900 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {resetLoading ? '...' : t.sendEmail}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}