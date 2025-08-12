'use client'

import { useEffect } from 'react'
import { useWebVitals, useBundleAnalysis } from '@/hooks/usePerformance'
import { useBundleMonitoring, useCriticalResourceHints } from '@/hooks/useCodeSplitting'

export default function PerformanceMonitor() {
  // Initialize performance monitoring hooks
  useWebVitals()
  useBundleAnalysis()
  useBundleMonitoring()
  useCriticalResourceHints()

  useEffect(() => {
    // Report performance metrics to console in development
    if (process.env.NODE_ENV === 'development') {
      const reportPerformance = () => {
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          console.group('🚀 Performance Metrics')
          console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`)
          console.log(`Page Load: ${navigation.loadEventEnd - navigation.loadEventStart}ms`)
          console.log(`DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`)
          console.log(`TCP Connection: ${navigation.connectEnd - navigation.connectStart}ms`)
          console.log(`Server Response: ${navigation.responseEnd - navigation.responseStart}ms`)
          console.groupEnd()
        }

        // Resource timing
        const resources = performance.getEntriesByType('resource')
        const images = resources.filter(r => r.name.includes('image') || r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.webp'))
        const scripts = resources.filter(r => r.name.includes('.js'))
        const styles = resources.filter(r => r.name.includes('.css'))

        if (images.length > 0) {
          console.group('🖼️ Image Loading')
          images.forEach(img => {
            const size = (img as any).transferSize || 0
            console.log(`${img.name}: ${img.duration.toFixed(2)}ms (${(size / 1024).toFixed(2)}KB)`)
          })
          console.groupEnd()
        }

        if (scripts.length > 0) {
          console.group('📦 Script Loading')
          scripts.forEach(script => {
            const size = (script as any).transferSize || 0
            console.log(`${script.name}: ${script.duration.toFixed(2)}ms (${(size / 1024).toFixed(2)}KB)`)
          })
          console.groupEnd()
        }
      }

      // Report after page load
      if (document.readyState === 'complete') {
        setTimeout(reportPerformance, 1000)
      } else {
        window.addEventListener('load', () => {
          setTimeout(reportPerformance, 1000)
        })
      }
    }

    // Service Worker registration for caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // Memory usage monitoring (development only)
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory
        console.log('Memory Usage:', {
          used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        })
      }

      const memoryInterval = setInterval(logMemoryUsage, 30000) // Every 30 seconds
      return () => clearInterval(memoryInterval)
    }

    return undefined
  }, [])

  // This component doesn't render anything
  return null
}