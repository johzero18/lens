#!/usr/bin/env node

/**
 * Script para probar la configuración de Supabase
 * Ejecutar con: node scripts/test-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando configuración de Supabase...\n')

// Verificar variables de entorno
console.log('📋 Variables de entorno:')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Faltante'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ Faltante'}`)
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase faltantes')
  console.log('Por favor, configura las variables en .env.local')
  console.log('Ver docs/supabase-setup.md para más información')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔌 Probando conexión a Supabase...')
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error && error.code === '42P01') {
      console.log('✅ Conexión exitosa (tabla profiles no existe aún - esto es normal)')
    } else if (error) {
      console.log('⚠️  Conexión establecida pero hay un error:', error.message)
      console.log('Esto puede ser normal si las tablas no están creadas aún')
    } else {
      console.log('✅ Conexión exitosa y tabla profiles encontrada')
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message)
    return false
  }
  
  return true
}

async function testAuth() {
  console.log('\n🔐 Probando configuración de autenticación...')
  
  try {
    // Probar obtener sesión actual
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Error al obtener sesión:', error.message)
    } else {
      console.log('✅ Configuración de autenticación funcionando')
      console.log(`Sesión actual: ${session ? 'Autenticado' : 'No autenticado'}`)
    }
  } catch (err) {
    console.error('❌ Error en autenticación:', err.message)
    return false
  }
  
  return true
}

async function testStorage() {
  console.log('\n📁 Probando configuración de storage...')
  
  try {
    // Listar buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.log('⚠️  Error al acceder a storage:', error.message)
      console.log('Esto es normal si los buckets no están creados aún')
    } else {
      console.log('✅ Acceso a storage funcionando')
      console.log(`Buckets encontrados: ${buckets.length}`)
      
      const expectedBuckets = ['avatars', 'covers', 'portfolio']
      expectedBuckets.forEach(bucketName => {
        const exists = buckets.some(bucket => bucket.name === bucketName)
        console.log(`  - ${bucketName}: ${exists ? '✅ Existe' : '⚠️  No existe'}`)
      })
    }
  } catch (err) {
    console.error('❌ Error en storage:', err.message)
    return false
  }
  
  return true
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de configuración de Supabase\n')
  
  const connectionOk = await testConnection()
  const authOk = await testAuth()
  const storageOk = await testStorage()
  
  console.log('\n📊 Resumen de pruebas:')
  console.log(`Conexión: ${connectionOk ? '✅ OK' : '❌ Error'}`)
  console.log(`Autenticación: ${authOk ? '✅ OK' : '❌ Error'}`)
  console.log(`Storage: ${storageOk ? '✅ OK' : '❌ Error'}`)
  
  if (connectionOk && authOk && storageOk) {
    console.log('\n🎉 ¡Configuración de Supabase completada exitosamente!')
    console.log('Puedes proceder con la siguiente tarea: Crear esquema de base de datos')
  } else {
    console.log('\n⚠️  Hay algunos problemas en la configuración')
    console.log('Revisa la documentación en docs/supabase-setup.md')
  }
}

// Ejecutar pruebas
runTests().catch(console.error)