import { useState } from 'react';
import { Search, Bell, Download, Filter, CreditCard, CheckCircle, Clock, XCircle, Calendar, X, DollarSign } from 'lucide-react';
import type { View } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { Sidebar } from './Sidebar';

interface PaymentsProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
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

const transactions: Transaction[] = [
  {
    id: '1',
    date: '2023-10-15',
    subscription: 'Netflix Premium',
    member: 'Sarah Miller',
    amount: 5.00,
    status: 'completed',
    paymentMethod: 'Visa ****4532',
    category: 'Entertainment'
  },
  {
    id: '2',
    date: '2023-10-14',
    subscription: 'Spotify Family',
    member: 'Alex Martinez',
    amount: 2.83,
    status: 'completed',
    paymentMethod: 'Auto-debit',
    category: 'Music'
  },
  {
    id: '3',
    date: '2023-10-13',
    subscription: 'YouTube Premium',
    member: 'Charlie Davis',
    amount: 4.60,
    status: 'completed',
    paymentMethod: 'Mastercard ****8821',
    category: 'Entertainment'
  },
  {
    id: '4',
    date: '2023-10-12',
    subscription: 'Netflix Premium',
    member: 'Bob Jenkins',
    amount: 5.00,
    status: 'pending',
    paymentMethod: 'Pending',
    category: 'Entertainment'
  },
  {
    id: '5',
    date: '2023-10-10',
    subscription: 'Spotify Family',
    member: 'Emma Wilson',
    amount: 2.83,
    status: 'completed',
    paymentMethod: 'Visa ****2109',
    category: 'Music'
  },
  {
    id: '6',
    date: '2023-10-08',
    subscription: 'Netflix Premium',
    member: 'Charlie Davis',
    amount: 5.00,
    status: 'failed',
    paymentMethod: 'Visa ****3421',
    category: 'Entertainment'
  },
  {
    id: '7',
    date: '2023-10-05',
    subscription: 'YouTube Premium',
    member: 'Sarah Miller',
    amount: 4.60,
    status: 'completed',
    paymentMethod: 'Visa ****4532',
    category: 'Entertainment'
  }
];

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
    actions: 'Actions'
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
    actions: 'Acciones'
  }
};

export function Payments({ onNavigate, language }: PaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const t = translations[language];

  const handleOpenPaymentModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentModal(true);
    setSelectedPaymentMethod('');
    setPaymentNotes('');
  };

  const handleConfirmPayment = () => {
    // Aquí iría la lógica para guardar el pago
    console.log('Payment confirmed:', {
      transaction: selectedTransaction,
      paymentMethod: selectedPaymentMethod,
      notes: paymentNotes
    });
    setShowPaymentModal(false);
    setSelectedTransaction(null);
    setSelectedPaymentMethod('');
    setPaymentNotes('');
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
  
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const upcomingBills = 3;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView="payments" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">SubShare</div>
                  <div className="text-xs text-gray-500">Family Management</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.search}
                  className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <NotificationPanel />
              <div 
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                  alt="Alex M."
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">Alex M.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="py-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            
            
            <button className="py-4 text-sm text-blue-600 font-medium border-b-2 border-blue-600">
              Payments
            </button>
            <button 
              onClick={() => onNavigate('settings')}
              className="py-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Settings
            </button>
          </nav>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <div className="text-sm text-green-600">↗ 7 successful transactions</div>
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
            <div className="text-sm text-gray-600">Next: Oct 24, 2023</div>
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
                          onClick={() => handleOpenPaymentModal(transaction)}
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
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTransaction && (
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
                    <span className="text-sm font-medium text-gray-900">{selectedTransaction.subscription}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t.amount}:</span>
                    <span className="text-lg font-semibold text-blue-600">€{selectedTransaction.amount.toFixed(2)}</span>
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