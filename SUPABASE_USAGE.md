# Integración con Supabase - Guía de Uso

Esta es una guía rápida de cómo usar las funciones de Supabase ya implementadas en tu aplicación SubShare.

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── supabase.ts          # Cliente de Supabase configurado
│   ├── database.types.ts    # Tipos TypeScript generados de la DB
│   ├── supabaseApi.ts       # Funciones de API para CRUD
│   └── hooks.ts             # React hooks para usar en componentes
```

## 🎯 Uso de Hooks de React

Los hooks facilitan el uso de Supabase en tus componentes React:

### `useAuth()` - Autenticación

```tsx
import { useAuth } from './lib/hooks';

function MyComponent() {
  const { user, session, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  
  return <div>Hola {user.email}</div>;
}
```

### `useProfile()` - Perfil del Usuario

```tsx
import { useProfile } from './lib/hooks';

function ProfileComponent() {
  const { profile, loading } = useProfile();
  
  if (loading) return <div>Cargando perfil...</div>;
  
  return (
    <div>
      <h2>{profile?.full_name}</h2>
      <img src={profile?.avatar_url} alt="Avatar" />
    </div>
  );
}
```

### `useSubscriptions()` - Suscripciones

```tsx
import { useSubscriptions } from './lib/hooks';

function SubscriptionsComponent() {
  const { subscriptions, loading, refetch } = useSubscriptions();
  
  if (loading) return <div>Cargando suscripciones...</div>;
  
  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.id}>{sub.name} - ${sub.price}</div>
      ))}
      <button onClick={refetch}>Recargar</button>
    </div>
  );
}
```

### `useNotifications()` - Notificaciones

```tsx
import { useNotifications } from './lib/hooks';

function NotificationsComponent() {
  const { notifications, unreadCount, loading } = useNotifications();
  
  return (
    <div>
      <span>Notificaciones no leídas: {unreadCount}</span>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.title}: {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Funciones de API

Todas las funciones disponibles en `supabaseApi.ts`:

### Autenticación

```tsx
import { signUp, signIn, signOut, getCurrentUser } from './lib/supabaseApi';

// Registrar
await signUp('user@email.com', 'password123', 'Full Name');

// Iniciar sesión
await signIn('user@email.com', 'password123');

// Cerrar sesión
await signOut();

// Usuario actual
const user = await getCurrentUser();
```

### Suscripciones

```tsx
import { 
  getSubscriptions, 
  createSubscription, 
  updateSubscription,
  deleteSubscription 
} from './lib/supabaseApi';

// Listar suscripciones
const subs = await getSubscriptions();

// Crear suscripción
const newSub = await createSubscription({
  name: 'Netflix Premium',
  logo: 'N',
  price: 19.99,
  billing_cycle: 'month',
  total_members: 4,
  next_renewal: '2026-04-01',
  payment_method: 'Auto-renewal'
});

// Actualizar suscripción
await updateSubscription(subId, { 
  price: 22.99,
  total_members: 5 
});

// Eliminar suscripción
await deleteSubscription(subId);
```

### Miembros

```tsx
import { 
  getSubscriptionMembers,
  addMemberToSubscription,
  removeMemberFromSubscription,
  updateMemberAmount
} from './lib/supabaseApi';

// Obtener miembros de una suscripción
const members = await getSubscriptionMembers(subscriptionId);

// Añadir miembro
await addMemberToSubscription(subscriptionId, userId, 5.00, false);

// Actualizar monto de miembro
await updateMemberAmount(memberId, 6.00);

// Eliminar miembro
await removeMemberFromSubscription(memberId);
```

### Pagos

```tsx
import { 
  getPaymentsBySubscription,
  getPaymentsByUser,
  createPayment,
  updatePaymentStatus
} from './lib/supabaseApi';

// Pagos por suscripción
const payments = await getPaymentsBySubscription(subscriptionId);

// Pagos del usuario
const myPayments = await getPaymentsByUser();

// Crear pago
await createPayment({
  subscription_id: subId,
  member_id: memberId,
  amount: 5.00,
  status: 'pending',
  due_date: '2026-03-01'
});

// Actualizar estado del pago
await updatePaymentStatus(paymentId, 'paid', '2026-02-28');
```

### Notificaciones

```tsx
import { 
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
} from './lib/supabaseApi';

// Obtener notificaciones
const notifications = await getNotifications();

// Marcar como leída
await markNotificationAsRead(notificationId);

// Marcar todas como leídas
await markAllNotificationsAsRead();

// Crear notificación
await createNotification({
  user_id: userId,
  title: 'Payment Reminder',
  message: 'Your payment is due soon',
  type: 'reminder',
  related_subscription_id: subId
});
```

### Invitaciones

```tsx
import { 
  createInvitation,
  getInvitation,
  acceptInvitation,
  declineInvitation
} from './lib/supabaseApi';

// Crear invitación
const invitation = await createInvitation(
  subscriptionId, 
  'friend@email.com',
  7 // días para expirar
);

// Obtener invitación por token
const invite = await getInvitation(token);

// Aceptar invitación
await acceptInvitation(token);

// Rechazar invitación
await declineInvitation(token);
```

## 🔄 Actualizaciones en Tiempo Real

Los hooks `useSubscriptions()` y `useNotifications()` ya incluyen listeners de tiempo real. Los cambios en la base de datos se reflejan automáticamente en tu interfaz.

Si quieres añadir tiempo real a otros componentes:

```tsx
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // 'INSERT', 'UPDATE', 'DELETE', o '*' para todos
        schema: 'public',
        table: 'subscriptions',
      },
      (payload) => {
        console.log('Cambio detectado:', payload);
        // Actualizar tu estado aquí
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## 🛡️ Manejo de Errores

Todas las funciones lanzan errores que deberías capturar:

```tsx
try {
  const user = await signIn(email, password);
  console.log('Login exitoso', user);
} catch (error) {
  console.error('Error al iniciar sesión:', error.message);
  // Mostrar mensaje de error al usuario
}
```

O usando async/await en componentes:

```tsx
const handleLogin = async () => {
  try {
    await signIn(email, password);
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

## 📊 Ejemplos Completos

### Ejemplo: Componente de Login

```tsx
import { useState } from 'react';
import { signIn } from './lib/supabaseApi';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirigir o actualizar estado
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### Ejemplo: Crear Suscripción

```tsx
import { useState } from 'react';
import { createSubscription } from './lib/supabaseApi';

function CreateSubscription() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSub = await createSubscription({
        name,
        price: parseFloat(price),
        billing_cycle: 'month',
        total_members: 1
      });
      
      console.log('Suscripción creada:', newSub);
      // Limpiar formulario o redirigir
      setName('');
      setPrice('');
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la suscripción"
        required
      />
      <input 
        type="number" 
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Precio"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Suscripción'}
      </button>
    </form>
  );
}
```

## 🔍 Debugging

Para ver qué está pasando con Supabase:

```tsx
// Activar logs de Supabase
import { supabase } from './lib/supabase';

// Ver el estado actual del auth
supabase.auth.getSession().then(({ data }) => {
  console.log('Sesión actual:', data);
});

// Ver el usuario actual
supabase.auth.getUser().then(({ data }) => {
  console.log('Usuario actual:', data);
});
```

## 📚 Recursos

- [Documentación completa de Supabase](https://supabase.com/docs)
- [Referencia del cliente JavaScript](https://supabase.com/docs/reference/javascript)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

¡Listo para construir con Supabase! 🚀
