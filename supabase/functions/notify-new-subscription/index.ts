/**
 * Supabase Edge Function: notify-new-subscription
 * 
 * Se ejecuta automáticamente cuando se agrega un usuario a una suscripción.
 * Envía una notificación al usuario notificándole sobre la nueva suscripción.
 * 
 * Setup:
 *   Deploy:  supabase functions deploy notify-new-subscription
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userId: string;
  subscriptionId: string;
  inviterId: string;
}

async function notifyNewSubscription(req: Request) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, subscriptionId, inviterId }: RequestBody = await req.json();

    if (!userId || !subscriptionId || !inviterId) {
      return new Response(
        JSON.stringify({ error: 'Parámetros requeridos faltantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener datos de la suscripción
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('name, owner_id')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('Error obteniendo suscripción:', subError);
      return new Response(
        JSON.stringify({ error: 'Suscripción no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener nombre del invitador
    const { data: inviter, error: inviterError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', inviterId)
      .single();

    if (inviterError || !inviter) {
      console.error('Error obteniendo perfil del invitador:', inviterError);
      return new Response(
        JSON.stringify({ error: 'Perfil del invitador no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear notificación
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '¡Nuevo plan compartido! 🎉',
        message: `${inviter.full_name || 'Un usuario'} te ha agregado a "${subscription.name}". ¡Revisa los detalles de tu nueva membresía!`,
        type: 'invitation',
        related_subscription_id: subscriptionId,
        is_read: false,
      })
      .select('id')
      .single();

    if (notifError) {
      console.error('Error creando notificación:', notifError);
      return new Response(
        JSON.stringify({ error: 'Error al crear notificación' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationId: notification.id,
        message: 'Notificación enviada correctamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en notifyNewSubscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Deno.serve ya está disponible en Supabase Edge Runtime
Deno.serve(notifyNewSubscription);
