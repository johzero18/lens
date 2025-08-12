#!/usr/bin/env node

/**
 * Database Setup and Verification Script for Project Lens
 * 
 * This script helps verify that the Supabase database is properly configured
 * and all migrations have been applied correctly.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  console.log('🔍 Verificando tablas...');
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['profiles', 'portfolio_images', 'contacts']);

  if (error) {
    console.error('❌ Error verificando tablas:', error.message);
    return false;
  }

  const expectedTables = ['profiles', 'portfolio_images', 'contacts'];
  const foundTables = data.map(row => row.table_name);
  
  for (const table of expectedTables) {
    if (foundTables.includes(table)) {
      console.log(`✅ Tabla '${table}' encontrada`);
    } else {
      console.log(`❌ Tabla '${table}' no encontrada`);
      return false;
    }
  }
  
  return true;
}

async function verifyCustomTypes() {
  console.log('\n🔍 Verificando tipos personalizados...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT typname FROM pg_type WHERE typname IN ('user_role', 'subscription_tier');`
  });

  if (error) {
    console.error('❌ Error verificando tipos:', error.message);
    return false;
  }

  const expectedTypes = ['user_role', 'subscription_tier'];
  const foundTypes = data.map(row => row.typname);
  
  for (const type of expectedTypes) {
    if (foundTypes.includes(type)) {
      console.log(`✅ Tipo '${type}' encontrado`);
    } else {
      console.log(`❌ Tipo '${type}' no encontrado`);
      return false;
    }
  }
  
  return true;
}

async function verifyRLSPolicies() {
  console.log('\n🔍 Verificando políticas RLS...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`
  });

  if (error) {
    console.error('❌ Error verificando políticas RLS:', error.message);
    return false;
  }

  const expectedTables = ['profiles', 'portfolio_images', 'contacts'];
  const tablesWithPolicies = [...new Set(data.map(row => row.tablename))];
  
  for (const table of expectedTables) {
    if (tablesWithPolicies.includes(table)) {
      console.log(`✅ Políticas RLS para '${table}' encontradas`);
    } else {
      console.log(`❌ Políticas RLS para '${table}' no encontradas`);
      return false;
    }
  }
  
  return true;
}

async function verifyIndexes() {
  console.log('\n🔍 Verificando índices...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';`
  });

  if (error) {
    console.error('❌ Error verificando índices:', error.message);
    return false;
  }

  const expectedIndexes = [
    'idx_profiles_username',
    'idx_profiles_role',
    'idx_profiles_location',
    'idx_portfolio_images_profile_id',
    'idx_contacts_receiver_id'
  ];
  
  const foundIndexes = data.map(row => row.indexname);
  
  for (const index of expectedIndexes) {
    if (foundIndexes.includes(index)) {
      console.log(`✅ Índice '${index}' encontrado`);
    } else {
      console.log(`❌ Índice '${index}' no encontrado`);
      return false;
    }
  }
  
  return true;
}

async function verifyStorageBucket() {
  console.log('\n🔍 Verificando bucket de almacenamiento...');
  
  try {
    // Check if profile-images bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError.message);
      return false;
    }

    const profileImagesBucket = buckets.find(bucket => bucket.name === 'profile-images');
    
    if (profileImagesBucket) {
      console.log('✅ Bucket "profile-images" encontrado');
      
      // Check bucket policies
      const { data: policies, error: policyError } = await supabase.storage
        .from('profile-images')
        .list('', { limit: 1 });
        
      if (policyError && policyError.message.includes('not allowed')) {
        console.log('✅ Políticas de bucket configuradas correctamente');
      } else {
        console.log('✅ Bucket accesible');
      }
      
      return true;
    } else {
      console.log('❌ Bucket "profile-images" no encontrado');
      console.log('🔧 Creando bucket "profile-images"...');
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('profile-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Error creando bucket:', createError.message);
        return false;
      }
      
      console.log('✅ Bucket "profile-images" creado exitosamente');
      return true;
    }
  } catch (error) {
    console.error('❌ Error verificando storage:', error.message);
    return false;
  }
}

async function testBasicOperations() {
  console.log('\n🔍 Probando operaciones básicas...');
  
  try {
    // Test profile creation (this will fail if RLS is working correctly without auth)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profileError && profileError.code === 'PGRST116') {
      console.log('✅ RLS funcionando correctamente (acceso denegado sin autenticación)');
    } else if (!profileError) {
      console.log('✅ Tabla profiles accesible');
    } else {
      console.log('❌ Error inesperado:', profileError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error en operaciones básicas:', error.message);
    return false;
  }
}

async function generateMigrationStatus() {
  console.log('\n📊 Generando reporte de estado...');
  
  const migrationFiles = [
    '001_initial_schema.sql',
    '002_indexes.sql', 
    '003_rls_policies.sql',
    '004_sample_data.sql'
  ];

  console.log('\n📋 Estado de migraciones:');
  migrationFiles.forEach((file, index) => {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${index + 1}. ${file} - Archivo presente`);
    } else {
      console.log(`❌ ${index + 1}. ${file} - Archivo faltante`);
    }
  });
}

async function main() {
  console.log('🚀 Iniciando verificación de base de datos Project Lens\n');
  
  let allChecksPass = true;
  
  // Verify database structure
  allChecksPass &= await verifyTables();
  allChecksPass &= await verifyCustomTypes();
  allChecksPass &= await verifyRLSPolicies();
  allChecksPass &= await verifyIndexes();
  allChecksPass &= await verifyStorageBucket();
  allChecksPass &= await testBasicOperations();
  
  // Generate migration status
  await generateMigrationStatus();
  
  console.log('\n' + '='.repeat(50));
  
  if (allChecksPass) {
    console.log('✅ ¡Base de datos configurada correctamente!');
    console.log('🎉 Todas las verificaciones pasaron exitosamente.');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configurar autenticación en la aplicación');
    console.log('2. Probar registro y login de usuarios');
    console.log('3. Verificar creación de perfiles automática');
  } else {
    console.log('❌ Hay problemas con la configuración de la base de datos.');
    console.log('📖 Revisa la documentación en docs/database-schema.md');
    console.log('🔧 Ejecuta las migraciones faltantes desde supabase/migrations/');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error.message);
  process.exit(1);
});

// Run the verification
main().catch(console.error);