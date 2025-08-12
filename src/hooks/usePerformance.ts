'use client'

import { useEffect, useCallback } from 'react'

// Performance monitoring hook
export function usePerformance() {
  const measurePerformance = useCallback(<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> => {
    const start = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now()
        console.log(`${name} took ${end - start} milliseconds`)
      }) as Promise<T>
    } else {
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
      return result
    }
  }, [])

  const markStart = useCallback((name: string) => {
    performance.mark(`${name}-start`)
  }, [])

  const markEnd = useCallback((name: string) => {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    if (measure) {
      console.log(`${name} took ${measure.duration} milliseconds`)
    }
  }, [])

  return {
    measurePerformance,
    markStart,
    markEnd,
  }
}

// Web Vitals monitoring
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsEntries: any[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry as any)
        }
      }
    })

    observer.observe({ type: 'layout-shift', buffered: true })

    // Report CLS when page is hidden
    const reportCLS = () => {
      console.log('CLS:', clsValue)
      if (clsValue > 0.1) {
        console.warn('CLS is above recommended threshold (0.1)')
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportCLS()
      }
    })

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      console.log('LCP:', lastEntry.startTime)
      
      if (lastEntry.startTime > 2500) {
        console.warn('LCP is above recommended threshold (2.5s)')
      }
    })

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime
        console.log('FID:', fid)
        
        if (fid > 100) {
          console.warn('FID is above recommended threshold (100ms)')
        }
      }
    })

    fidObserver.observe({ type: 'first-input', buffered: true })

    return () => {
      observer.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
    }
  }, [])
}

// Image loading performance
export function useImagePerformance() {
  const trackImageLoad = useCallback((src: string, startTime: number) => {
    const loadTime = performance.now() - startTime
    console.log(`Image ${src} loaded in ${loadTime}ms`)
    
    if (loadTime > 1000) {
      console.warn(`Slow image loading: ${src} took ${loadTime}ms`)
    }
  }, [])

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const startTime = performance.now()
      
      img.onload = () => {
        trackImageLoad(src, startTime)
        resolve()
      }
      
      img.onerror = reject
      img.src = src
    })
  }, [trackImageLoad])

  const preloadImages = useCallback(async (sources: string[]) => {
    const promises = sources.map(preloadImage)
    await Promise.allSettled(promises)
  }, [preloadImage])

  return {
    trackImageLoad,
    preloadImage,
    preloadImages,
  }
}

// Bundle size monitoring (development only)
export function useBundleAnalysis() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Monitor bundle loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chunk') || entry.name.includes('.js')) {
          console.log(`Bundle ${entry.name} loaded in ${entry.duration}ms`)
        }
      }
    })

    observer.observe({ type: 'resource', buffered: true })

    return () => observer.disconnect()
  }, [])
}