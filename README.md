
# SubShare

## 📱 Descripción

**SubShare** es una plataforma web innovadora que facilita la gestión y el intercambio seguro de suscripciones digitales (Netflix, Spotify, Disney+, etc.) entre amigos y familiares.

## ✨ Características principales

- **Gestión de suscripciones compartidas**: Administra todas tus suscripciones en un solo lugar
- **Sistema de pagos**: Controla quién ha pagado y quién debe
- **Notificaciones automáticas**: Recibe alertas sobre pagos pendientes y renovaciones
- **Invitaciones**: Invita a amigos y familiares a unirse a tus suscripciones
- **Control de gastos**: Visualiza cuánto ahorras al compartir suscripciones
- **Miembros**: Gestiona quién tiene acceso a cada suscripción

## 🎯 Motivación

SubShare surge de la necesidad real de resolver problemas comunes al compartir cuentas digitales:
- Pagos olvidados o retrasados
- Accesos no autorizados
- Desorganización entre usuarios
- Conflictos por responsabilidades

Nuestro objetivo es ofrecer una solución **sencilla, segura y organizada** para compartir suscripciones sin complicaciones.

## 🚀 Instalación

### Prerequisitos

- Node.js 18 o superior
- npm o yarn
- Una cuenta en Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd SubShareV2
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Lee la guía completa en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Copia el archivo de ejemplo de variables de entorno:
     ```bash
     cp .env.example .env
     ```
   - Configura tus credenciales en el archivo `.env`:
     ```env
     VITE_SUPABASE_URL=tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY=tu_clave_publica
     ```
   - Ejecuta el esquema SQL en Supabase (archivo `supabase/schema.sql`)

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   - La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Componentes UI**: Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Iconos**: Lucide React

## 📂 Estructura del Proyecto

```
SubShareV2/
├── src/
│   ├── components/       # Componentes de React
│   │   ├── ui/          # Componentes UI reutilizables
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ...
│   ├── lib/             # Lógica de negocio y utilidades
│   │   ├── supabase.ts      # Cliente de Supabase
│   │   ├── supabaseApi.ts   # Funciones de API
│   │   ├── hooks.ts         # React Hooks personalizados
│   │   └── database.types.ts # Tipos de la base de datos
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── supabase/
│   ├── schema.sql       # Esquema de la base de datos
│   └── seed.sql         # Datos de prueba
├── .env.example         # Ejemplo de variables de entorno
├── SUPABASE_SETUP.md    # Guía de configuración de Supabase
├── SUPABASE_USAGE.md    # Guía de uso de la API de Supabase
└── README.md            # Este archivo
```

## 📖 Documentación

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Guía paso a paso para configurar Supabase
- **[SUPABASE_USAGE.md](./SUPABASE_USAGE.md)**: Guía de cómo usar las funciones y hooks de Supabase

## 🗄️ Base de Datos

SubShare utiliza Supabase (PostgreSQL) con las siguientes tablas:

- **profiles**: Información de usuarios
- **subscriptions**: Suscripciones compartidas
- **subscription_members**: Relación usuarios-suscripciones
- **payments**: Historial de pagos
- **notifications**: Notificaciones para usuarios
- **invitations**: Sistema de invitaciones

Todas las tablas incluyen Row Level Security (RLS) para proteger los datos.

## 🔒 Seguridad

La plataforma prioriza la confianza y la protección de datos mediante:
- Autenticación segura con Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Cifrado de datos en tránsito y en reposo
- Variables de entorno para credenciales sensibles
