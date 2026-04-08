import { supabase } from './supabase';

export type NotificationType = 'payment' | 'reminder' | 'invitation' | 'update';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedSubscriptionId?: string;
}

/**
 * Crea una notificación en la base de datos
 * @param data - Datos de la notificación
 * @returns true si se creó exitosamente, false en caso contrario
 */
export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      related_subscription_id: data.relatedSubscriptionId || null,
      is_read: false,
    });

    if (error) {
      console.error('Error creando notificación:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en createNotification:', error);
    return false;
  }
}

/**
 * Obtiene las notificaciones no leídas de un usuario
 * @param userId - ID del usuario
 * @returns Array de notificaciones no leídas
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error en getUnreadNotifications:', error);
    return [];
  }
}

/**
 * Marca una notificación como leída
 * @param notificationId - ID de la notificación
 * @returns true si se marcó exitosamente
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marcando notificación como leída:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en markNotificationAsRead:', error);
    return false;
  }
}

/**
 * Marca todas las notificaciones como leídas para un usuario
 * @param userId - ID del usuario
 * @returns true si se marcaron exitosamente
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marcando notificaciones como leídas:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en markAllNotificationsAsRead:', error);
    return false;
  }
}

/**
 * Notifica a un usuario cuando se agrega a una suscripción
 * @param userId - ID del usuario
 * @param subscriptionName - Nombre de la suscripción
 * @param subscriptionId - ID de la suscripción
 * @param inviterName - Nombre de quien lo invitó
 */
export async function notifyNewSubscriptionInvitation(
  userId: string,
  subscriptionName: string,
  subscriptionId: string,
  inviterName: string
): Promise<boolean> {
  return createNotification({
    userId,
    title: `¡Nuevo plan compartido! 🎉`,
    message: `${inviterName} te ha agregado a "${subscriptionName}". ¡Revisa los detalles de tu nueva membresía!`,
    type: 'invitation',
    relatedSubscriptionId: subscriptionId,
  });
}

/**
 * Notifica a un usuario sobre un pago pendiente que vence en 3 días
 * @param userId - ID del usuario
 * @param subscriptionName - Nombre de la suscripción
 * @param amount - Monto a pagar
 * @param dueDate - Fecha de vencimiento
 * @param subscriptionId - ID de la suscripción
 */
export async function notifyPaymentDueIn3Days(
  userId: string,
  subscriptionName: string,
  amount: number,
  dueDate: string,
  subscriptionId: string
): Promise<boolean> {
  return createNotification({
    userId,
    title: `Recordatorio de pago ⏰`,
    message: `Tu pago de €${amount.toFixed(2)} para "${subscriptionName}" vence en 3 días (${dueDate}). ¡No olvides realizar el pago!`,
    type: 'reminder',
    relatedSubscriptionId: subscriptionId,
  });
}

/**
 * Obtiene todas las notificaciones de un usuario (paginado)
 * @param userId - ID del usuario
 * @param limit - Límite de resultados
 * @param offset - Offset para paginación
 */
export async function getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error obteniendo notificaciones del usuario:', error);
      return { notifications: [], total: 0 };
    }

    return { notifications: data || [], total: count || 0 };
  } catch (error) {
    console.error('Error en getUserNotifications:', error);
    return { notifications: [], total: 0 };
  }
}
