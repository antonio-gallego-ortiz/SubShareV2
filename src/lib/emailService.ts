import { supabase } from './supabase';

/**
 * Valida que un email exista en la base de datos (en la tabla profiles)
 * @param email - El email a validar
 * @returns true si el email existe, false en caso contrario
 */
export async function validateEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error validando email:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error en validateEmailExists:', error);
    return false;
  }
}

/**
 * Obtiene el perfil de un usuario por email
 * @param email - El email del usuario
 * @returns El perfil del usuario o null
 */
export async function getProfileByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en getProfileByEmail:', error);
    return null;
  }
}

/**
 * Valida múltiples emails a la vez
 * @param emails - Array de emails a validar
 * @returns Objeto con emails válidos e inválidos
 */
export async function validateMultipleEmails(emails: string[]) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .in('email', emails.map(e => e.toLowerCase()));

    if (error) {
      console.error('Error validando múltiples emails:', error);
      return { valid: [], invalid: emails };
    }

    const validEmails = (data || []).map((item: any) => item.email);
    const invalidEmails = emails.filter(
      email => !validEmails.includes(email.toLowerCase())
    );

    return { valid: validEmails, invalid: invalidEmails };
  } catch (error) {
    console.error('Error en validateMultipleEmails:', error);
    return { valid: [], invalid: emails };
  }
}
