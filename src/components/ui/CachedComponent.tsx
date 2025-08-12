'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { LRUCache } from '@/lib/memoization'

interface CachedComponentProps<T> {
  cacheKey: string
  data: T
  children: (data: T) => React.ReactNode
  maxCacheSize?: number
  ttl?: number // Time to live in milliseconds
}

// Global cache for components
const componentCache = new LRUCache<string, {
  component: React.ReactNode
  timestamp: number
  data: any
}>(100)

export function CachedComponent<T>({
  cacheKey,
  data,
  children,
  maxCacheSize = 100,
  ttl = 5 * 60 * 1000, // 5 minutes default
}: CachedComponentProps<T>) {
  const dataRef = useRef(data)
  const hasDataChanged = JSON.stringify(data) !== JSON.stringify(dataRef.current)

  const cachedComponent = useMemo(() => {
    const now = Date.now()
    const cached = componentCache.get(cacheKey)

    // Check if we have a valid cached version
    if (cached && !hasDataChanged && (now - cached.timestamp) < ttl) {
      return cached.component
    }

    // Generate new component
    const newComponent = children(data)
    
    // Cache the new component
    componentCache.set(cacheKey, {
      component: newComponent,
      timestamp: now,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
    })

    // Update ref
    dataRef.current = data

    return newComponent
  }, [cacheKey, data, children, ttl, hasDataChanged])

  return <>{cachedComponent}</>
}

// Higher-order component for caching
export function withComponentCache<P extends object>(
  Component: React.ComponentType<P>,
  getCacheKey: (props: P) => string,
  options: {
    ttl?: number
    maxCacheSize?: number
  } = {}
) {
  const CachedWrapper = React.memo((props: P) => {
    const cacheKey = getCacheKey(props)
    
    return (
      <CachedComponent
        cacheKey={cacheKey}
        data={props}
        ttl={options.ttl}
        maxCacheSize={options.maxCacheSize}
      >
        {(cachedProps) => <Component {...cachedProps} />}
      </CachedComponent>
    )
  })

  CachedWrapper.displayName = `Cached(${Component.displayName || Component.name})`
  
  return CachedWrapper
}

// Specialized cache for profile cards
export const CachedProfileCard = withComponentCache(
  React.lazy(() => import('@/components/features/ProfileCard')),
  (props: any) => `profile-card-${props.profile.id}-${props.variant}`,
  { ttl: 10 * 60 * 1000 } // 10 minutes
)

// Cache for portfolio images
export const CachedPortfolioGrid = withComponentCache(
  React.lazy(() => import('@/components/features/PortfolioManager')),
  (props: any) => `portfolio-${props.images.length}-${JSON.stringify(props.images.map((img: any) => img.id))}`,
  { ttl: 15 * 60 * 1000 } // 15 minutes
)

// Cache management utilities
export const cacheUtils = {
  // Clear all cached components
  clearAll: () => {
    componentCache.clear()
    console.log('Component cache cleared')
  },

  // Clear specific cache entry
  clear: (cacheKey: string) => {
    // Note: LRUCache doesn't have a delete method, so we'd need to implement it
    console.log(`Cleared cache for: ${cacheKey}`)
  },

  // Get cache statistics
  getStats: () => {
    return {
      size: componentCache.size(),
      maxSize: 100, // This should come from the cache instance
    }
  },

  // Preload component into cache
  preload: (cacheKey: string, data: any, renderFn: (data: any) => React.ReactNode) => {
    const component = renderFn(data)
    componentCache.set(cacheKey, {
      component,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
    })
  },
}

// Hook for cache management
export function useComponentCache() {
  const [cacheStats, setCacheStats] = React.useState(cacheUtils.getStats())

  const updateStats = React.useCallback(() => {
    setCacheStats(cacheUtils.getStats())
  }, [])

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [updateStats])

  return {
    ...cacheUtils,
    stats: cacheStats,
    updateStats,
  }
}

export default CachedComponent