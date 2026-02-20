import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Volume2, CheckCircle } from 'lucide-react';
import logo from 'figma:asset/19c0aca0abb708d38d652971739de366b369956a.png';

interface RegisterProps {
  onRegister: () => void;
  onBackToLogin: () => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

const translations = {
  en: {
    createAccount: 'Create Account',
    signUp: 'Join SubShare and start managing subscriptions',
    fullName: 'FULL NAME',
    emailAddress: 'EMAIL ADDRESS',
    password: 'PASSWORD',
    confirmPassword: 'CONFIRM PASSWORD',
    register: 'CREATE ACCOUNT',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    namePlaceholder: 'John Doe',
    emailPlaceholder: 'john.doe@example.com',
    accountCreated: 'Account ready to be created',
    dismiss: 'DISMISS',
    tagline: 'Management for Everyone',
    passwordRequirements: 'At least 8 characters',
    agreeToTerms: 'By creating an account, you agree to our Terms & Privacy Policy'
  },
  es: {
    createAccount: 'Crear Cuenta',
    signUp: 'Únete a SubShare y comienza a gestionar suscripciones',
    fullName: 'NOMBRE COMPLETO',
    emailAddress: 'CORREO ELECTRÓNICO',
    password: 'CONTRASEÑA',
    confirmPassword: 'CONFIRMAR CONTRASEÑA',
    register: 'CREAR CUENTA',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signIn: 'Iniciar Sesión',
    namePlaceholder: 'Juan Pérez',
    emailPlaceholder: 'juan.perez@ejemplo.com',
    accountCreated: 'Cuenta lista para ser creada',
    dismiss: 'DESCARTAR',
    tagline: 'Gestión para Todos',
    passwordRequirements: 'Mínimo 8 caracteres',
    agreeToTerms: 'Al crear una cuenta, aceptas nuestros Términos y Política de Privacidad'
  }
};

export function Register({ onRegister, onBackToLogin, language, onLanguageChange }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Dark mode theme
  if (isDarkMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Register Card */}
        <div className="w-full max-w-md relative">
          {/* Accessibility and Language Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => onLanguageChange(language === 'en' ? 'es' : 'en')}
              className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium hover:bg-slate-700/50 transition-all"
            >
              {language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
            </button>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="SubShare Logo" 
              className="w-48 mx-auto"
            />
          </div>

          {/* Register Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t.createAccount}</h2>
              <p className="text-slate-400 text-sm">{t.signUp}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 tracking-wider">
                  {t.fullName}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 tracking-wider">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 tracking-wider">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.passwordRequirements}</p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 tracking-wider">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                {t.register}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Terms */}
              <p className="text-xs text-slate-500 text-center">{t.agreeToTerms}</p>

              {/* Back to Login */}
              <div className="text-center text-sm pt-2">
                <span className="text-slate-400">{t.alreadyHaveAccount} </span>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {t.signIn}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Light mode theme
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Register Card */}
      <div className="w-full max-w-md">
        {/* Accessibility and Language Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => onLanguageChange(language === 'en' ? 'es' : 'en')}
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
          >
            {language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="SubShare Logo" 
            className="w-48 mx-auto"
          />
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.createAccount}</h2>
            <p className="text-gray-600 text-sm">{t.signUp}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider">
                {t.fullName}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-900 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">{t.passwordRequirements}</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-900 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {t.register}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">{t.agreeToTerms}</p>

            {/* Back to Login */}
            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">{t.alreadyHaveAccount} </span>
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {t.signIn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}