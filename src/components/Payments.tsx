import { useState, useEffect } from 'react';
import { Search, Bell, Download, Filter, CreditCard, CheckCircle, Clock, XCircle, Calendar, X, DollarSign, AlertCircle, TrendingUp, BarChart3, Loader } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { View } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { Sidebar } from './Sidebar';
import { getCurrentUserProfile, getCurrentUserName, getUserInitials, getCurrentUser } from '../lib/userService';
import { getUserPayments, getPendingPayments, registerPayment } from '../lib/paymentService';
import type { Payment } from '../lib/paymentService';
import { getUserSubscriptions } from '../lib/subscriptionService';

interface PaymentsProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLogout?: () => void;
}

interface Transaction {
  id: string;
  date: string;
  subscription: string;
  member: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  category: string;
}

const translations = {
  en: {
    title: 'Payment History',
    subtitle: 'Track all your subscription payments and transactions',
    search: 'Search payments...',
    exportData: 'Export Data',
    filters: 'Filters',
    totalPaid: 'Total Paid This Month',
    pendingPayments: 'Pending Payments',
    upcomingBills: 'Upcoming Bills',
    date: 'Date',
    subscription: 'Subscription',
    member: 'Member',
    amount: 'Amount',
    status: 'Status',
    paymentMethod: 'Payment Method',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    all: 'All',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    payButton: 'Pay',
    registerPayment: 'Register Payment',
    paymentDetails: 'Payment Details',
    selectPaymentMethod: 'Select Payment Method',
    cashTransfer: 'Cash / Bank Transfer',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    paypal: 'PayPal',
    other: 'Other',
    paymentNotes: 'Payment Notes (Optional)',
    notesPlaceholder: 'Add any additional details about this payment...',
    cancel: 'Cancel',
    confirmPayment: 'Confirm Payment',
    actions: 'Actions',
    loading: 'Loading...'
  },
  es: {
    title: 'Historial de Pagos',
    subtitle: 'Rastrea todos tus pagos de suscripciones y transacciones',
    search: 'Buscar pagos...',
    exportData: 'Exportar Datos',
    filters: 'Filtros',
    totalPaid: 'Total Pagado Este Mes',
    pendingPayments: 'Pagos Pendientes',
    upcomingBills: 'Facturas Próximas',
    date: 'Fecha',
    subscription: 'Suscripción',
    member: 'Miembro',
    amount: 'Cantidad',
    status: 'Estado',
    paymentMethod: 'Método de Pago',
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    all: 'Todos',
    thisMonth: 'Este Mes',
    lastMonth: 'Mes Pasado',
    thisYear: 'Este Año',
    payButton: 'Pagar',
    registerPayment: 'Registrar Pago',
    paymentDetails: 'Detalles del Pago',
    selectPaymentMethod: 'Seleccionar Método de Pago',
    cashTransfer: 'Efectivo / Transferencia',
    creditCard: 'Tarjeta de Crédito',
    debitCard: 'Tarjeta de Débito',
    paypal: 'PayPal',
    other: 'Otro',
    paymentNotes: 'Notas del Pago (Opcional)',
    notesPlaceholder: 'Añade detalles adicionales sobre este pago...',
    cancel: 'Cancelar',
    confirmPayment: 'Confirmar Pago',
    actions: 'Acciones',
    loading: 'Cargando...'
  }
};

export function Payments({ onNavigate, language, onLogout }: PaymentsProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState('Usuario');
  const [userInitials, setUserInitials] = useState('U');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState<{ [key: string]: Payment }>({});
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const t = translations[language];

  // Helper: Prepare data for payment status pie chart
  const getPaymentStatusData = () => {
    const completed = transactions.filter(t => t.status === 'completed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;
    return [
      { name: language === 'es' ? 'Completados' : 'Completed', value: completed, fill: '#10b981' },
      { name: language === 'es' ? 'Pendientes' : 'Pending', value: pending, fill: '#f59e0b' }
    ].filter(item => item.value > 0);
  };

  // Helper: Prepare data for monthly trends
  const getMonthlyTrendsData = () => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }),
        amount: 0,
        rawDate: date
      };
    });

    transactions
      .filter(t => t.status === 'completed')
      .forEach(transaction => {
        const transDate = new Date(transaction.date);
        const daysDiff = Math.floor((new Date().getTime() - transDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff <= 29) {
          last30Days[29 - daysDiff].amount += transaction.amount;
        }
      });

    return last30Days.map(item => ({
      name: item.date,
      amount: parseFloat(item.amount.toFixed(2))
    }));
  };

  // Helper: Prepare data for payment methods
  const getPaymentMethodsData = () => {
    const methodCounts: { [key: string]: number } = {};
    transactions.forEach(t => {
      methodCounts[t.paymentMethod] = (methodCounts[t.paymentMethod] || 0) + 1;
    });

    return Object.entries(methodCounts)
      .map(([method, count]) => ({
        name: method,
        value: count,
        fill: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Object.keys(methodCounts).indexOf(method) % 5]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Función para recargar datos desde la BD
  const reloadPaymentsData = async () => {
    setIsLoading(true);
    // Timeout para asegurar que siempre se carga después de 10 segundos
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    try {
      // Cargar suscripciones activas del usuario
      const userSubs = await getUserSubscriptions();
      const activeSubsList = userSubs.filter((s: any) => s.isActive === true);
      setSubscriptions(activeSubsList);

      // Cargar pagos del usuario desde la BD
      const userPayments = await getUserPayments();
      setTransactions(userPayments || []);

      // Cargar pagos pendientes
      const pendingPaymentsList = await getPendingPayments();
      setPendingPayments(pendingPaymentsList || []);

      // Crear un pago pendiente SOLO para suscripciones que NO tienen un pago completado recientemente
      const subPayments: { [key: string]: Payment } = {};
      activeSubsList.forEach((sub: any) => {
        const subId = sub.id;
        const subData = sub;
        
        // Verificar si esta suscripción tiene un pago completado
        const hasRecentPayment = userPayments.some(
          (payment: Payment) => payment.subscriptionId === subId && payment.status === 'completed'
        );
        
        // Solo crear pago pendiente si no existe uno completado
        if (!hasRecentPayment) {
          subPayments[subId] = {
            id: `sub-${subId}`,
            date: new Date().toISOString(),
            subscription: subData?.name || 'Unknown',
            subscriptionId: subId,
            member: userName,
            amount: subData?.price || 0,
            status: 'pending',
            paymentMethod: subData?.payment_method || 'Auto-debit',
            category: 'Subscription',
            dueDate: subData?.next_renewal || new Date().toISOString()
          };
        } else {
          // Si ya existe un pago completado, mostrar como completado
          const completedPayment = userPayments.find(
            (payment: Payment) => payment.subscriptionId === subId && payment.status === 'completed'
          );
          if (completedPayment) {
            subPayments[subId] = completedPayment;
          }
        }
      });
      setSubscriptionPayments(subPayments);
      clearTimeout(timeout);
    } catch (error) {
      console.error('Error cargando datos de pagos:', error);
      setTransactions([]);
      setSubscriptions([]);
      setPendingPayments([]);
      clearTimeout(timeout);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPaymentsData = async () => {
      try {
        // Cargar perfil del usuario
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);

        // Cargar nombre
        const name = await getCurrentUserName();
        setUserName(name);

        // Cargar iniciales
        const initials = await getUserInitials();
        setUserInitials(initials);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }

      // Recargar datos de pagos
      await reloadPaymentsData();
    };

    loadPaymentsData();
  }, []);

  const handleOpenPaymentModal = (payment: Transaction | Payment | null, isSubscription: boolean = false) => {
    if (isSubscription && payment) {
      setSelectedSubscription(payment);
      setSelectedTransaction(null);
    } else if (payment) {
      setSelectedTransaction(payment as Transaction);
      setSelectedSubscription(null);
    }
    setShowPaymentModal(true);
    setSelectedPaymentMethod('');
    setPaymentNotes('');
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert(language === 'es' ? 'Por favor selecciona un método de pago' : 'Please select a payment method');
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert(language === 'es' ? 'Usuario no autenticado' : 'User not authenticated');
        return;
      }

      if (selectedSubscription) {
        // Pago de suscripción - Guardar en base de datos
        const subId = selectedSubscription.subscriptionId;
        const amount = selectedSubscription.amount;

        const paymentId = await registerPayment(
          currentUser.id,
          subId,
          amount,
          selectedPaymentMethod
        );

        if (paymentId) {
          alert(language === 'es' ? 'Pago registrado exitosamente' : 'Payment registered successfully');
          
          // Cerrar modal y recargar datos desde la BD
          setShowPaymentModal(false);
          setSelectedTransaction(null);
          setSelectedSubscription(null);
          setSelectedPaymentMethod('');
          setPaymentNotes('');
          
          // Recargar todos los datos desde la BD
          await reloadPaymentsData();
        } else {
          alert(language === 'es' ? 'Error al registrar el pago' : 'Error registering payment');
          return;
        }
      } else if (selectedTransaction) {
        // Pago de transacción - Guardar en base de datos
        const paymentId = await registerPayment(
          currentUser.id,
          selectedTransaction.subscriptionId,
          selectedTransaction.amount,
          selectedPaymentMethod
        );

        if (paymentId) {
          alert(language === 'es' ? 'Pago registrado exitosamente' : 'Payment registered successfully');
          
          // Cerrar modal y recargar datos desde la BD
          setShowPaymentModal(false);
          setSelectedTransaction(null);
          setSelectedSubscription(null);
          setSelectedPaymentMethod('');
          setPaymentNotes('');
          
          // Recargar todos los datos desde la BD
          await reloadPaymentsData();
        } else {
          alert(language === 'es' ? 'Error al registrar el pago' : 'Error registering payment');
          return;
        }
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert(language === 'es' ? 'Error al procesar el pago' : 'Error processing payment');
    }
  };

  const handleExportData = () => {
    const statusLabels = {
      'completed': language === 'es' ? 'Completado' : 'Completed',
      'pending': language === 'es' ? 'Pendiente' : 'Pending',
      'failed': language === 'es' ? 'Fallido' : 'Failed'
    };

    const csvRows = filteredTransactions.map(t => {
      const date = new Date(t.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
      const status = statusLabels[t.status as keyof typeof statusLabels];
      return [date, t.subscription, t.member, `€${t.amount.toFixed(2)}`, status, t.paymentMethod];
    });

    const headers = language === 'es' 
      ? ['Fecha', 'Suscripción', 'Miembro', 'Cantidad', 'Estado', 'Método de Pago']
      : ['Date', 'Subscription', 'Member', 'Amount', 'Status', 'Payment Method'];
    
    const csvContent = [
      headers,
      ...csvRows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.subscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.member.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPaidThisMonth = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const completedTransactionsCount = transactions
    .filter(t => t.status === 'completed')
    .length;
  
  const pendingCount = pendingPayments.length;
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const upcomingBills = subscriptions.length;
  const activeSubscriptionsCount = subscriptions.filter((s: any) => s.isActive === true).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView="payments" onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="border-t border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-end gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <NotificationPanel onNavigate={onNavigate} />
          <div 
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {userInitials}
            </div>
            <span className="text-sm font-medium text-gray-700">{userName}</span>
          </div>
        </div>
      </div>

      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            {t.exportData}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.totalPaid}</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">€{totalPaidThisMonth.toFixed(2)}</div>
            <div className="text-sm text-green-600">↗ {completedTransactionsCount} {language === 'es' ? 'transacciones completadas' : 'completed transactions'}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.pendingPayments}</span>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">{pendingCount}</div>
            <div className="text-sm text-gray-600">Awaiting processing</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.upcomingBills}</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">{upcomingBills}</div>
            <div className="text-sm text-gray-600">Active subscriptions</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t.filters}:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.completed}
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.pending}
              </button>
              
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.date}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.subscription}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.member}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.amount}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.paymentMethod}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {new Date(transaction.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{transaction.subscription}</div>
                      <div className="text-sm text-gray-500">{transaction.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{transaction.member}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">€{transaction.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {t.completed}
                        </span>
                      )}
                      {transaction.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                          <Clock className="w-3 h-3" />
                          {t.pending}
                        </span>
                      )}
                      {transaction.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                          <XCircle className="w-3 h-3" />
                          {t.failed}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">{transaction.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleOpenPaymentModal(transaction, false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {t.payButton}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Analytics Charts */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{language === 'es' ? 'Análisis de Pagos' : 'Payment Analytics'}</h2>
              <p className="text-gray-600">{language === 'es' ? 'Visualización detallada de tus pagos y tendencias' : 'Detailed visualization of your payments and trends'}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Payment Status Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">{language === 'es' ? 'Estado de Pagos' : 'Payment Status'}</h3>
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-500">{t.loading}</p>
                  </div>
                ) : getPaymentStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPaymentStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getPaymentStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value} ${language === 'es' ? 'transacciones' : 'transactions'}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{language === 'es' ? 'No hay datos de pagos' : 'No payment data available'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">{language === 'es' ? 'Métodos de Pago' : 'Payment Methods'}</h3>
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-500">{t.loading}</p>
                  </div>
                ) : getPaymentMethodsData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPaymentMethodsData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip 
                        formatter={(value) => `${value} ${language === 'es' ? 'usos' : 'uses'}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{language === 'es' ? 'No hay datos de métodos de pago' : 'No payment method data available'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">{language === 'es' ? 'Tendencia de Pagos (Últimos 30 Días)' : 'Payment Trend (Last 30 Days)'}</h3>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-blue-600 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500">{t.loading}</p>
              </div>
            ) : getMonthlyTrendsData().some(d => d.amount > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getMonthlyTrendsData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `€${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name={language === 'es' ? 'Monto Pagado' : 'Amount Paid'}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">{language === 'es' ? 'No hay datos de tendencias' : 'No trend data available'}</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{language === 'es' ? 'Tasa de Finalización' : 'Completion Rate'}</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-semibold text-gray-900">
                {transactions.length > 0 
                  ? `${Math.round((completedTransactionsCount / transactions.length) * 100)}%` 
                  : '0%'
                }
              </div>
              <p className="text-sm text-gray-600 mt-2">{language === 'es' ? 'De pagos realizados' : 'Of transactions completed'}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{language === 'es' ? 'Monto Promedio' : 'Average Amount'}</span>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-semibold text-gray-900">
                €{transactions.length > 0 ? (transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-gray-600 mt-2">{language === 'es' ? 'Por transacción' : 'Per transaction'}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{language === 'es' ? 'Cantidad Pendiente' : 'Pending Amount'}</span>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-semibold text-gray-900">
                €{pendingAmount.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-2">{language === 'es' ? 'Por procesar' : 'Awaiting processing'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (selectedTransaction || selectedSubscription) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{t.registerPayment}</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t.paymentDetails}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.subscription}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedSubscription?.subscription || selectedTransaction?.subscription || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.amount}:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      €{((selectedSubscription?.amount || selectedTransaction?.amount || 0).toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectPaymentMethod}
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t.selectPaymentMethod}</option>
                  <option value="cashTransfer">{t.cashTransfer}</option>
                  <option value="creditCard">{t.creditCard}</option>
                  <option value="debitCard">{t.debitCard}</option>
                  <option value="paypal">{t.paypal}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.paymentNotes}
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!selectedPaymentMethod}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedPaymentMethod
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t.confirmPayment}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}