import { useState } from 'react';
import { Search, UserPlus, Calendar, Trash2, Info, ShieldCheck, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import type { View } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { validateEmailExists, getProfileByEmail } from '../lib/emailService';
import { createSubscriptionWithMembers } from '../lib/subscriptionService';

interface AddSubscriptionProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
}

interface InvitedMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  isOwner: boolean;
  validationStatus?: 'valid' | 'invalid' | 'pending';
  validationMessage?: string;
}

const services = [
  { id: 'netflix', name: 'Netflix', logo: 'NETFLIX', color: 'bg-red-50 border-red-200' },
  { id: 'spotify', name: 'Spotify', logo: '🎵', color: 'bg-green-50 border-green-200' },
  { id: 'disney', name: 'Disney+', logo: '✨', color: 'bg-blue-900/10 border-blue-900/20' },
  { id: 'custom', name: 'Custom', logo: '+', color: 'bg-gray-50 border-gray-200' },
];

export function AddSubscription({ onNavigate, language }: AddSubscriptionProps) {
  const [selectedService, setSelectedService] = useState('netflix');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [price, setPrice] = useState('15.99');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [customName, setCustomName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [members, setMembers] = useState<InvitedMember[]>([
    { id: '1', name: 'John Doe (You)', email: 'john@example.com', initials: 'JD', isOwner: true, validationStatus: 'valid' },
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const totalMembers = members.length;
  const costPerPerson = totalMembers > 0 ? parseFloat(price) / totalMembers : 0;

  const handleAddMember = async () => {
    if (!emailInput.trim()) return;

    // Verificar que no sea un email duplicado
    if (members.some(m => m.email.toLowerCase() === emailInput.trim().toLowerCase())) {
      setValidationError('Este email ya está en la lista');
      setTimeout(() => setValidationError(''), 3000);
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Validar que el email existe en la BD
      const exists = await validateEmailExists(emailInput.trim());

      if (!exists) {
        setValidationError(`El email ${emailInput.trim()} no está registrado en el sistema`);
        setIsValidating(false);
        return;
      }

      // Obtener el perfil para obtener el nombre completo
      const profile = await getProfileByEmail(emailInput.trim());

      const name = profile?.full_name || emailInput.split('@')[0];
      const initials = name.substring(0, 2).toUpperCase();
      const newMember: InvitedMember = {
        id: Date.now().toString(),
        name,
        email: emailInput.trim(),
        initials,
        isOwner: false,
        validationStatus: 'valid',
      };
      setMembers([...members, newMember]);
      setEmailInput('');
      setValidationError('');
    } catch (error) {
      setValidationError('Error al validar el email. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleConfirm = async () => {
    // Validar que hay al menos 2 miembros (owner + al menos 1)
    if (members.length < 2) {
      setValidationError('Debes agregar al menos un miembro a la suscripción');
      return;
    }

    // Validar que todos los miembros son válidos
    const invalidMembers = members.filter(m => m.validationStatus === 'invalid');
    if (invalidMembers.length > 0) {
      setValidationError('Solo puedes guardar la suscripción con miembros válidos');
      return;
    }

    setIsSaving(true);
    try {
      // Obtener el ID del usuario actual (por ahora usamos mock)
      const userId = '1'; // En producción, esto vendría de la sesión de auth

      const subscriptionId = await createSubscriptionWithMembers(
        {
          name: customName || services.find(s => s.id === selectedService)?.name || 'Mi Suscripción',
          logo: selectedService,
          price: parseFloat(price),
          billingCycle: billingCycle === 'monthly' ? 'month' : 'year',
          nextRenewal: new Date(nextPaymentDate),
          memberEmails: members.filter(m => !m.isOwner).map(m => m.email),
        },
        userId
      );

      if (subscriptionId) {
        // Navegar al dashboard
        onNavigate('dashboard');
      } else {
        setValidationError('Error al guardar la suscripción. Intenta de nuevo.');
      }
    } catch (error) {
      setValidationError('Error al guardar la suscripción. Intenta de nuevo.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="font-semibold text-gray-900">SubShare</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  className="pl-4 pr-4 py-1.5 border border-gray-200 rounded-lg bg-gray-50 w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-4 -mb-4">
                Subscriptions
              </button>
              
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <NotificationPanel language={language} />
                <div 
                  onClick={() => onNavigate('settings')}
                  className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium cursor-pointer hover:bg-orange-200 transition-colors"
                >
                  U
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add New Subscription</h1>
              <p className="text-gray-600">Set up your shared plan and invite members to split the bill effortlessly.</p>
            </div>

            {/* Select Service */}
            

            {/* Subscription Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Subscription Details</h2>
              
              {/* Custom Name Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${services.find(s => s.id === selectedService)?.name || 'My Subscription'} Family Plan`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your subscription a custom name to identify it easily
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        billingCycle === 'annual'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Annual
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Payment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Invite Members */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Invite Members</h2>
                <span className="text-sm text-blue-600 font-medium">Auto-Split Enabled</span>
              </div>

              {validationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{validationError}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-6">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  placeholder="Ingresa un email registrado en el sistema"
                  disabled={isValidating}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleAddMember}
                  disabled={isValidating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  {isValidating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isValidating ? 'Validando...' : 'Agregar'}
                </button>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    member.validationStatus === 'invalid' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.validationMessage && (
                          <div className="text-xs text-red-600 mt-1">{member.validationMessage}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.isOwner ? (
                        <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded">
                          OWNER
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {member.validationStatus === 'valid' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {member.validationStatus === 'invalid' && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                  💵
                </div>
                <h3 className="font-semibold">Split Summary</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <span className="text-blue-100">Total Amount</span>
                  <span className="font-semibold">€{parseFloat(price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <span className="text-blue-100">Total Members</span>
                  <span className="font-semibold">{totalMembers} People</span>
                </div>
                <div className="pt-2">
                  <div className="text-blue-100 text-sm mb-2">Cost per Person</div>
                  <div className="text-3xl font-bold">
                    €{costPerPerson.toFixed(2)}
                    <span className="text-base font-normal text-blue-100"> / month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-100">
                    Members will receive an invitation email to join the split and set up their payment method.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={isSaving || members.length < 2}
                className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors mb-3 flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Confirmar & Guardar'
                )}
              </button>

              <button className="w-full border border-white/30 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors">
                Save as Draft
              </button>
            </div>

            {/* Pro Tip */}
            
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Your payment data is encrypted and secure.</span>
          </div>
          <div className="flex gap-6">
            <button className="hover:text-gray-700">Help Center</button>
            <button className="hover:text-gray-700">Terms of Service</button>
            <button className="hover:text-gray-700">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
}