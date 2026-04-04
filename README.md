
# SubShare

Una plataforma web para compartir y gestionar suscripciones entre múltiples usuarios. El proyecto original está disponible en https://www.figma.com/design/7DQ6zar5m93Dk42sQmm5Ki/SubShare.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración de Supabase](#configuración-de-supabase)
- [Ejecución](#ejecución)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Servicios Implementados](#servicios-implementados)
- [Edge Functions](#edge-functions)

## 🔧 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (v16 o superior): [Descargar](https://nodejs.org/)
- **npm**: Se instala automáticamente con Node.js
- **Git**: Para clonar el repositorio
- **Cuenta de Supabase**: [Crear cuenta gratuita](https://supabase.com)

Verifica que tienes las versiones correctas:

```bash
node --version
npm --version
git --version
```

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd SubShareV2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar dependencia de Supabase (si no está presente)

```bash
npm install @supabase/supabase-js
```

## 🔐 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Accede a [https://supabase.com](https://supabase.com)
2. Crea una nueva organización y proyecto
3. Ten a mano la URL del proyecto y la clave anónima (anonKey)

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Reemplaza los valores con tus credenciales de Supabase.

### 3. Inicializar la base de datos

```bash
# Puedes usar la interfaz de Supabase SQL Editor para ejecutar:
# Navega a SQL Editor en el dashboard de Supabase
# Copia y ejecuta el contenido de supabase/schema.sql
```

O usando Supabase CLI:

```bash
supabase db push
```

### 4. Llenar datos de prueba (opcional)

```bash
# En el SQL Editor de Supabase, ejecuta:
# El contenido de supabase/seed.sql
```

## 🚀 Ejecución

### Modo Desarrollo

Inicia el servidor de desarrollo con hot reload:

```bash
npm run dev
```

El servidor estará disponible en:
- **Local**: http://localhost:3002
- **Network**: Se mostrará en la terminal

### Modo Producción

Para compilar y generar la versión de producción:

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`.

## ✨ Características

### Autenticación
- ✅ Registro de nuevos usuarios
- ✅ Login con email y contraseña
- ✅ Gestión de sesión con Supabase Auth

### Gestión de Suscripciones
- ✅ Crear nuevas suscripciones compartidas
- ✅ Agregar miembros a suscripciones (con validación de email)
- ✅ Eliminar miembros de suscripciones
- ✅ Calcular automáticamente la parte de cada usuario

### Validación de Emails
- ✅ Validar que emails existan en la base de datos antes de agregar
- ✅ Detectar emails no válidos o no registrados
- ✅ Feedback visual durante el proceso

### Notificaciones
- ✅ Notificación cuando se agrega usuario a suscripción
- ✅ Recordatorios de pago 3 días antes de la fecha vencida
- ✅ Centro de notificaciones integrado

### Panel de Usuario
- ✅ Dashboard vacío para nuevas cuentas (sin datos ficticios)
- ✅ Visualización de suscripciones activas
- ✅ Información personalizada del usuario autenticado
- ✅ Perfil con datos reales del usuario

### Pagos
- ✅ Gestión de métodos de pago
- ✅ Historial de pagos
- ✅ Recordatorios automáticos

## 📁 Estructura del Proyecto

```
SubShareV2/
├── src/
│   ├── components/           # Componentes React
│   │   ├── Dashboard.tsx      # Panel principal
│   │   ├── Login.tsx          # Página de login
│   │   ├── Register.tsx       # Registro de usuarios
│   │   ├── AddSubscription.tsx # Crear suscripción
│   │   ├── Settings.tsx       # Configuración de usuario
│   │   ├── Payments.tsx       # Gestión de pagos
│   │   ├── Members.tsx        # Gestión de miembros
│   │   ├── SubscriptionDetails.tsx # Detalles
│   │   ├── NotificationPanel.tsx   # Centro de notificaciones
│   │   └── ui/                # Componentes UI (shadcn/ui)
│   ├── lib/                   # Servicios y utilidades
│   │   ├── supabase.ts        # Cliente Supabase
│   │   ├── emailService.ts    # Validación de emails
│   │   ├── notificationService.ts  # Gestión de notificaciones
│   │   ├── subscriptionService.ts  # Gestión de suscripciones
│   │   └── userService.ts     # Datos del usuario
│   ├── styles/                # Estilos globales
│   ├── App.tsx                # Componente principal
│   └── main.tsx               # Entry point
├── supabase/
│   ├── schema.sql             # Estructura de base de datos
│   ├── seed.sql               # Datos de prueba
│   └── functions/             # Edge Functions
├── build/                     # Salida compilada (producción)
├── package.json               # Dependencias del proyecto
├── vite.config.ts             # Configuración de Vite
└── README.md                  # Este archivo
```

## 🔌 Servicios Implementados

### emailService.ts
Validación y búsqueda de emails en la base de datos.

```typescript
import { validateEmailExists, getProfileByEmail, validateMultipleEmails } from '../lib/emailService';

// Validar un email
const exists = await validateEmailExists('user@example.com');

// Obtener perfil por email
const profile = await getProfileByEmail('user@example.com');

// Validar múltiples emails
const result = await validateMultipleEmails(['email1@test.com', 'email2@test.com']);
```

### notificationService.ts
Crear, consultar y gestionar notificaciones del usuario.

```typescript
import { createNotification, getUnreadNotifications, markNotificationAsRead } from '../lib/notificationService';

// Crear notificación
await createNotification({
  user_id: userId,
  title: 'Nueva suscripción',
  message: 'Fuiste agregado a Netflix',
  type: 'invitation'
});

// Obtener notificaciones no leídas
const notifications = await getUnreadNotifications(userId);

// Marcar como leída
await markNotificationAsRead(notificationId);
```

### subscriptionService.ts
Crear suscripciones, agregar miembros y calcular pagos.

```typescript
import { createSubscriptionWithMembers, validateAndAddMembers, getUserSubscriptions } from '../lib/subscriptionService';

// Crear suscripción con miembros
const subId = await createSubscriptionWithMembers(data, ownerId);

// Agregar miembros validando emails
const result = await validateAndAddMembers(subId, emails, amount, ownerId);

// Obtener suscripciones del usuario
const userSubs = await getUserSubscriptions(userId);
```

### userService.ts
Acceder y actualizar datos del usuario autenticado.

```typescript
import { getCurrentUserProfile, getCurrentUserName, getUserInitials, updateUserProfile } from '../lib/userService';

// Obtener perfil del usuario actual
const profile = await getCurrentUserProfile();

// Obtener nombre del usuario
const name = await getCurrentUserName();

// Actualizar perfil
await updateUserProfile({ full_name: 'New Name', phone: '+34 123 456 789' });
```

## 🚀 Edge Functions

### notify-new-subscription
Se ejecuta automáticamente cuando se agrega un usuario a una suscripción.

```bash
supabase functions deploy notify-new-subscription
```

### check-payments-due
Se ejecuta diariamente para notificar pagos vencidos en 3 días.

Configurar cron job en Supabase Dashboard:
- Horario: `0 9 * * *` (9 AM cada día)

```bash
supabase functions deploy check-payments-due
```

## 📚 Tecnologías Utilizadas

- **Frontend**: React 18.3.1 + TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite 6.3.5
- **Backend**: Supabase (PostgreSQL + Auth)
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## 🐛 Solución de Problemas

### "Cannot find module @supabase/supabase-js"

```bash
npm install @supabase/supabase-js
```

### Variables de entorno no cargadas

1. Verifica que el archivo `.env.local` existe en la raíz
2. Las variables deben empezar con `VITE_`
3. Reinicia el servidor: `npm run dev`

### Error de conexión a Supabase

1. Verifica las credenciales en `.env.local`
2. Asegúrate que el proyecto de Supabase está activo
3. Revisa que la URL es correcta (sin trailing slash)

## 📝 Notas Adicionales

- El proyecto usa RLS (Row Level Security) en Supabase para seguridad
- Los triggers de base de datos automatizan las notificaciones
- Las componentes cargan datos reales del usuario autenticado
- No hay datos ficticios en el dashboard de nuevos usuarios

## 👥 Contribución

Para contribuir al proyecto:

1. Crea una rama desde `develop`
2. Realiza tus cambios
3. Haz commit descriptivos
4. Abre un Pull Request

## 📄 Licencia

SubShare - Todos los derechos reservados
  