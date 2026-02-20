-- Script para insertar datos de prueba en Supabase
-- Ejecuta este script DESPUÉS de haber registrado al menos un usuario en la aplicación

-- Este script asume que ya tienes un usuario registrado
-- Reemplaza 'TU_USER_ID' con el ID real de tu usuario desde auth.users

-- 1. Crear algunas suscripciones de prueba
INSERT INTO public.subscriptions (name, logo, price, billing_cycle, owner_id, next_renewal, payment_method, total_members, is_active)
VALUES 
  ('Netflix Premium', 'N', 19.99, 'month', 'TU_USER_ID', '2026-03-15', 'Auto-renewal', 4, true),
  ('Spotify Family', 'S', 16.99, 'month', 'TU_USER_ID', '2026-03-20', 'Auto-renewal', 6, true),
  ('YouTube Premium', 'Y', 22.99, 'month', 'TU_USER_ID', '2026-03-25', 'Manual payment', 5, true),
  ('Disney+', 'D', 12.99, 'month', 'TU_USER_ID', '2026-03-10', 'Auto-renewal', 4, true);

-- 2. Nota: Los miembros ya se crean automáticamente cuando creas una suscripción
-- gracias al trigger en la función createSubscription()

-- 3. Crear algunas notificaciones de prueba
INSERT INTO public.notifications (user_id, title, message, type, is_read, related_subscription_id)
VALUES 
  ('TU_USER_ID', 'Payment Received', 'Bob paid for Netflix subscription', 'payment', false, (SELECT id FROM subscriptions WHERE name = 'Netflix Premium' LIMIT 1)),
  ('TU_USER_ID', 'Payment Pending', 'Reminder: Charlie needs to pay for Spotify', 'reminder', false, (SELECT id FROM subscriptions WHERE name = 'Spotify Family' LIMIT 1)),
  ('TU_USER_ID', 'New Member', 'Alice joined your YouTube Premium plan', 'update', true, (SELECT id FROM subscriptions WHERE name = 'YouTube Premium' LIMIT 1));

-- 4. Para obtener tu USER_ID, ejecuta esta consulta en Supabase SQL Editor:
-- SELECT id, email FROM auth.users;
-- Luego reemplaza 'TU_USER_ID' con el id que obtengas

-- 5. Después de insertar las suscripciones, puedes añadir miembros adicionales manualmente:
-- Primero necesitas tener más usuarios registrados, o puedes crear perfiles de prueba

-- Crear perfiles de prueba (opcional - solo para desarrollo):
-- INSERT INTO public.profiles (id, email, full_name, avatar_url)
-- VALUES 
--   (gen_random_uuid(), 'alice@example.com', 'Alice Johnson', 'https://i.pravatar.cc/150?img=1'),
--   (gen_random_uuid(), 'bob@example.com', 'Bob Smith', 'https://i.pravatar.cc/150?img=2'),
--   (gen_random_uuid(), 'charlie@example.com', 'Charlie Brown', 'https://i.pravatar.cc/150?img=3');

-- Nota: Los perfiles de prueba no tendrán credenciales de autenticación,
-- son solo para mostrar datos en la interfaz. Para usuarios reales, usa el registro normal.
