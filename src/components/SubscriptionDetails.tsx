import { ArrowLeft, Edit, UserPlus, Calendar, RefreshCw, Users as UsersIcon, MoreVertical, Send, Info, Eye, EyeOff, Trash2, Save, X as CloseIcon, ShieldCheck, Copy, Check, CreditCard } from 'lucide-react';
import type { View, Subscription, Member } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { Sidebar } from './Sidebar';
import { useState, useEffect } from 'react';
import { getSubscriptionMembers, isSubscriptionOwner, updateSubscription } from '../lib/subscriptionService';
import { getCurrentUserProfile, getCurrentUser } from '../lib/userService';
import { getSubscriptionPayments, getSubscriptionPendingPayments, registerPayment } from '../lib/paymentService';
import { getSubscriptionLogo, getSubscriptionColor } from '../lib/subscriptionHelper';

// Función helper para obtener iniciales
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLogout?: () => void;
}

export function SubscriptionDetails({ subscription, onNavigate, language, onLogout }: SubscriptionDetailsProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  const [loadedMembers, setLoadedMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState(subscription?.name || '');
  const [editPrice, setEditPrice] = useState(subscription?.price?.toString() || '0');
  const [editBillingCycle, setEditBillingCycle] = useState<'monthly' | 'annual'>(
    subscription?.billing_cycle === 'month' ? 'monthly' : 'annual'
  );
  const [editNextPayment, setEditNextPayment] = useState(
    subscription?.next_renewal 
      ? new Date(subscription.next_renewal).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
      : ''
  );
  const [editEmail, setEditEmail] = useState(subscription?.subscription_email || '');
  const [editPassword, setEditPassword] = useState(subscription?.subscription_password || '');
  const [editMembers, setEditMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  // Payment states
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedMemberPayment, setSelectedMemberPayment] = useState<any>(null);

  // Cargar miembros reales desde la base de datos
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const members = await getSubscriptionMembers(subscription.id);
        setLoadedMembers(members);
        setEditMembers(members);
        
        // Luego cargar los pagos pendientes para actualizar el status
        const payments = await getSubscriptionPendingPayments(subscription.id);
        setPendingPayments(payments || []);
        
        // Actualizar el status de los miembros basado en los pagos pendientes
        const pendingMemberIds = payments.map(p => {
          // Extraer el member ID del pago pendiente
          // El ID es "pending-{memberId}"
          return p.id.replace('pending-', '');
        });

        // Actualizar el estado de los miembros
        const updatedMembers = members.map(member => ({
          ...member,
          status: pendingMemberIds.includes(member.memberId) ? 'pending' : 'paid'
        }));
        
        setLoadedMembers(updatedMembers);
        setEditMembers(updatedMembers);
      } catch (error) {
        console.error('Error cargando miembros:', error);
        setLoadedMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [subscription.id]);

  // Cargar pagos pendientes de la suscripción
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const payments = await getSubscriptionPendingPayments(subscription.id);
        setPendingPayments(payments || []);
      } catch (error) {
        console.error('Error cargando pagos pendientes:', error);
        setPendingPayments([]);
      }
    };

    loadPayments();
  }, [subscription.id]);

  // Verificar si el usuario actual es el dueño
  useEffect(() => {
    const checkOwner = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const owner = await isSubscriptionOwner(subscription.id, currentUser.id);
          setIsOwner(owner);
        }
      } catch (error) {
        console.error('Error verificando si es dueño:', error);
        setIsOwner(false);
      }
    };

    checkOwner();
  }, [subscription.id]);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Obtener usuario actual
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert(language === 'es' ? 'Usuario no autenticado' : 'User not authenticated');
        return;
      }

      // Verificar que es el dueño
      const isOwner = await isSubscriptionOwner(subscription.id, currentUser.id);
      if (!isOwner) {
        alert(language === 'es' ? 'Solo el dueño puede editar esta suscripción' : 'Only the owner can edit this subscription');
        return;
      }

      // Convertir la fecha al formato YYYY-MM-DD si es necesario
      let nextRenewalDate = editNextPayment;
      if (editNextPayment) {
        // Si viene en formato dd/mm/aaaa, convertir a yyyy-mm-dd
        if (editNextPayment.includes('/')) {
          const parts = editNextPayment.split('/');
          if (parts.length === 3) {
            nextRenewalDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
      }

      // Actualizar la suscripción en la BD
      const success = await updateSubscription(subscription.id, {
        name: editName,
        price: parseFloat(editPrice),
        billing_cycle: editBillingCycle === 'monthly' ? 'month' : 'year',
        next_renewal: nextRenewalDate,
        subscription_email: editEmail,
        subscription_password: editPassword
      });

      if (success) {
        alert(language === 'es' ? 'Suscripción actualizada exitosamente' : 'Subscription updated successfully');
        setIsEditMode(false);
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        alert(language === 'es' ? 'Error al actualizar la suscripción' : 'Error updating subscription');
      }
    } catch (error) {
      console.error('Error en handleSaveChanges:', error);
      alert(language === 'es' ? 'Error al guardar los cambios' : 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Resetear valores a los originales
    setEditName(subscription?.name || '');
    setEditPrice(subscription?.price?.toString() || '0');
    setEditBillingCycle(subscription?.billing_cycle === 'month' ? 'monthly' : 'annual');
    setEditNextPayment(
      subscription?.next_renewal 
        ? new Date(subscription.next_renewal).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : ''
    );
    setEditEmail(subscription?.subscription_email || '');
    setEditPassword(subscription?.subscription_password || '');
    setEditMembers(loadedMembers);
    setIsEditMode(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    try {
      setIsProcessingPayment(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert('Usuario no autenticado');
        return;
      }

      // Usar el monto del miembro si está haciendo pago como miembro, sino usar el total
      const amount = selectedMemberPayment ? selectedMemberPayment.amount : subscription.price;

      // Registrar el pago
      const paymentId = await registerPayment(
        currentUser.id,
        subscription.id,
        amount,
        selectedPaymentMethod
      );

      if (paymentId) {
        alert('Pago registrado exitosamente');
        setShowPaymentModal(false);
        setSelectedPaymentMethod('');
        
        // Actualizar el estado del miembro que acaba de pagar
        const updatedMembers = loadedMembers.map(member => {
          if (selectedMemberPayment && member.memberId === selectedMemberPayment.memberId) {
            return { ...member, status: 'paid' as const };
          }
          return member;
        });
        
        setLoadedMembers(updatedMembers);
        setEditMembers(updatedMembers);
        setSelectedMemberPayment(null);
        
        // Recargar los pagos pendientes para mantener sincronizado
        const payments = await getSubscriptionPendingPayments(subscription.id);
        setPendingPayments(payments || []);
      } else {
        alert('Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      alert('Error al procesar el pago');
    } finally {
      setIsProcessingPayment(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentView="details" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Breadcrumb */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="hover:text-gray-900"
            >
              Suscripciones
            </button>
            <span>/</span>
            <span className="text-gray-900">Detalles de {subscription?.name || 'Suscripción'}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-8">
        {!subscription ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Cargando suscripción...</p>
          </div>
        ) : (
        <>
        {/* Subscription Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                {getSubscriptionLogo(subscription.name) ? (
                  <img 
                    src={getSubscriptionLogo(subscription.name)} 
                    alt={subscription.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-gray-900 text-4xl font-bold">{subscription.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{subscription.name}</h1>
                <div className="text-xl text-blue-600 font-semibold mb-2">
                  €{subscription.price?.toFixed(2) || '0.00'} <span className="text-sm text-gray-500 font-normal">/ {subscription.billing_cycle === 'month' ? 'month' : 'year'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscription.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">{subscription.is_active ? 'Active Subscription' : 'Inactive Subscription'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isOwner && (
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Next Renewal</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {subscription.nextRenewal 
                ? new Date(subscription.nextRenewal).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Payment Method</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {subscription.payment_method || 'Auto-renewal'}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm">Group Size</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {isLoadingMembers ? 'Loading...' : `${loadedMembers.length} Member${loadedMembers.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Shared Account Credentials */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Credenciales de Cuenta Compartida</h2>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar Detalles
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Mostrar Detalles
                </>
              )}
            </button>
          </div>

          {!showDetails ? (
            <div className="text-sm text-gray-500 text-center py-8">
              Haz clic en "Mostrar Detalles" para ver las credenciales de la cuenta compartida
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subscription.subscription_email || 'No se proporcionó correo'}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button 
                    onClick={() => {
                      if (subscription.subscription_email) {
                        navigator.clipboard.writeText(subscription.subscription_email);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                    disabled={!subscription.subscription_email}
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subscription.subscription_password || 'No se proporcionó contraseña'}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button 
                    onClick={() => {
                      if (subscription.subscription_password) {
                        navigator.clipboard.writeText(subscription.subscription_password);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                    disabled={!subscription.subscription_password}
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Mantén estas credenciales privadas y solo comparte con miembros de la familia autorizados.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pagos Pendientes</h2>
            <span className="text-sm text-gray-500">
              {pendingPayments.length} pago{pendingPayments.length !== 1 ? 's' : ''} pendiente{pendingPayments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No hay pagos pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{payment.subscription}</p>
                    <p className="text-sm text-gray-600">€{payment.amount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Pagar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Suscripción</p>
                  <p className="text-lg font-semibold text-gray-900">{subscription.name}</p>
                </div>

                {selectedMemberPayment && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Miembro</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMemberPayment.name}</p>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Cantidad</p>
                  <p className="text-2xl font-bold text-blue-600">€{selectedMemberPayment ? selectedMemberPayment.amount.toFixed(2) : subscription.price.toFixed(2)}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Método de Pago</label>
                  <div className="space-y-2">
                    {['Efectivo / Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'PayPal', 'Otro'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="payment-method"
                          value={method}
                          checked={selectedPaymentMethod === method}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="rounded-full"
                        />
                        <span className="ml-3 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPaymentMethod('');
                      setSelectedMemberPayment(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessingPayment || !selectedPaymentMethod}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? 'Procesando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Family Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
            <span className="text-sm text-gray-500">
              {isLoadingMembers ? 'Loading...' : `${loadedMembers.length} / ${subscription.total_members} Members`}
            </span>
          </div>

          {isLoadingMembers ? (
            <div className="text-center py-8 text-gray-500">Loading members...</div>
          ) : loadedMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No members found</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fraction Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.name}
                              {member.isOwner && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Owner</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{member.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">€{member.amount.toFixed(2)}</span>
                          {member.isOwner && (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.status === 'paid' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            Pagado
                          </span>
                        )}
                        {member.status === 'pending' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                            No pagado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {member.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedMemberPayment(member);
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Pagar
                          </button>
                        )}
                        {member.status === 'paid' && (
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
                                    console.log('Eliminar miembro:', member.id);
                                    setOpenMemberMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {language === 'es' ? 'Eliminar Miembro' : 'Remove Member'}
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
          )}
        </div>

        {/* Billing Info */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-blue-900">
              Next billing cycle will be automatically processed on <span className="font-semibold">
                {subscription.next_renewal 
                  ? new Date(subscription.next_renewal).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Cancel Subscription
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View Billing History
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
            Back to Dashboard
          </button>
        </div>
      </>
      )}
      </div>
      </div>

      {/* Edit Mode Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Editar Suscripción</h1>
                <p className="text-gray-600">Actualiza los detalles de tu suscripción y gestiona miembros</p>
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
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </div>
                    Nombre de la Suscripción
                  </h2>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    placeholder="ej. Netflix Plan Familiar"
                  />
                </div>

                {/* Subscription Details */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    Detalles de la Suscripción
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Total
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                          placeholder="19.99"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciclo de Facturación
                      </label>
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                          onClick={() => setEditBillingCycle('monthly')}
                          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            editBillingCycle === 'monthly'
                              ? 'bg-white text-blue-600 shadow-md'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Mensual
                        </button>
                        <button
                          onClick={() => setEditBillingCycle('annual')}
                          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            editBillingCycle === 'annual'
                              ? 'bg-white text-blue-600 shadow-md'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Anual
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Próxima Fecha de Pago
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={editNextPayment}
                        onChange={(e) => setEditNextPayment(e.target.value)}
                        placeholder="dd/mm/aaaa"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    Credenciales de la Cuenta
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                        placeholder="cuenta@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                        placeholder="Contraseña"
                      />
                    </div>
                  </div>
                </div>

                {/* Members Management */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      Gestionar Miembros
                    </h2>
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">División Automática</span>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                      placeholder="amigo@ejemplo.com"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    />
                    <button
                      onClick={handleAddMember}
                      className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold ring-2 ring-gray-100">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200">€{costPerPerson.toFixed(2)}</span>
                          {member.isOwner ? (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 text-sm font-medium rounded-lg">
                              PROPIETARIO
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                      <span className="font-semibold">€{parseFloat(editPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <span className="text-blue-100">Total Members</span>
                      <span className="font-semibold">{editMembers.length} People</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-blue-100 text-sm mb-2">Cost per Person</div>
                      <div className="text-3xl font-bold">
                        €{costPerPerson.toFixed(2)}
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
                    disabled={isSaving}
                    className={`w-full ${isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'} font-semibold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center gap-2`}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Cambios' : 'Save Changes')}
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