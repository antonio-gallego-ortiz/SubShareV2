/**
 * Supabase Edge Function: check-payments-due
 * 
 * Se ejecuta periódicamente (via cron o manualmente) para verificar pagos
 * que vencen en 3 días y enviar notificaciones a los usuarios.
 * 
 * Setup:
 *   Deploy: supabase functions deploy check-payments-due
 *   Configurar cron job en Supabase para ejecutarlo diariamente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkPaymentsDue(req: Request) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calcular la fecha de hoy y la fecha de 3 días
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Formato YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    console.log(`Buscando pagos entre ${todayStr} y ${threeDaysStr}`);

    // Obtener pagos pendientes que vencen en 3 días
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        due_date,
        subscription_id,
        member_id,
        subscription_members(
          user_id,
          subscriptions(name)
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', todayStr)
      .lte('due_date', threeDaysStr);

    if (paymentsError) {
      console.error('Error obteniendo pagos pendientes:', paymentsError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener pagos' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Se encontraron ${pendingPayments?.length || 0} pagos pendientes`);

    if (!pendingPayments || pendingPayments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No hay pagos pendientes en los próximos 3 días'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Procesar notificaciones para cada pago
    const notificationResults = [];

    for (const payment of pendingPayments) {
      try {
        // Obtener información del miembro
        const memberData = (payment as any).subscription_members;
        const userId = memberData?.user_id;
        const subscriptionName = memberData?.subscriptions?.name || 'Suscripción';

        if (!userId) {
          console.warn(`No se encontró usuario para el pago ${payment.id}`);
          continue;
        }

        // Crear notificación
        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Recordatorio de pago ⏰',
            message: `Tu pago de $${parseFloat(payment.amount).toFixed(2)} para "${subscriptionName}" vence el ${payment.due_date}. ¡No olvides realizar el pago!`,
            type: 'reminder',
            related_subscription_id: payment.subscription_id,
            is_read: false,
          })
          .select('id')
          .single();

        if (notifError) {
          console.error(`Error creando notificación para pago ${payment.id}:`, notifError);
          notificationResults.push({ paymentId: payment.id, success: false, error: notifError.message });
        } else {
          console.log(`Notificación creada exitosamente para pago ${payment.id}`);
          notificationResults.push({ paymentId: payment.id, success: true, notificationId: notification.id });
        }
      } catch (error) {
        console.error(`Error procesando pago ${payment.id}:`, error);
        notificationResults.push({ 
          paymentId: payment.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        });
      }
    }

    const successCount = notificationResults.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${successCount}/${notificationResults.length} notificaciones enviadas exitosamente`,
        results: notificationResults,
        paymentsProcessed: pendingPayments.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en checkPaymentsDue:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Deno.serve ya está disponible en Supabase Edge Runtime
Deno.serve(checkPaymentsDue);
