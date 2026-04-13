import { supabase } from './supabase';
import { getCurrentUser } from './userService';

export interface Payment {
  id: string;
  date: string;
  subscription: string;
  member: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  category: string;
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

    // Obtener pagos del usuario a través de su membresía en suscripciones
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_date,
        due_date,
        payment_method,
        subscription:subscriptions (
          id,
          name
        ),
        member:subscription_members (
          user:profiles (
            full_name
          )
        )
      `)
      .eq('subscription_members.user_id', user.id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error obteniendo pagos:', error);
      return [];
    }

    // Mapear los datos al formato esperado
    return (data || []).map((payment: any) => ({
      id: payment.id,
      date: payment.payment_date || new Date().toISOString(),
      subscription: payment.subscription?.name || 'Unknown',
      member: payment.member?.user?.full_name || 'Unknown',
      amount: payment.amount,
      status: payment.status as 'completed' | 'pending' | 'failed',
      paymentMethod: payment.payment_method || 'Auto-debit',
      category: 'Subscription'
    }));
  } catch (error) {
    console.error('Error en getUserPayments:', error);
    return [];
  }
}
