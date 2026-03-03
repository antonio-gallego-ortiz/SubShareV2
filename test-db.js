import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjnynutomqiatloupetsl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnludXJvbXFpYXRsb3BldHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODA5NjQsImV4cCI6MjA4NzE1Njk2NH0.52AtmDaWfD1xkDMIz01imUkp1IdVh7nIR0vAEmC_Gik';

console.log('🔍 Probando conexión a Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Intentar obtener los profiles
    console.log('📝 Test 1: Consultando tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ Error:', profilesError.message);
    } else {
      console.log('✅ Conexión exitosa. Datos encontrados:', profiles.length > 0 ? 'Sí' : 'No (tabla vacía)');
    }

    // Test 2: Intentar obtener las suscripciones
    console.log('\n📝 Test 2: Consultando tabla subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);

    if (subError) {
      console.log('❌ Error:', subError.message);
    } else {
      console.log('✅ Conexión exitosa. Datos encontrados:', subscriptions.length > 0 ? 'Sí' : 'No (tabla vacía)');
    }

    // Test 3: Auth session
    console.log('\n📝 Test 3: Verificando sesión de autenticación...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error:', sessionError.message);
    } else {
      console.log('✅ Auth funcionando. Sesión activa:', session ? 'Sí' : 'No');
    }

    console.log('\n✨ Pruebas completadas!');
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testConnection();
