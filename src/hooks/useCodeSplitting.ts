'use client'

import { useState, useEffect } from 'react'

// Hook for dynamic imports with loading states
export function useDynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  deps: any[] = []
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadComponent = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const module = await importFunc()
        
        if (!cancelled) {
          setComponent(module.default)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      cancelled = true
    }
  }, deps)

  return { component, loading, error }
}

// Hook for preloading components
export function usePreloadComponents() {
  const preloadedComponents = new Set<string>()

  const preload = async (componentName: string, importFunc: () => Promise<any>) => {
    if (preloadedComponents.has(componentName)) {
      return
    }

    try {
      await importFunc()
      preloadedComponents.add(componentName)
      console.log(`Preloaded component: ${componentName}`)
    } catch (error) {
      console.error(`Failed to preload component ${componentName}:`, error)
    }
  }

  const preloadOnHover = (componentName: string, importFunc: () => Promise<any>) => {
    return {
      onMouseEnter: () => preload(componentName, importFunc),
      onFocus: () => preload(componentName, importFunc),
    }
  }

  const preloadOnIdle = (componentName: string, importFunc: () => Promise<any>) => {
    useEffect(() => {
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(() => {
          preload(componentName, importFunc)
        })
        return () => cancelIdleCallback(id)
      } else {
        // Fallback for browsers without requestIdleCallback
        const timeout = setTimeout(() => {
          preload(componentName, importFunc)
        }, 100)
        return () => clearTimeout(timeout)
      }
    }, [componentName])
  }

  return {
    preload,
    preloadOnHover,
    preloadOnIdle,
    isPreloaded: (componentName: string) => preloadedComponents.has(componentName),
  }
}

// Hook for monitoring bundle size in development
export function useBundleMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Monitor script loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') && entry.name.includes('chunk')) {
          const size = (entry as any).transferSize || 0
          const duration = entry.duration
          
          console.log(`Bundle loaded: ${entry.name}`)
          console.log(`Size: ${(size / 1024).toFixed(2)}KB`)
          console.log(`Load time: ${duration.toFixed(2)}ms`)
          
          // Warn about large bundles
          if (size > 500 * 1024) { // 500KB
            console.warn(`Large bundle detected: ${entry.name} (${(size / 1024).toFixed(2)}KB)`)
          }
          
          // Warn about slow loading bundles
          if (duration > 1000) { // 1 second
            console.warn(`Slow loading bundle: ${entry.name} (${duration.toFixed(2)}ms)`)
          }
        }
      }
    })

    observer.observe({ type: 'resource', buffered: true })

    return () => observer.disconnect()
  }, [])
}

// Hook for route-based code splitting
export function useRoutePreloading() {
  const preloadRoute = async (route: string) => {
    try {
      // Preload the route component
      const routeModule = await import(`../app${route}/page`)
      console.log(`Preloaded route: ${route}`)
      return routeModule
    } catch (error) {
      console.error(`Failed to preload route ${route}:`, error)
    }
  }

  const preloadOnLinkHover = (route: string) => {
    return {
      onMouseEnter: () => preloadRoute(route),
      onFocus: () => preloadRoute(route),
    }
  }

  return {
    preloadRoute,
    preloadOnLinkHover,
  }
}

// Critical resource hints
export function useCriticalResourceHints() {
  useEffect(() => {
    // Preload critical fonts
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = '/fonts/inter-var.woff2'
    fontLink.as = 'font'
    fontLink.type = 'font/woff2'
    fontLink.crossOrigin = 'anonymous'
    document.head.appendChild(fontLink)

    // Preconnect to external domains
    const preconnectDomains = [
      'https://images.unsplash.com',
      'https://picsum.photos',
    ]

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    })

    return () => {
      // Cleanup if needed
      document.head.removeChild(fontLink)
    }
  }, [])
}