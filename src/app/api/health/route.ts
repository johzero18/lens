import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Initialize Supabase client
    const supabase = createClient()
    
    // Test database connection
    const { data: dbTest, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      throw new Error(`Database check failed: ${dbError.message}`)
    }

    // Test storage connection
    const { data: storageTest, error: storageError } = await supabase
      .storage
      .listBuckets()
    
    if (storageError) {
      throw new Error(`Storage check failed: ${storageError.message}`)
    }

    // Test auth service
    const { data: authTest, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.warn('Auth check warning:', authError.message)
    }

    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: !dbError,
        storage: !storageError,
        auth: !authError,
      },
      performance: {
        responseTime,
        uptime: process.uptime(),
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    }

    // Return 200 if all checks pass, 503 if any fail
    const allHealthy = Object.values(healthStatus.checks).every(Boolean)
    const statusCode = allHealthy ? 200 : 503

    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        responseTime,
        uptime: process.uptime(),
      },
    }

    console.error('Health check failed:', error)

    return NextResponse.json(errorStatus, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}