import { supabase } from './supabase';
import { getCurrentUser } from './userService';

export interface Payment {
  id: string;
  date: string;
  subscription: string;
  subscriptionId: string;
  member: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  category: string;
  dueDate?: string;
}

/**
 * Obtiene todos los pagos del usuario actualmente autenticado
 * @returns Array de pagos del usuario
 */
export async function getUserPayments(): Promise<Payment[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user');
      return [];
    }

    // Obtener todas las suscripciones activas del usuario
    const { data: subscriptions, error: subError } = await supabase
      .from('subscription_members')
      .select(`
        subscription_id,
        subscription:subscriptions(
          id,
          name,
          is_active
        )
      `)
      .eq('user_id', user.id);

    if (subError) {
      console.error('Error obteniendo suscripciones:', subError);
      return [];
    }

    const activeSubIds = subscriptions
      ?.filter(s => s.subscription?.is_active)
      .map(s => s.subscription_id) || [];

    if (activeSubIds.length === 0) {
      return [];
    }

    // Obtener pagos solo de suscripciones activas
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_date,
        due_date,
        subscription_id,
        subscription:subscriptions (
          id,
          name,
          payment_method
        ),
        member:subscription_members (
          user:profiles (
            full_name
          )
        )
      `)
      .in('subscription_id', activeSubIds)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error obteniendo pagos:', error);
      return [];
    }

    // Mapear los datos al formato esperado
    return (data || []).map((payment: any) => {
      // Mapear los estados de pago
      const statusMap: { [key: string]: 'completed' | 'pending' | 'failed' } = {
        'paid': 'completed',
        'pending': 'pending',
        'auto-paid': 'completed',
        'failed': 'failed'
      };

      return {
        id: payment.id,
        date: payment.payment_date || new Date().toISOString(),
        subscription: payment.subscription?.name || 'Unknown',
        subscriptionId: payment.subscription_id,
        member: payment.member?.user?.full_name || 'Unknown',
        amount: payment.amount,
        status: statusMap[payment.status] || 'pending' as 'completed' | 'pending' | 'failed',
        paymentMethod: payment.subscription?.payment_method || 'Auto-debit',
        category: 'Subscription',
        dueDate: payment.due_date
      };
    });
  } catch (error) {
    console.error('Error en getUserPayments:', error);
    return [];
  }
}

/**
 * Obtiene todos los pagos pendientes del usuario
 * @returns Array de pagos pendientes
 */
export async function getPendingPayments(): Promise<Payment[]> {
  const allPayments = await getUserPayments();
  return allPayments.filter(p => p.status === 'pending');
}

/**
 * Obtiene los pagos de una suscripción específica
 * @param subscriptionId - ID de la suscripción
 * @param status - Estado del pago (optional)
 * @returns Array de pagos
 */
export async function getSubscriptionPayments(
  subscriptionId: string,
  status?: string
): Promise<Payment[]> {
  try {
    let query = supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_date,
        due_date,
        subscription_id,
        subscription:subscriptions (
          id,
          name,
          payment_method
        )
      `)
      .eq('subscription_id', subscriptionId);

    if (status) {
      // Mapear los estados esperados
      const statusMap: { [key: string]: string[] } = {
        'completed': ['paid', 'auto-paid'],
        'pending': ['pending'],
        'failed': ['failed']
      };
      query = query.in('status', statusMap[status] || [status]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo pagos de suscripción:', error);
      return [];
    }

    const statusMap: { [key: string]: 'completed' | 'pending' | 'failed' } = {
      'paid': 'completed',
      'pending': 'pending',
      'auto-paid': 'completed',
      'failed': 'failed'
    };

    return (data || []).map((payment: any) => ({
      id: payment.id,
      date: payment.payment_date 
        ? new Date(payment.payment_date).toISOString()
        : new Date().toISOString(),
      subscription: payment.subscription?.name || 'Unknown',
      subscriptionId: payment.subscription_id,
      member: 'Payment',
      amount: payment.amount,
      status: statusMap[payment.status] || 'pending' as 'completed' | 'pending' | 'failed',
      paymentMethod: payment.subscription?.payment_method || 'Auto-debit',
      category: 'Subscription',
      dueDate: payment.due_date
    }));
  } catch (error) {
    console.error('Error en getSubscriptionPayments:', error);
    return [];
  }
}

/**
 * Registra un nuevo pago
 * @param memberId - ID del miembro
 * @param subscriptionId - ID de la suscripción
 * @param amount - Monto del pago
 * @param paymentMethod - Método de pago
 * @returns ID del pago creado o null si hay error
 */
export async function registerPayment(
  memberId: string,
  subscriptionId: string,
  amount: number,
  paymentMethod: string = 'transfer'
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        member_id: memberId,
        subscription_id: subscriptionId,
        amount: amount,
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error registrando pago:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error en registerPayment:', error);
    return null;
  }
}

/**
 * Actualiza el estado de un pago
 * @param paymentId - ID del pago
 * @param status - Nuevo estado
 * @returns true si se actualiza exitosamente
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: 'paid' | 'pending' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    if (error) {
      console.error('Error actualizando pago:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en updatePaymentStatus:', error);
    return false;
  }
}
