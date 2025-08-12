// Application monitoring and health check utilities

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: boolean
    storage: boolean
    auth: boolean
  }
  performance: {
    responseTime: number
    memoryUsage?: number
  }
  version: string
}

interface ErrorReport {
  error: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  additionalInfo?: Record<string, any>
}

// Health check function
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const checks = {
    database: false,
    storage: false,
    auth: false,
  }

  try {
    // Check database connection
    const dbResponse = await fetch('/api/health/database')
    checks.database = dbResponse.ok

    // Check storage
    const storageResponse = await fetch('/api/health/storage')
    checks.storage = storageResponse.ok

    // Check auth
    const authResponse = await fetch('/api/health/auth')
    checks.auth = authResponse.ok

    const responseTime = Date.now() - startTime
    const allHealthy = Object.values(checks).every(Boolean)

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      performance: {
        responseTime,
        memoryUsage: typeof window !== 'undefined' 
          ? (performance as any).memory?.usedJSHeapSize 
          : undefined,
      },
      version: process.env.npm_package_version || '1.0.0',
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      performance: {
        responseTime: Date.now() - startTime,
      },
      version: process.env.npm_package_version || '1.0.0',
    }
  }
}

// Error reporting
export function reportError(error: Error, additionalInfo?: Record<string, any>) {
  const errorReport: ErrorReport = {
    error: error.message,
    stack: error.stack,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    timestamp: new Date().toISOString(),
    additionalInfo,
  }

  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/monitoring/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    }).catch(console.error)
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', errorReport)
  }
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start
      
      // Log performance metric
      if (typeof window !== 'undefined') {
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: name,
            value: Math.round(duration),
            event_category: 'Performance',
          })
        }
      }
      
      return result
    },
    (error) => {
      const duration = performance.now() - start
      console.error(`Performance: ${name} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  )
}

// Resource monitoring
export function monitorResourceUsage() {
  if (typeof window === 'undefined') return

  const memory = (performance as any).memory
  if (memory) {
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    }

    // Warn if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      console.warn('High memory usage detected:', usage)
      reportError(new Error('High memory usage'), { memoryUsage: usage })
    }

    return usage
  }
  
  return null
}

// Network monitoring
export function monitorNetworkStatus() {
  if (typeof window === 'undefined') return

  const connection = (navigator as any).connection
  if (connection) {
    const networkInfo = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }

    // Warn about slow connections
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      console.warn('Slow network detected:', networkInfo)
    }

    return networkInfo
  }
  
  return null
}

// Initialize monitoring
export function initializeMonitoring() {
  if (typeof window === 'undefined') return

  // Monitor unhandled errors
  window.addEventListener('error', (event) => {
    reportError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(new Error(event.reason), {
      type: 'unhandledrejection',
    })
  })

  // Monitor resource usage periodically
  setInterval(() => {
    monitorResourceUsage()
  }, 30000) // Every 30 seconds

  // Monitor network status changes
  if ('connection' in navigator) {
    (navigator as any).connection.addEventListener('change', () => {
      const networkInfo = monitorNetworkStatus()
      console.log('Network status changed:', networkInfo)
    })
  }

  console.log('Monitoring initialized')
}

// Uptime monitoring
export async function checkUptime(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-cache',
    })
    return response.ok
  } catch {
    return false
  }
}