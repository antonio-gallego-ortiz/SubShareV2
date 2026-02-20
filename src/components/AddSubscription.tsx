import { useState, useEffect } from 'react';
import { Search, UserPlus, Calendar, Trash2, Info, ShieldCheck } from 'lucide-react';
import type { View } from '../App';
import { LanguageSelector } from './LanguageSelector';
import { NotificationPanel } from './NotificationPanel';
import { getCurrentProfile, createSubscription } from '../lib/supabaseApi';

interface AddSubscriptionProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

interface InvitedMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  isOwner: boolean;
}

const services = [
  { id: 'netflix', name: 'Netflix', logo: 'NETFLIX', color: 'bg-red-50 border-red-200' },
  { id: 'spotify', name: 'Spotify', logo: '🎵', color: 'bg-green-50 border-green-200' },
  { id: 'disney', name: 'Disney+', logo: '✨', color: 'bg-blue-900/10 border-blue-900/20' },
  { id: 'custom', name: 'Custom', logo: '+', color: 'bg-gray-50 border-gray-200' },
];

export function AddSubscription({ onNavigate, language, onLanguageChange }: AddSubscriptionProps) {
  const [selectedService, setSelectedService] = useState('netflix');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [price, setPrice] = useState('15.99');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [customName, setCustomName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [members, setMembers] = useState<InvitedMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string;
  }>({ fullName: '', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User' });

  const totalMembers = members.length;
  const costPerPerson = totalMembers > 0 ? parseFloat(price) / totalMembers : 0;

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentProfile();
        if (profile) {
          setUserProfile({
            fullName: profile.full_name || 'User',
            avatarUrl: profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleAddMember = () => {
    if (emailInput.trim()) {
      const name = emailInput.split('@')[0];
      const initials = name.substring(0, 2).toUpperCase();
      const newMember: InvitedMember = {
        id: Date.now().toString(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: emailInput.trim(),
        initials,
        isOwner: false,
      };
      setMembers([...members, newMember]);
      setEmailInput('');
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate inputs
      if (!price || parseFloat(price) <= 0) {
        setError('Please enter a valid price');
        return;
      }

      const serviceName = selectedService === 'custom' 
        ? customName || 'Custom Service' 
        : services.find(s => s.id === selectedService)?.name || 'Subscription';

      // Calculate total members (only invited members + owner)
      const totalMembersCount = members.length + 1; // +1 for owner

      // Create subscription in database
      await createSubscription({
        name: serviceName,
        logo: selectedService === 'custom' ? customName.charAt(0).toUpperCase() : services.find(s => s.id === selectedService)?.logo || 'S',
        price: parseFloat(price),
        billing_cycle: billingCycle === 'monthly' ? 'month' : 'year',
        next_renewal: nextPaymentDate || undefined,
        payment_method: 'Not set',
        total_members: totalMembersCount
      });

      // Navigate to dashboard after successful creation
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
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
                <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
                <NotificationPanel language={language} />
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName}
                  onClick={() => onNavigate('settings')}
                  className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all object-cover"
                />
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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

              <div className="flex gap-3 mb-6">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
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
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                  <span className="font-semibold">${parseFloat(price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <span className="text-blue-100">Total Members</span>
                  <span className="font-semibold">{totalMembers} People</span>
                </div>
                <div className="pt-2">
                  <div className="text-blue-100 text-sm mb-2">Cost per Person</div>
                  <div className="text-3xl font-bold">
                    ${costPerPerson.toFixed(2)}
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

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-4 text-white text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Subscription...' : 'Confirm & Save'}
              </button>

              <button 
                onClick={() => onNavigate('dashboard')}
                className="w-full border border-white/30 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Pro Tip */}
            <div className="mt-6 bg-white rounded-lg border border-blue-200 p-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  💡
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Pro Tip</div>
                  <p className="text-sm text-gray-600">
                    Choose annual billing to save up to 20% on most services. SplitWise will automatically adjust everyone's share.
                  </p>
                </div>
              </div>
            </div>
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