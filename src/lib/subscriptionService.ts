import { supabase } from './supabase';
import { validateEmailExists, getProfileByEmail } from './emailService';
import { notifyNewSubscriptionInvitation } from './notificationService';
import { getCurrentUser } from './userService';

export interface SubscriptionInput {
  name: string;
  logo: string;
  price: number;
  billingCycle: 'month' | 'year';
  nextRenewal: Date;
  memberEmails: string[];
  subscriptionEmail?: string;
  subscriptionPassword?: string;
}

export interface SubscriptionMember {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  amount: number;
  isOwner: boolean;
}

/**
 * Crea una nueva suscripción y agrega los miembros validados
 * @param data - Datos de la suscripción
 * @param ownerId - ID del propietario (usuario actual)
 * @returns ID de la suscripción creada o null en caso de error
 */
export async function createSubscriptionWithMembers(
  data: SubscriptionInput,
  ownerId: string
): Promise<string | null> {
  try {
    // Validar que al menos haya un miembro (el propietario)
    if (!ownerId) {
      console.error('Owner ID es requerido');
      return null;
    }

    // Preparar datos base para la suscripción
    const subscriptionData: any = {
      name: data.name,
      logo: data.logo,
      price: data.price,
      billing_cycle: data.billingCycle,
      next_renewal: data.nextRenewal.toISOString().split('T')[0],
      owner_id: ownerId,
      total_members: data.memberEmails.length + 1, // +1 por el propietario
      is_active: true,
    };

    // Agregar campos de credenciales solo si se proporcionan
    if (data.subscriptionEmail) {
      subscriptionData.subscription_email = data.subscriptionEmail;
    }
    if (data.subscriptionPassword) {
      subscriptionData.subscription_password = data.subscriptionPassword;
    }

    // Crear la suscripción
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select('id')
      .single();

    if (subError || !subscription) {
      console.error('Error creando suscripción:', subError);
      
      // Si hay error y tenemos campos de credenciales, reintentar sin ellos
      if (subError && (data.subscriptionEmail || data.subscriptionPassword)) {
        console.log('Reintentando sin campos de credenciales...');
        const basicData = {
          name: data.name,
          logo: data.logo,
          price: data.price,
          billing_cycle: data.billingCycle,
          next_renewal: data.nextRenewal.toISOString().split('T')[0],
          owner_id: ownerId,
          total_members: data.memberEmails.length + 1,
          is_active: true,
        };

        const { data: subscription2, error: subError2 } = await supabase
          .from('subscriptions')
          .insert(basicData)
          .select('id')
          .single();

        if (subError2 || !subscription2) {
          console.error('Error en reintento:', subError2);
          return null;
        }

        // Continuar con subscription2
        const subscriptionId = subscription2.id;
        const costPerPerson = data.price / (data.memberEmails.length + 1);

        // Agregar propietario como miembro
        const { error: ownerMemberError } = await supabase
          .from('subscription_members')
          .insert({
            subscription_id: subscriptionId,
            user_id: ownerId,
            amount: costPerPerson,
            is_owner: true,
          });

        if (ownerMemberError) {
          console.error('Error agregando propietario como miembro:', ownerMemberError);
          await supabase.from('subscriptions').delete().eq('id', subscriptionId);
          return null;
        }

        const validationResults = await validateAndAddMembers(
          subscriptionId,
          data.memberEmails,
          costPerPerson,
          ownerId
        );

        console.log('Resultados de validación:', validationResults);
        return subscriptionId;
      }

      return null;
    }

    const subscriptionId = subscription.id;
    const costPerPerson = data.price / (data.memberEmails.length + 1);

    // Agregar propietario como miembro
    const { error: ownerMemberError } = await supabase
      .from('subscription_members')
      .insert({
        subscription_id: subscriptionId,
        user_id: ownerId,
        amount: costPerPerson,
        is_owner: true,
      });

    if (ownerMemberError) {
      console.error('Error agregando propietario como miembro:', ownerMemberError);
      // Eliminar la suscripción si falla
      await supabase.from('subscriptions').delete().eq('id', subscriptionId);
      return null;
    }

    // Validar y agregar los otros miembros
    const validationResults = await validateAndAddMembers(
      subscriptionId,
      data.memberEmails,
      costPerPerson,
      ownerId
    );

    console.log('Resultados de validación:', validationResults);

    return subscriptionId;
  } catch (error) {
    console.error('Error en createSubscriptionWithMembers:', error);
    return null;
  }
}

/**
 * Valida y agrega miembros a una suscripción
 * @param subscriptionId - ID de la suscripción
 * @param emails - Array de emails a validar y agregar
 * @param amount - Monto a pagar por cada miembro
 * @param ownerId - ID del propietario
 * @returns Objeto con resultados de validación
 */
export async function validateAndAddMembers(
  subscriptionId: string,
  emails: string[],
  amount: number,
  ownerId: string
) {
  const results = {
    added: [] as string[],
    failed: [] as { email: string; reason: string }[],
  };

  for (const email of emails) {
    try {
      // Validar que el email existe
      const exists = await validateEmailExists(email);

      if (!exists) {
        results.failed.push({
          email,
          reason: `El email ${email} no está registrado en el sistema`,
        });
        continue;
      }

      // Obtener el perfil del usuario
      const profile = await getProfileByEmail(email);

      if (!profile) {
        results.failed.push({
          email,
          reason: 'No se pudo obtener el perfil del usuario',
        });
        continue;
      }

      // Solo validar que el usuario existe, no agregarlo aún
      // Las invitaciones se crearán en AddSubscription.tsx
      results.added.push(email);
    } catch (error) {
      console.error(`Error procesando email ${email}:`, error);
      results.failed.push({
        email,
        reason: 'Error inesperado al procesar el email',
      });
    }
  }

  return results;
}

/**
 * Obtiene todas las suscripciones de un usuario
 * @param userId - ID del usuario (opcional, obtiene el actual si no se proporciona)
 * @returns Array de suscripciones
 */
export async function getUserSubscriptions(userId?: string) {
  try {
    let userIdToUse = userId;

    // Si no se proporciona userId, obtener el usuario actual
    if (!userIdToUse) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error obteniendo usuario actual:', userError);
        return [];
      }
      userIdToUse = user.id;
    }

    const { data, error } = await supabase.rpc('get_user_subscriptions', {
      user_id: userIdToUse,
    });

    if (error) {
      console.error('Error obteniendo suscripciones del usuario:', error);
      return [];
    }

    // Mapear datos a formato esperado
    const formattedData = (data || []).map((item: any) => ({
      id: item.subscription_id,
      name: item.name,
      logo: item.logo,
      price: item.price,
      billingCycle: item.billing_cycle,
      nextRenewal: item.next_renewal,
      ownerId: item.owner_id,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      totalMembers: item.total_members,
      payment_method: item.payment_method,
      subscription_email: item.subscription_email,
      subscription_password: item.subscription_password,
      yourShare: item.amount,
      isOwner: item.is_owner,
      members: [],
    }));

    return formattedData;
  } catch (error) {
    console.error('Error en getUserSubscriptions:', error);
    return [];
  }
}

/**
 * Obtiene los miembros de una suscripción
 * @param subscriptionId - ID de la suscripción
 * @returns Array de miembros
 */
export async function getSubscriptionMembers(
  subscriptionId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_members')
      .select(
        `
        id,
        user_id,
        amount,
        is_owner,
        profiles(id, email, full_name, avatar_url)
      `
      )
      .eq('subscription_id', subscriptionId);

    if (error) {
      console.error('Error obteniendo miembros:', error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        memberId: item.id,  // El ID de subscription_members
        id: item.profiles.id,  // El user_id
        email: item.profiles.email,
        name: item.profiles.full_name,
        avatar: item.profiles.avatar_url,
        amount: item.amount,
        status: 'paid' as const,
        isOwner: item.is_owner,
      })) || []
    );
  } catch (error) {
    console.error('Error en getSubscriptionMembers:', error);
    return [];
  }
}

/**
 * Elimina un miembro de una suscripción
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario a eliminar
 * @returns true si se eliminó exitosamente
 */
export async function removeSubscriptionMember(
  subscriptionId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('leave_subscription', {
      sub_id: subscriptionId,
    });

    if (error) {
      console.error('Error eliminando miembro:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error en removeSubscriptionMember:', error);
    return false;
  }
}

/**
 * Verifica si el usuario actual es el dueño de la suscripción
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario a verificar
 * @returns true si es el dueño, false en caso contrario
 */
export async function isSubscriptionOwner(
  subscriptionId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('owner_id')
      .eq('id', subscriptionId)
      .single();

    if (error || !data) {
      console.error('Error obteniendo dueño de suscripción:', error);
      return false;
    }

    return data.owner_id === userId;
  } catch (error) {
    console.error('Error en isSubscriptionOwner:', error);
    return false;
  }
}

/**
 * Actualiza una suscripción existente
 * @param subscriptionId - ID de la suscripción
 * @param updates - Objeto con los campos a actualizar
 * @returns true si se actualiza exitosamente, false en caso contrario
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: {
    name?: string;
    price?: number;
    billing_cycle?: 'month' | 'year';
    next_renewal?: string;
    subscription_email?: string;
    subscription_password?: string;
  }
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('update_user_subscription', {
      sub_id: subscriptionId,
      sub_name: updates.name || '',
      sub_price: updates.price || 0,
      sub_billing_cycle: updates.billing_cycle || 'month',
      sub_next_renewal: updates.next_renewal || null,
      sub_email: updates.subscription_email || null,
      sub_password: updates.subscription_password || null,
    });

    if (error) {
      console.error('Error actualizando suscripción:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error en updateSubscription:', error);
    return false;
  }
}

/**
 * Permite a un miembro salirse de una suscripción (no puede ser el dueño)
 * @param subscriptionId - ID de la suscripción
 * @returns true si se retira exitosamente, false si hay error o es dueño
 */
export async function leaveSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // Obtener usuario actual
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No hay usuario autenticado');
      return false;
    }

    console.log('Intentando salirse de suscripción:', subscriptionId, 'Usuario:', currentUser.id);

    // Primero intentar eliminar la suscripción completa (si es dueño)
    const { error: deleteSubError, count: deletedCount } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('owner_id', currentUser.id);

    // Si se eliminó la suscripción, retornar éxito
    if (!deleteSubError && deletedCount && deletedCount > 0) {
      console.log('Suscripción eliminada como dueño');
      return true;
    }

    // Si no es dueño, intentar remover solo como miembro
    console.log('Intentando remover como miembro');
    const { error: memberError, count: memberDeletedCount } = await supabase
      .from('subscription_members')
      .delete()
      .eq('subscription_id', subscriptionId)
      .eq('user_id', currentUser.id);

    if (!memberError && memberDeletedCount && memberDeletedCount > 0) {
      console.log('Usuario eliminado como miembro');
      return true;
    }

    console.error('No se pudo eliminar al usuario');
    return false;
  } catch (error) {
    console.error('Error en leaveSubscription:', error);
    return false;
  }
}

/**
 * Elimina una suscripción (solo si eres el dueño)
 * @param subscriptionId - ID de la suscripción a eliminar
 * @returns true si se elimina exitosamente, false si hay error
 */
export async function deleteSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('delete_user_subscription', {
      sub_id: subscriptionId,
    });

    if (error) {
      console.error('Error eliminando suscripción:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error en deleteSubscription:', error);
    return false;
  }
}
