import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

/**
 * Obtiene el usuario actualmente autenticado
 * @returns Usuario autenticado o null
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    return null;
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns Perfil del usuario o null
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error en getCurrentUserProfile:', error);
    return null;
  }
}

/**
 * Actualiza el perfil del usuario
 * @param updates - Datos a actualizar
 * @returns true si se actualizó exitosamente
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error actualizando perfil:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    return false;
  }
}

/**
 * Obtiene el email del usuario autenticado
 * @returns Email del usuario o null
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.email || null;
  } catch (error) {
    console.error('Error en getCurrentUserEmail:', error);
    return null;
  }
}

/**
 * Obtiene el nombre del usuario desde su perfil
 * @returns Nombre completo del usuario
 */
export async function getCurrentUserName(): Promise<string> {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.full_name || 'Usuario';
  } catch (error) {
    console.error('Error en getCurrentUserName:', error);
    return 'Usuario';
  }
}

/**
 * Obtiene las iniciales del usuario
 * @returns Iniciales (2 caracteres)
 */
export async function getUserInitials(): Promise<string> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.full_name) return 'U';

    const names = profile.full_name.split(' ');
    const initials = names
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();

    return initials;
  } catch (error) {
    console.error('Error en getUserInitials:', error);
    return 'U';
  }
}

/**
 * Cierra la sesión del usuario autenticado
 * @returns true si se cerró exitosamente
 */
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error cerrando sesión:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en signOut:', error);
    return false;
  }
}

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Usuario autenticado o error
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error iniciando sesión:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No se pudo obtener datos del usuario',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Error en signInWithEmail:', error);
    return {
      success: false,
      error: error?.message || 'Error al iniciar sesión',
    };
  }
}

/**
 * Registra un nuevo usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @param fullName - Nombre completo del usuario
 * @returns Usuario registrado o error
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error registrando usuario:', error);
      return {
        success: false,
        error: error.message || 'Error al registrar usuario',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No se pudo crear el usuario',
      };
    }

    // Crear perfil del usuario
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
    });

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      return {
        success: false,
        error: 'Error al crear el perfil del usuario',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Error en signUpWithEmail:', error);
    return {
      success: false,
      error: error?.message || 'Error al registrar usuario',
    };
  }
}

/**
 * Obtiene el perfil de un usuario por email
 * @param email - Email del usuario
 * @returns Perfil del usuario o null
 */
export async function getProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error en getProfileByEmail:', error);
    return null;
  }
}
