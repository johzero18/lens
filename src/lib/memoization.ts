// Simple memoization utility
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }) as T
}

// Memoization with TTL (Time To Live)
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const now = Date.now()
    const cached = cache.get(key)
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value
    }
    
    const result = fn(...args)
    cache.set(key, { value: result, timestamp: now })
    
    // Clean up expired entries periodically
    if (cache.size > 100) {
      for (const [k, v] of cache.entries()) {
        if ((now - v.timestamp) >= ttl) {
          cache.delete(k)
        }
      }
    }
    
    return result
  }) as T
}

// LRU (Least Recently Used) cache
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Memoization with LRU cache
export function memoizeWithLRU<T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 100
): T {
  const cache = new LRUCache<string, ReturnType<T>>(maxSize)
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }) as T
}

// Debounced memoization for search functions
export function memoizeDebounced<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  const cache = new Map()
  let timeoutId: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = JSON.stringify(args)
    
    return new Promise((resolve) => {
      if (cache.has(key)) {
        resolve(cache.get(key))
        return
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        const result = fn(...args)
        cache.set(key, result)
        resolve(result)
      }, delay)
    })
  }) as T
}

// Expensive computations that can be memoized
export const memoizedUtils = {
  // Profile filtering
  filterProfiles: memoizeWithLRU((profiles: any[], filters: any) => {
    return profiles.filter(profile => {
      if (filters.role && profile.role !== filters.role) return false
      if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) return false
      if (filters.specialties && filters.specialties.length > 0) {
        const profileSpecialties = profile.role_specific_data?.specialties || []
        const hasMatchingSpecialty = filters.specialties.some((specialty: string) =>
          profileSpecialties.some((ps: string) => ps.toLowerCase().includes(specialty.toLowerCase()))
        )
        if (!hasMatchingSpecialty) return false
      }
      return true
    })
  }, 50),

  // Search results sorting
  sortProfiles: memoizeWithLRU((profiles: any[], sortBy: string) => {
    const sorted = [...profiles]
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name))
      case 'location':
        return sorted.sort((a, b) => a.location.localeCompare(b.location))
      case 'role':
        return sorted.sort((a, b) => a.role.localeCompare(b.role))
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default:
        return sorted
    }
  }, 20),

  // Role-specific data extraction
  extractSpecialties: memoizeWithLRU((profile: any) => {
    const { role_specific_data } = profile
    
    if (!role_specific_data) return []
    
    if ('specialties' in role_specific_data && Array.isArray(role_specific_data.specialties)) {
      return role_specific_data.specialties.slice(0, 3)
    }
    
    if ('model_type' in role_specific_data && Array.isArray(role_specific_data.model_type)) {
      return role_specific_data.model_type.slice(0, 3)
    }
    
    return []
  }, 200),

  // Image URL optimization
  optimizeImageUrl: memoizeWithLRU((url: string, width?: number, height?: number, quality?: number) => {
    if (!url) return url
    
    // For external URLs, return as-is
    if (url.startsWith('http')) return url
    
    // For internal URLs, add optimization parameters
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality) params.set('q', quality.toString())
    
    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }, 500),
}