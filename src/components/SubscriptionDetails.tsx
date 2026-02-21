import { ArrowLeft, Edit, UserPlus, Calendar, RefreshCw, Users as UsersIcon, MoreVertical, Send, Info, Eye, EyeOff, Trash2, Save, X as CloseIcon } from 'lucide-react';
import type { View, Subscription, Member } from '../App';
import { Navbar } from './Navbar';
import { useState } from 'react';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

// Initialize with empty members - will be populated from subscription prop or database
const detailedMembers: Member[] = [];

// Initialize with empty renewal history - will be loaded from database
const renewalHistory: any[] = [];

const translations = {
  en: {
    search: 'Search',
    dashboard: 'Dashboard',
    subscriptions: 'Subscriptions',
    settings: 'Settings',
    netflixDetails: 'Netflix Details',
    netflixFamily: 'Netflix Family Plan',
    month: 'month',
    activeSubscription: 'Active Subscription',
    editPlan: 'Edit Plan',
    nextRenewal: 'Next Renewal',
    paymentMethod: 'Payment Method',
    autoRenewal: 'Auto-renewal',
    groupSize: 'Group Size',
    members: 'Members',
    sharedAccountCredentials: 'Shared Account Credentials',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    clickShowDetails: 'Click "Show Details" to view the shared account credentials',
    email: 'Email',
    password: 'Password',
    copy: 'Copy',
    importantNote: 'Important:',
    credentialsWarning: 'Keep these credentials private and only share with authorized family members.',
    familyMembers: 'Family Members',
    seatsFilled: 'Seats Filled',
    member: 'Member',
    fractionAmount: 'Fraction Amount',
    status: 'Status',
    actions: 'Actions',
    paid: 'Paid',
    pending: 'Pending',
    sendReminder: 'Send Reminder',
    removeMember: 'Remove Member',
    renewalHistory: 'Renewal History',
    renewedOn: 'Renewed on',
    completed: 'Completed',
    paymentDetails: 'Payment Details',
    nextBillingCycle: 'Next billing cycle will be automatically processed on',
    cancelSubscription: 'Cancel Subscription',
    viewBillingHistory: 'View Billing History',
    backToDashboard: 'Back to Dashboard',
    editSubscription: 'Edit Subscription',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    subscriptionDetails: 'Subscription Details',
    subscriptionName: 'Subscription Name',
    totalPrice: 'Total Price',
    billingCycle: 'Billing Cycle',
    monthly: 'Monthly',
    annual: 'Annual',
    nextPaymentDate: 'Next Payment Date',
    accountCredentials: 'Account Credentials',
    accountEmail: 'Account Email',
    accountPassword: 'Account Password',
    inviteMembers: 'Invite Members',
    addMember: 'Add Member',
    emailPlaceholder: 'member@example.com',
    costPerPerson: 'Cost per Person',
    noHistory: 'No Renewal History',
    noHistoryDesc: 'Renewal history will appear here once payments are processed'
  },
  es: {
    search: 'Buscar',
    dashboard: 'Panel',
    subscriptions: 'Suscripciones',
    settings: 'Configuración',
    netflixDetails: 'Detalles de Netflix',
    netflixFamily: 'Plan Familiar Netflix',
    month: 'mes',
    activeSubscription: 'Suscripción Activa',
    editPlan: 'Editar Plan',
    nextRenewal: 'Próxima Renovación',
    paymentMethod: 'Método de Pago',
    autoRenewal: 'Renovación automática',
    groupSize: 'Tamaño del Grupo',
    members: 'Miembros',
    sharedAccountCredentials: 'Credenciales de la Cuenta Compartida',
    showDetails: 'Mostrar Detalles',
    hideDetails: 'Ocultar Detalles',
    clickShowDetails: 'Haz clic en "Mostrar Detalles" para ver las credenciales de la cuenta compartida',
    email: 'Correo',
    password: 'Contraseña',
    copy: 'Copiar',
    importantNote: 'Importante:',
    credentialsWarning: 'Mantén estas credenciales privadas y solo compártelas con miembros autorizados de la familia.',
    familyMembers: 'Miembros de la Familia',
    seatsFilled: 'Asientos Ocupados',
    member: 'Miembro',
    fractionAmount: 'Monto Fraccionado',
    status: 'Estado',
    actions: 'Acciones',
    paid: 'Pagado',
    pending: 'Pendiente',
    sendReminder: 'Enviar Recordatorio',
    removeMember: 'Eliminar Miembro',
    renewalHistory: 'Historial de Renovación',
    renewedOn: 'Renovado el',
    completed: 'Completado',
    paymentDetails: 'Detalles del Pago',
    nextBillingCycle: 'El próximo ciclo de facturación se procesará automáticamente el',
    cancelSubscription: 'Cancelar Suscripción',
    viewBillingHistory: 'Ver Historial de Facturación',
    backToDashboard: 'Volver al Panel',
    editSubscription: 'Editar Suscripción',
    saveChanges: 'Guardar Cambios',
    cancel: 'Cancelar',
    subscriptionDetails: 'Detalles de la Suscripción',
    subscriptionName: 'Nombre de la Suscripción',
    totalPrice: 'Precio Total',
    billingCycle: 'Ciclo de Facturación',
    monthly: 'Mensual',
    annual: 'Anual',
    nextPaymentDate: 'Fecha del Próximo Pago',
    accountCredentials: 'Credenciales de la Cuenta',
    accountEmail: 'Correo de la Cuenta',
    accountPassword: 'Contraseña de la Cuenta',
    inviteMembers: 'Invitar Miembros',
    addMember: 'Añadir Miembro',
    emailPlaceholder: 'miembro@ejemplo.com',
    costPerPerson: 'Costo por Persona',
    noHistory: 'Sin Historial de Renovación',
    noHistoryDesc: 'El historial de renovación aparecerá aquí una vez que se procesen los pagos'
  }
};

export function SubscriptionDetails({ subscription, onNavigate, language, onLanguageChange }: SubscriptionDetailsProps) {
  const t = translations[language];
  const [showDetails, setShowDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  // Edit form states
  const [editName, setEditName] = useState('Netflix Family Plan');
  const [editPrice, setEditPrice] = useState('19.99');
  const [editBillingCycle, setEditBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [editNextPayment, setEditNextPayment] = useState('10/15/2023');
  const [editEmail, setEditEmail] = useState('netflix.family@example.com');
  const [editPassword, setEditPassword] = useState('Family2024!Secure');
  const [editMembers, setEditMembers] = useState(detailedMembers);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log('Saving changes:', {
      name: editName,
      price: editPrice,
      billingCycle: editBillingCycle,
      nextPayment: editNextPayment,
      email: editEmail,
      password: editPassword,
      members: editMembers
    });
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Resetear valores a los originales
    setEditName('Netflix Family Plan');
    setEditPrice('19.99');
    setEditBillingCycle('monthly');
    setEditNextPayment('10/15/2023');
    setEditEmail('netflix.family@example.com');
    setEditPassword('Family2024!Secure');
    setEditMembers(detailedMembers);
    setIsEditMode(false);
  };

  const handleAddMember = () => {
    if (newMemberEmail.trim() && editMembers.length < 5) {
      const name = newMemberEmail.split('@')[0];
      const newMember: Member = {
        id: Date.now().toString(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: newMemberEmail.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        amount: parseFloat(editPrice) / (editMembers.length + 1),
        status: 'pending',
        isOwner: false
      };
      setEditMembers([...editMembers, newMember]);
      setNewMemberEmail('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const memberToRemove = editMembers.find(m => m.id === memberId);
    if (memberToRemove && !memberToRemove.isOwner) {
      setEditMembers(editMembers.filter(m => m.id !== memberId));
    }
  };

  const costPerPerson = editMembers.length > 0 ? parseFloat(editPrice) / editMembers.length : 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentView="details" language={language} onLanguageChange={onLanguageChange} />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="hover:text-gray-900"
          >
            {t.subscriptions}
          </button>
          <span>/</span>
          <span className="text-gray-900">{t.netflixDetails}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {/* Subscription Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-red-600 text-2xl font-bold">NETFLIX</div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t.netflixFamily}</h1>
                <div className="text-xl text-blue-600 font-semibold mb-2">
                  $19.99 <span className="text-sm text-gray-500 font-normal">/ {t.month}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{t.activeSubscription}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t.editPlan}
              </button>
              
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{t.nextRenewal}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">Oct 15, 2023</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">{t.paymentMethod}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{t.autoRenewal}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm">{t.groupSize}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">4 {t.members}</div>
          </div>
        </div>

        {/* Shared Account Credentials */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t.sharedAccountCredentials}</h2>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  {t.hideDetails}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {t.showDetails}
                </>
              )}
            </button>
          </div>

          {!showDetails ? (
            <div className="text-sm text-gray-500 text-center py-8">
              {t.clickShowDetails}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="netflix.family@example.com"
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    {t.copy}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.password}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="Family2024!Secure"
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    {t.copy}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>{t.importantNote}</strong> {t.credentialsWarning}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{t.familyMembers}</h2>
            <span className="text-sm text-gray-500">3 / 4 {t.seatsFilled}</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.member}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.fractionAmount}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detailedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">${member.amount.toFixed(2)}</span>
                        {member.isOwner && (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'paid' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          {t.paid}
                        </span>
                      )}
                      {member.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                          {t.pending}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'pending' ? (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Send className="w-4 h-4" />
                          {t.sendReminder}
                        </button>
                      ) : (
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMemberMenu(openMemberMenu === member.id ? null : member.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                          {openMemberMenu === member.id && !member.isOwner && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  // Aquí iría la lógica para eliminar al miembro
                                  console.log('Eliminar miembro:', member.id);
                                  setOpenMemberMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t.removeMember}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
        </div>

        {/* Renewal History */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.renewalHistory}</h2>
          
          <div className="space-y-4">
            {renewalHistory.map((renewal) => (
              <div key={renewal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900">{renewal.period}</div>
                    <div className="text-sm text-gray-500">{t.renewedOn} {renewal.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${renewal.totalAmount.toFixed(2)}</div>
                    </div>
                    {renewal.status === 'completed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        {t.completed}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        {t.pending}
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">{t.paymentDetails}</div>
                  <div className="space-y-2">
                    {renewal.payments.map((payment) => (
                      <div key={payment.memberId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-gray-700">{payment.memberName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">${payment.amount.toFixed(2)}</span>
                          {payment.status === 'paid' ? (
                            <span className="text-green-600 text-xs">{payment.paidDate}</span>
                          ) : (
                            <span className="text-yellow-600 text-xs font-medium">{t.pending}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Info */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-blue-900">
              {t.nextBillingCycle} <span className="font-semibold">October 15, 2023</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              {t.cancelSubscription}
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              {t.viewBillingHistory}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToDashboard}
          </button>
        </div>
      </div>

      {/* Edit Mode Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t.editSubscription}</h1>
                <p className="text-gray-600">{language === 'es' ? 'Actualiza los detalles de tu suscripción y gestiona miembros' : 'Update your subscription details and manage members'}</p>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="col-span-2 space-y-6">
                {/* Subscription Name */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">{t.subscriptionName}</h2>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Netflix Family Plan"
                  />
                </div>

                {/* Subscription Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">{t.subscriptionDetails}</h2>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.totalPrice}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="19.99"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.billingCycle}
                      </label>
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => setEditBillingCycle('monthly')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            editBillingCycle === 'monthly'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t.monthly}
                        </button>
                        <button
                          onClick={() => setEditBillingCycle('annual')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            editBillingCycle === 'annual'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t.annual}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.nextPaymentDate}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={editNextPayment}
                        onChange={(e) => setEditNextPayment(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">{t.accountCredentials}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="account@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.password}
                      </label>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                </div>

                {/* Members Management */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Manage Members</h2>
                    <span className="text-sm text-blue-600 font-medium">Auto-Split Enabled</span>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                      placeholder="friend@example.com"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddMember}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">${costPerPerson.toFixed(2)}</span>
                          {member.isOwner ? (
                            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded">
                              OWNER
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                      <span className="font-semibold">${parseFloat(editPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <span className="text-blue-100">Total Members</span>
                      <span className="font-semibold">{editMembers.length} People</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-blue-100 text-sm mb-2">Cost per Person</div>
                      <div className="text-3xl font-bold">
                        ${costPerPerson.toFixed(2)}
                        <span className="text-base font-normal text-blue-100"> / {editBillingCycle === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-100">
                        Changes will be saved and members will be notified of any updates to their payment amount.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors mb-3 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>

                  <button 
                    onClick={handleCancelEdit}
                    className="w-full border border-white/30 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}