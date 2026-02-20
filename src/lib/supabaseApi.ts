import { supabase } from './supabase';
import type { Database } from './database.types';

// Type aliases for easier use
type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionMember = Database['public']['Tables']['subscription_members']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Invitation = Database['public']['Tables']['invitations']['Row'];

// Extended types with joined data
export interface SubscriptionWithDetails extends Subscription {
  members: (SubscriptionMember & { profile: Profile })[];
  owner: Profile | null;
}

export interface MemberWithProfile extends SubscriptionMember {
  profile: Profile;
}

// ========================================
// AUTH FUNCTIONS
// ========================================

export async function signUp(
  email: string, 
  password: string, 
  fullName: string, 
  phone?: string, 
  avatarUrl?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || '',
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName.charAt(0).toUpperCase()}`,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return true;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// PROFILE FUNCTIONS
// ========================================

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// SUBSCRIPTION FUNCTIONS
// ========================================

export async function getSubscriptions() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      owner:profiles!subscriptions_owner_id_fkey(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserSubscriptions() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Get subscription_members where user is a member
  const { data: memberData, error: memberError } = await supabase
    .from('subscription_members')
    .select('subscription_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;
  if (!memberData || memberData.length === 0) return [];

  const subscriptionIds = memberData
    .map(m => m.subscription_id)
    .filter((id): id is string => id !== null);

  if (subscriptionIds.length === 0) return [];

  // Get subscriptions data
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      owner:profiles!subscriptions_owner_id_fkey(*)
    `)
    .in('id', subscriptionIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSubscriptionById(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      owner:profiles!subscriptions_owner_id_fkey(*)
    `)
    .eq('id', subscriptionId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSubscription(subscription: {
  name: string;
  logo?: string;
  price: number;
  billing_cycle: 'month' | 'year';
  next_renewal?: string;
  payment_method?: string;
  total_members?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      ...subscription,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Add owner as a member directly (avoiding RLS recursion issues)
  const memberAmount = subscription.price / (subscription.total_members || 1);
  const { error: memberError } = await supabase
    .from('subscription_members')
    .insert({
      subscription_id: data.id,
      user_id: user.id,
      amount: memberAmount,
      is_owner: true,
    });

  if (memberError) {
    // If member insertion fails, delete the subscription to maintain consistency
    await supabase.from('subscriptions').delete().eq('id', data.id);
    throw memberError;
  }

  return data;
}

export async function updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscriptionId);

  if (error) throw error;
}

// ========================================
// SUBSCRIPTION MEMBERS FUNCTIONS
// ========================================

export async function getSubscriptionMembers(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscription_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('subscription_id', subscriptionId);

  if (error) throw error;
  return data;
}

export async function addMemberToSubscription(
  subscriptionId: string,
  userId: string,
  amount: number,
  isOwner: boolean = false
) {
  const { data, error } = await supabase
    .from('subscription_members')
    .insert({
      subscription_id: subscriptionId,
      user_id: userId,
      amount,
      is_owner: isOwner,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeMemberFromSubscription(memberId: string) {
  const { error } = await supabase
    .from('subscription_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function updateMemberAmount(memberId: string, amount: number) {
  const { data, error } = await supabase
    .from('subscription_members')
    .update({ amount })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// PAYMENT FUNCTIONS
// ========================================

export async function getPaymentsBySubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      member:subscription_members(
        *,
        profile:profiles(*)
      )
    `)
    .eq('subscription_id', subscriptionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPaymentsByUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data: members } = await supabase
    .from('subscription_members')
    .select('id')
    .eq('user_id', user.id);

  if (!members) return [];

  const memberIds = members.map(m => m.id);

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      subscription:subscriptions(*),
      member:subscription_members(*)
    `)
    .in('member_id', memberIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPayment(payment: {
  subscription_id: string;
  member_id: string;
  amount: number;
  status: 'paid' | 'pending' | 'auto-paid' | 'failed';
  payment_date?: string;
  due_date?: string;
  billing_period_start?: string;
  billing_period_end?: string;
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'paid' | 'pending' | 'auto-paid' | 'failed',
  paymentDate?: string
) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, payment_date: paymentDate || new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// NOTIFICATION FUNCTIONS
// ========================================

export async function getNotifications() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
}

export async function createNotification(notification: {
  user_id: string;
  title: string;
  message: string;
  type: 'payment' | 'reminder' | 'invitation' | 'update';
  related_subscription_id?: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// INVITATION FUNCTIONS
// ========================================

export async function createInvitation(
  subscriptionId: string,
  inviteeEmail: string,
  expiresInDays: number = 7
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      subscription_id: subscriptionId,
      inviter_id: user.id,
      invitee_email: inviteeEmail,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitation(token: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      subscription:subscriptions(*),
      inviter:profiles!invitations_inviter_id_fkey(*)
    `)
    .eq('token', token)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptInvitation(token: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const invitation = await getInvitation(token);

  if (invitation.status !== 'pending') {
    throw new Error('Invitation is not valid');
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  // Update invitation status
  await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('token', token);

  // Add user as member
  const subscription = invitation.subscription;
  if (!subscription) throw new Error('Subscription not found');

  await addMemberToSubscription(
    subscription.id,
    user.id,
    subscription.price / (subscription.total_members || 1)
  );

  return invitation;
}

export async function declineInvitation(token: string) {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'declined' })
    .eq('token', token);

  if (error) throw error;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

export async function getSubscriptionStats() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Get all user's memberships
  const { data: memberships } = await supabase
    .from('subscription_members')
    .select(`
      *,
      subscription:subscriptions(*)
    `)
    .eq('user_id', user.id);

  if (!memberships) return { totalSpending: 0, totalSavings: 0, activeSubscriptions: 0 };

  const totalSpending = memberships.reduce((sum, m) => sum + Number(m.amount), 0);
  const activeSubscriptions = memberships.filter(m => m.subscription?.is_active).length;

  // Calculate potential savings (assume average individual price is 2x shared price)
  const totalSavings = totalSpending * 0.5;

  return {
    totalSpending,
    totalSavings,
    activeSubscriptions,
  };
}
