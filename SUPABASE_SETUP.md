# Configuración de Supabase para SubShare

Esta guía te ayudará a configurar Supabase en tu aplicación SubShare.

## 📋 Prerequisitos

Antes de comenzar, necesitas tener instalado:
- Node.js (versión 18 o superior recomendada)
- npm o yarn
- Una cuenta en [Supabase](https://supabase.com)

## 🚀 Paso 1: Instalar Dependencias

Primero, instala las dependencias necesarias de Supabase:

```bash
npm install @supabase/supabase-js
```

O si usas yarn:

```bash
yarn add @supabase/supabase-js
```

## 🔧 Paso 2: Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - Dale un nombre a tu proyecto
   - Establece una contraseña fuerte para la base de datos
   - Selecciona la región más cercana a tus usuarios
   - Espera a que el proyecto se cree (puede tomar 1-2 minutos)

## 🔑 Paso 3: Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (Configuración) en el menú lateral
2. Haz clic en **API**
3. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon public** key (Clave pública anónima)

## 📝 Paso 4: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env` (si no existe):

```bash
cp .env.example .env
```

2. Edita el archivo `.env` y pega tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anonima
```

⚠️ **Importante**: El archivo `.env` ya está en `.gitignore` para que no subas tus credenciales a Git.

## 🗄️ Paso 5: Crear el Esquema de Base de Datos

1. En Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **New Query**
3. Copia todo el contenido del archivo `supabase/schema.sql`
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- ✅ Tablas: profiles, subscriptions, subscription_members, payments, notifications, invitations
- ✅ Políticas de seguridad (RLS - Row Level Security)
- ✅ Índices para mejor rendimiento
- ✅ Triggers para automatización
- ✅ Funciones auxiliares

## 🎨 Paso 6: Verificar la Configuración

1. Inicia tu aplicación en modo desarrollo:

```bash
npm run dev
```

2. Abre tu navegador y ve a `http://localhost:5173`
3. Intenta registrar un nuevo usuario
4. Verifica en Supabase que:
   - El usuario se creó en **Authentication**
   - Se creó un perfil en la tabla **profiles**

## 📚 Estructura de la Base de Datos

### Tablas Principales:

#### `profiles`
Almacena información de los usuarios (extiende `auth.users`)
- id, email, full_name, avatar_url, timestamps

#### `subscriptions`
Almacena las suscripciones compartidas
- id, name, logo, price, billing_cycle, owner_id, next_renewal, payment_method, total_members, is_active, timestamps

#### `subscription_members`
Relación entre usuarios y suscripciones
- id, subscription_id, user_id, amount, is_owner, joined_at

#### `payments`
Historial de pagos
- id, subscription_id, member_id, amount, status, payment_date, due_date, billing_period, timestamps

#### `notifications`
Notificaciones para usuarios
- id, user_id, title, message, type, is_read, related_subscription_id, created_at

#### `invitations`
Invitaciones a suscripciones
- id, subscription_id, inviter_id, invitee_email, status, token, expires_at, created_at

## 🔒 Seguridad (RLS)

Todas las tablas tienen políticas de Row Level Security (RLS) configuradas:
- Los usuarios solo pueden ver sus propios datos
- Los propietarios pueden gestionar sus suscripciones
- Los miembros pueden ver información de las suscripciones en las que participan

## 🛠️ Uso en el Código

### Autenticación:

```typescript
import { signUp, signIn, signOut } from './lib/supabaseApi';

// Registrar usuario
const user = await signUp('email@example.com', 'password', 'Full Name');

// Iniciar sesión
const session = await signIn('email@example.com', 'password');

// Cerrar sesión
await signOut();
```

### Usando Hooks:

```typescript
import { useAuth, useSubscriptions, useNotifications } from './lib/hooks';

function MyComponent() {
  const { user, loading } = useAuth();
  const { subscriptions } = useSubscriptions();
  const { notifications, unreadCount } = useNotifications();

  // Tu código aquí
}
```

### Operaciones CRUD:

```typescript
import { 
  getSubscriptions, 
  createSubscription, 
  updateSubscription,
  deleteSubscription 
} from './lib/supabaseApi';

// Obtener suscripciones
const subs = await getSubscriptions();

// Crear suscripción
const newSub = await createSubscription({
  name: 'Netflix',
  price: 19.99,
  billing_cycle: 'month',
  total_members: 4
});

// Actualizar suscripción
await updateSubscription(subId, { price: 22.99 });

// Eliminar suscripción
await deleteSubscription(subId);
```

## 🔄 Actualizaciones en Tiempo Real

Las tablas están configuradas para actualizaciones en tiempo real. Los hooks como `useSubscriptions()` y `useNotifications()` ya incluyen listeners de tiempo real.

## 📊 Monitoreo

Puedes monitorear tu base de datos desde el panel de Supabase:
- **Database**: Ver tablas y datos
- **Table Editor**: Editar datos manualmente
- **SQL Editor**: Ejecutar consultas SQL
- **Auth**: Ver usuarios registrados
- **Logs**: Ver logs de la API

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo después de modificar `.env`

### Error: "Row Level Security Policy violation"
- Verifica que ejecutaste todo el script `schema.sql`
- Asegúrate de estar autenticado correctamente
- Revisa los logs en Supabase para más detalles

### Las actualizaciones en tiempo real no funcionan
- Verifica que el canal de Realtime esté habilitado en tu proyecto de Supabase
- Ve a **Database** > **Replication** y activa las tablas que necesites

## 📖 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Cliente JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Supabase
2. Revisa la consola del navegador
3. Consulta la documentación oficial de Supabase
4. Abre un issue en el repositorio del proyecto

---

¡Listo! Ahora tu aplicación SubShare está conectada a Supabase y lista para almacenar datos en la nube. 🎉
