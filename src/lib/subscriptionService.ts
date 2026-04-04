import { supabase } from './supabase';
import { validateEmailExists, getProfileByEmail } from './emailService';
import { notifyNewSubscriptionInvitation } from './notificationService';

export interface SubscriptionInput {
  name: string;
  logo: string;
  price: number;
  billingCycle: 'month' | 'year';
  nextRenewal: Date;
  memberEmails: string[];
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

    // Crear la suscripción
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        name: data.name,
        logo: data.logo,
        price: data.price,
        billing_cycle: data.billingCycle,
        next_renewal: data.nextRenewal.toISOString().split('T')[0],
        owner_id: ownerId,
        total_members: data.memberEmails.length + 1, // +1 por el propietario
        is_active: true,
      })
      .select('id')
      .single();

    if (subError || !subscription) {
      console.error('Error creando suscripción:', subError);
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

      // Agregar el miembro a la suscripción
      const { error: memberError } = await supabase
        .from('subscription_members')
        .insert({
          subscription_id: subscriptionId,
          user_id: profile.id,
          amount,
          is_owner: false,
        });

      if (memberError) {
        // Verificar si es un error de duplicado
        if (memberError.code === '23505') {
          results.failed.push({
            email,
            reason: 'Este usuario ya está en la suscripción',
          });
        } else {
          results.failed.push({
            email,
            reason: `Error al agregar: ${memberError.message}`,
          });
        }
        continue;
      }

      // Enviar notificación al nuevo miembro
      const ownerProfile = await getProfileByEmail(
        (await supabase.from('profiles').select('email').eq('id', ownerId).single()).data?.email || ''
      );

      const ownerName = ownerProfile?.full_name || 'Un usuario';

      // Obtener nombre de la suscripción
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('name')
        .eq('id', subscriptionId)
        .single();

      const subscriptionName = subscription?.name || 'una suscripción';

      await notifyNewSubscriptionInvitation(
        profile.id,
        subscriptionName,
        subscriptionId,
        ownerName
      );

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
 * @param userId - ID del usuario
 * @returns Array de suscripciones
 */
export async function getUserSubscriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscription_members')
      .select(
        `
        subscription:subscriptions(
          id,
          name,
          logo,
          price,
          billing_cycle,
          next_renewal,
          owner_id,
          is_active,
          created_at,
          updated_at
        ),
        amount,
        is_owner
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo suscripciones del usuario:', error);
      return [];
    }

    return data || [];
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
): Promise<SubscriptionMember[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_members')
      .select(
        `
        id,
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
        id: item.profiles.id,
        email: item.profiles.email,
        full_name: item.profiles.full_name,
        avatar_url: item.profiles.avatar_url,
        amount: item.amount,
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
    const { error } = await supabase
      .from('subscription_members')
      .delete()
      .eq('subscription_id', subscriptionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error eliminando miembro:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en removeSubscriptionMember:', error);
    return false;
  }
}
