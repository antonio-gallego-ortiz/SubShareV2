import { ArrowLeft, Edit, UserPlus, Calendar, RefreshCw, Users as UsersIcon, MoreVertical, Send, Info, Eye, EyeOff, Trash2, Save, X as CloseIcon } from 'lucide-react';
import type { View, Subscription, Member } from '../App';
import { LanguageSelector } from './LanguageSelector';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

// Mock data para los miembros con más detalles
const detailedMembers: Member[] = [
  {
    id: '1',
    name: 'Alice (Owner)',
    email: 'alice.smith@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    amount: 5.00,
    status: 'paid',
    isOwner: true
  },
  {
    id: '2',
    name: 'Bob Jenkins',
    email: 'bob.j@provider.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    amount: 5.00,
    status: 'pending',
    isOwner: false
  },
  {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie.d@site.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    amount: 5.00,
    status: 'paid',
    isOwner: false
  },
  {
    id: '4',
    name: 'Diana Martinez',
    email: 'diana.m@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    amount: 4.99,
    status: 'paid',
    isOwner: false
  },
];

// Mock data para el historial de renovaciones
const renewalHistory = [
  {
    id: '1',
    date: 'September 15, 2023',
    period: 'Sep 15 - Oct 15, 2023',
    totalAmount: 19.99,
    status: 'completed',
    payments: [
      { memberId: '1', memberName: 'Alice', amount: 5.00, status: 'paid', paidDate: 'Sep 15, 2023' },
      { memberId: '2', memberName: 'Bob', amount: 5.00, status: 'paid', paidDate: 'Sep 16, 2023' },
      { memberId: '3', memberName: 'Charlie', amount: 5.00, status: 'paid', paidDate: 'Sep 15, 2023' },
      { memberId: '4', memberName: 'Diana', amount: 4.99, status: 'paid', paidDate: 'Sep 15, 2023' },
    ]
  },
  {
    id: '2',
    date: 'August 15, 2023',
    period: 'Aug 15 - Sep 15, 2023',
    totalAmount: 19.99,
    status: 'completed',
    payments: [
      { memberId: '1', memberName: 'Alice', amount: 5.00, status: 'paid', paidDate: 'Aug 15, 2023' },
      { memberId: '2', memberName: 'Bob', amount: 5.00, status: 'paid', paidDate: 'Aug 18, 2023' },
      { memberId: '3', memberName: 'Charlie', amount: 5.00, status: 'paid', paidDate: 'Aug 15, 2023' },
      { memberId: '4', memberName: 'Diana', amount: 4.99, status: 'paid', paidDate: 'Aug 16, 2023' },
    ]
  },
  {
    id: '3',
    date: 'July 15, 2023',
    period: 'Jul 15 - Aug 15, 2023',
    totalAmount: 19.99,
    status: 'completed',
    payments: [
      { memberId: '1', memberName: 'Alice', amount: 5.00, status: 'paid', paidDate: 'Jul 15, 2023' },
      { memberId: '2', memberName: 'Bob', amount: 5.00, status: 'paid', paidDate: 'Jul 20, 2023' },
      { memberId: '3', memberName: 'Charlie', amount: 5.00, status: 'paid', paidDate: 'Jul 16, 2023' },
      { memberId: '4', memberName: 'Diana', amount: 4.99, status: 'paid', paidDate: 'Jul 15, 2023' },
    ]
  },
  {
    id: '4',
    date: 'October 15, 2023',
    period: 'Oct 15 - Nov 15, 2023',
    totalAmount: 19.99,
    status: 'pending',
    payments: [
      { memberId: '1', memberName: 'Alice', amount: 5.00, status: 'paid', paidDate: 'Oct 15, 2023' },
      { memberId: '2', memberName: 'Bob', amount: 5.00, status: 'pending', paidDate: '' },
      { memberId: '3', memberName: 'Charlie', amount: 5.00, status: 'paid', paidDate: 'Oct 15, 2023' },
      { memberId: '4', memberName: 'Diana', amount: 4.99, status: 'paid', paidDate: 'Oct 16, 2023' },
    ]
  },
];

export function SubscriptionDetails({ subscription, onNavigate, language, onLanguageChange }: SubscriptionDetailsProps) {
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="font-semibold text-gray-900">SubShare</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-4 pr-4 py-1.5 border border-gray-200 rounded-lg bg-gray-50 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              <button 
                onClick={() => onNavigate('settings')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Settings
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
                <NotificationPanel language={language} />
                
                <img
                  onClick={() => onNavigate('settings')}
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                  alt="User"
                  className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="hover:text-gray-900"
          >
            Subscriptions
          </button>
          <span>/</span>
          <span className="text-gray-900">Netflix Details</span>
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Netflix Family Plan</h1>
                <div className="text-xl text-blue-600 font-semibold mb-2">
                  $19.99 <span className="text-sm text-gray-500 font-normal">/ month</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active Subscription</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Plan
              </button>
              
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
            <div className="text-2xl font-semibold text-gray-900">Oct 15, 2023</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Payment Method</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">Auto-renewal</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm">Group Size</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">4 Members</div>
          </div>
        </div>

        {/* Shared Account Credentials */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shared Account Credentials</h2>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Details
                </>
              )}
            </button>
          </div>

          {!showDetails ? (
            <div className="text-sm text-gray-500 text-center py-8">
              Click "Show Details" to view the shared account credentials
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="netflix.family@example.com"
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="Family2024!Secure"
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Important:</strong> Keep these credentials private and only share with authorized family members.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
            <span className="text-sm text-gray-500">3 / 4 Seats Filled</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fraction Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                          Paid
                        </span>
                      )}
                      {member.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'pending' ? (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Send className="w-4 h-4" />
                          Send Reminder
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

          
        </div>

        {/* Renewal History */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Renewal History</h2>
          
          <div className="space-y-4">
            {renewalHistory.map((renewal) => (
              <div key={renewal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900">{renewal.period}</div>
                    <div className="text-sm text-gray-500">Renewed on {renewal.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${renewal.totalAmount.toFixed(2)}</div>
                    </div>
                    {renewal.status === 'completed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">Payment Details</div>
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
                            <span className="text-yellow-600 text-xs font-medium">Pending</span>
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
              Next billing cycle will be automatically processed on <span className="font-semibold">October 15, 2023</span>
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
      </div>

      {/* Edit Mode Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Subscription</h1>
                <p className="text-gray-600">Update your subscription details and manage members</p>
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
                  <h2 className="font-semibold text-gray-900 mb-4">Subscription Name</h2>
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
                  <h2 className="font-semibold text-gray-900 mb-4">Subscription Details</h2>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Price
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
                        Billing Cycle
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
                          Monthly
                        </button>
                        <button
                          onClick={() => setEditBillingCycle('annual')}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            editBillingCycle === 'annual'
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
                  <h2 className="font-semibold text-gray-900 mb-4">Account Credentials</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
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
                        Password
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