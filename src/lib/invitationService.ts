import { supabase } from './supabase';
import { createNotification } from './notificationService';

export interface Invitation {
  id: string;
  subscription_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  subscription_name?: string;
  inviter_name?: string;
}

/**
 * Crea una invitación para un usuario a una suscripción
 * @param subscriptionId - ID de la suscripción
 * @param inviterId - ID del usuario que invita
 * @param inviteeEmail - Email del usuario invitado
 * @param inviteeName - Nombre del usuario que invita
 * @param subscriptionName - Nombre de la suscripción
 */
export async function createInvitation(
  subscriptionId: string,
  inviterId: string,
  inviteeEmail: string,
  inviteeName: string,
  subscriptionName: string
): Promise<boolean> {
  try {
    // Generar token único
    const token = `${subscriptionId}-${inviteeEmail}-${Date.now()}`;

    // Crear invitación en BD
    const { error: invError } = await supabase
      .from('invitations')
      .insert({
        subscription_id: subscriptionId,
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
        status: 'pending',
        token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      });

    if (invError) {
      console.error('Error creando invitación:', invError);
      return false;
    }

    // Obtener el perfil del usuario invitado por email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteeEmail)
      .single();

    if (profile) {
      // Crear notificación para el usuario invitado
      await createNotification({
        userId: profile.id,
        title: `¡${inviteeName} te invitó a ${subscriptionName}! 🎉`,
        message: `${inviteeName} te ha invitado a unirte a la suscripción "${subscriptionName}". ¿Aceptas la invitación?`,
        type: 'invitation',
        relatedSubscriptionId: subscriptionId,
      });
    }

    return true;
  } catch (error) {
    console.error('Error en createInvitation:', error);
    return false;
  }
}

/**
 * Obtiene las invitaciones pendientes para un usuario
 * @param userEmail - Email del usuario
 * @returns Array de invitaciones pendientes
 */
export async function getPendingInvitations(userEmail: string): Promise<Invitation[]> {
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select(
        `
        id,
        subscription_id,
        inviter_id,
        invitee_email,
        status,
        created_at,
        subscriptions (
          id,
          name
        ),
        inviter:profiles (
          full_name
        )
        `
      )
      .eq('invitee_email', userEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo invitaciones:', error);
      return [];
    }

    return (data || []).map((inv: any) => ({
      id: inv.id,
      subscription_id: inv.subscription_id,
      inviter_id: inv.inviter_id,
      invitee_email: inv.invitee_email,
      status: inv.status,
      created_at: inv.created_at,
      subscription_name: inv.subscriptions?.name,
      inviter_name: inv.inviter?.full_name,
    }));
  } catch (error) {
    console.error('Error en getPendingInvitations:', error);
    return [];
  }
}

/**
 * Acepta una invitación y agrega al usuario a la suscripción
 * @param invitationId - ID de la invitación
 * @param userId - ID del usuario que acepta
 * @returns true si se aceptó exitosamente
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<boolean> {
  try {
    // Obtener los detalles de la invitación
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('subscription_id')
      .eq('id', invitationId)
      .single();

    if (invError || !invitation) {
      console.error('Error obteniendo invitación:', invError);
      return false;
    }

    const subscriptionId = invitation.subscription_id;

    // Obtener información de la suscripción para calcular el costo
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('price, total_members')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('Error obteniendo suscripción:', subError);
      return false;
    }

    const costPerPerson = subscription.price / subscription.total_members;

    // Agregar usuario a subscription_members
    const { error: memberError } = await supabase
      .from('subscription_members')
      .insert({
        subscription_id: subscriptionId,
        user_id: userId,
        amount: costPerPerson,
        is_owner: false,
      });

    if (memberError) {
      console.error('Error agregando miembro:', memberError);
      return false;
    }

    // Actualizar estado de invitación a 'accepted'
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error actualizando invitación:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en acceptInvitation:', error);
    return false;
  }
}

/**
 * Rechaza una invitación
 * @param invitationId - ID de la invitación
 * @returns true si se rechazó exitosamente
 */
export async function declineInvitation(invitationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);

    if (error) {
      console.error('Error rechazando invitación:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en declineInvitation:', error);
    return false;
  }
}
