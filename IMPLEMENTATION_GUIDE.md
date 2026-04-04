# Guía de Implementación - SubShare

## Resumen de Cambios

Se han implementado las 3 funcionalidades solicitadas:

1. ✅ **Validación de Emails** - Al agregar usuarios a una suscripción
2. ✅ **Notificaciones de Nueva Suscripción** - Cuando se agrega un usuario
3. ✅ **Notificaciones de Pagos Pendientes** - 3 días antes del vencimiento

## Estructura de Archivos Creados

### Servicios Frontend (`src/lib/`)

- **`supabase.ts`** - Cliente Supabase configurado
- **`emailService.ts`** - Validación y búsqueda de emails en la BD
- **`notificationService.ts`** - Crear y gestionar notificaciones
- **`subscriptionService.ts`** - Crear suscripciones con validación de miembros

### Funciones Edge de Supabase (`supabase/functions/`)

- **`notify-new-subscription/index.ts`** - Se ejecuta cuando se agrega un usuario a una suscripción
- **`check-payments-due/index.ts`** - Se ejecuta periódicamente para notificar pagos vencidos

### Componentes Actualizados

- **`AddSubscription.tsx`** - Integrado con validación de emails y feedback visual

## Pasos de Configuración

### 1. Desplegar Funciones Edge de Supabase

```bash
# Desplegar función de notificación de nueva suscripción
supabase functions deploy notify-new-subscription

# Desplegar función de verificación de pagos
supabase functions deploy check-payments-due
```

### 2. Configurar Cron Job para Verificación de Pagos

Para que la función `check-payments-due` se ejecute automáticamente cada día:

1. Ir a Supabase Dashboard → Project Settings → Cron Jobs
2. Crear un nuevo cron job:
   - **Function**: `check-payments-due`
   - **Schedule**: `0 9 * * *` (cada día a las 9 AM UTC)
   - **Method**: POST

### 3. Configurar Trigger Automático para Nueva Suscripción

Se recomienda crear un trigger en la BD que ejecute la función cuando se inserte en `subscription_members`:

```sql
-- Crear función que llame a la edge function
CREATE OR REPLACE FUNCTION public.notify_on_member_added()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_owner_email text;
BEGIN
  -- Obtener el ID del propietario de la suscripción
  SELECT owner_id INTO v_owner_id
  FROM public.subscriptions
  WHERE id = NEW.subscription_id;

  -- Si no es el propietario agregándose a sí mismo, enviar notificación
  IF NEW.user_id != v_owner_id THEN
    SELECT email INTO v_owner_email
    FROM public.profiles
    WHERE id = v_owner_id;

    -- Aquí puedes hacer una llamada HTTP a la edge function
    -- o simplemente insertar en notificaciones directamente
    INSERT INTO public.notifications (user_id, title, message, type, related_subscription_id, is_read)
    VALUES (
      NEW.user_id,
      '¡Nuevo plan compartido! 🎉',
      'Te han agregado a una nueva suscripción',
      'invitation',
      NEW.subscription_id,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS on_subscription_member_added ON public.subscription_members;
CREATE TRIGGER on_subscription_member_added
  AFTER INSERT ON public.subscription_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_member_added();
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://vjnynuromqiatlopetsl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Cómo Funciona Cada Funcionalidad

### 1. Validación de Emails

**Flujo:**
1. Usuario ingresa un email en el componente `AddSubscription`
2. Se valida contra la tabla `profiles` en Supabase
3. Se muestra feedback visual (✓ válido o ✗ inválido)
4. Solo se pueden guardar suscripciones con emails válidos

**Código relevante:**
- `emailService.ts` → `validateEmailExists()`
- `AddSubscription.tsx` → `handleAddMember()`

### 2. Notificaciones de Nueva Suscripción

**Flujo:**
1. Se crea `subscription_members` con el nuevo usuario
2. Se ejecuta el trigger `notify_on_member_added()`
3. Se inserta una notificación en la tabla `notifications`
4. El usuario ve la notificación en `NotificationPanel`

**Código relevante:**
- `subscriptionService.ts` → `validateAndAddMembers()` y `notifyNewSubscriptionInvitation()`
- Trigger SQL: `notify_on_member_added`

### 3. Notificaciones de Pagos Pendientes (3 días)

**Flujo:**
1. El cron job ejecuta `check-payments-due` diariamente
2. Busca pagos con estado 'pending' que vencen en ±3 días
3. Para cada pago, crea una notificación
4. El usuario recibe la notificación

**Código relevante:**
- `supabase/functions/check-payments-due/index.ts`
- Debe ejecutarse diariamente vía cron

## Testing

### Test de Validación de Emails

```typescript
// En la consola del navegador o en un test file
import { validateEmailExists, getProfileByEmail } from './lib/emailService';

// Validar email que existe
const exists = await validateEmailExists('user@example.com');
console.log('Email existe:', exists);

// Obtener perfil
const profile = await getProfileByEmail('user@example.com');
console.log('Perfil:', profile);
```

### Test de Notificaciones

```typescript
import { getUserNotifications, markNotificationAsRead } from './lib/notificationService';

// Obtener notificaciones sin leer
const notifications = await getUserNotifications('USER_ID');
console.log('Notificaciones:', notifications);

// Marcar como leída
await markNotificationAsRead('NOTIFICATION_ID');
```

## Base de Datos

### Tablas Utilizadas

- **`profiles`** - Almacena información de usuarios
- **`subscriptions`** - Las suscripciones compartidas
- **`subscription_members`** - Relación entre usuarios y suscripciones
- **`payments`** - Información de pagos
- **`notifications`** - Todas las notificaciones

### Esquema de Notificaciones

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT IN ('payment', 'reminder', 'invitation', 'update'),
  is_read BOOLEAN DEFAULT false,
  related_subscription_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Próximos Pasos (Opcional)

1. **Envío de Emails** - Modificar `check-payments-due` para enviar emails vía Resend (como en `send-invitation`)
2. **Webhooks** - Crear webhooks para notificaciones en tiempo real
3. **Push Notifications** - Implementar notificaciones push para apps móviles
4. **Dashboard de Análisis** - Crear reportes sobre notificaciones y pagos

## Solución de Problemas

### Las notificaciones no se crean

1. Verificar que los triggers estén habilitados
2. Revisar los logs de la BD
3. Comprobar que RLS de `notifications` permite inserciones

### Los emails no validan correctamente

1. Asegurar que sean emails únicos en la tabla `profiles`
2. Verificar el estado de RLS en la tabla `profiles`
3. Comprobar la consulta SQL en `emailService.ts`

### El cron job no se ejecuta

1. Verificar que esté correctamente programado en Supabase
2. Revisar los logs de edge functions
3. Comprobar que la BD esté activa
