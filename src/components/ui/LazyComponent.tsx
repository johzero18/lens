'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import Skeleton from './Skeleton'

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return function LazyWrapper(props: T & LazyComponentProps) {
    const { fallback: propsFallback, className, ...componentProps } = props

    const defaultFallback = (
      <div className={className}>
        <Skeleton variant="rectangular" height={200} />
      </div>
    )

    return (
      <Suspense fallback={propsFallback || fallback || defaultFallback}>
        <LazyComponent {...(componentProps as T)} />
      </Suspense>
    )
  }
}

// Lazy loaded components
export const LazyContactModal = withLazyLoading(
  () => import('@/components/features/ContactModal'),
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <Skeleton variant="text" height={24} className="mb-4" />
      <Skeleton variant="rectangular" height={120} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={40} width={80} />
        <Skeleton variant="rectangular" height={40} width={80} />
      </div>
    </div>
  </div>
)

export const LazyPortfolioManager = withLazyLoading(
  () => import('@/components/features/PortfolioManager'),
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" height={24} width={200} />
      <Skeleton variant="rectangular" height={36} width={120} />
    </div>
    <Skeleton variant="rectangular" height={120} />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" className="aspect-square" />
      ))}
    </div>
  </div>
)

export const LazySearchFilters = withLazyLoading(
  () => import('@/components/features/SearchFilters'),
  <div className="space-y-4">
    <Skeleton variant="text" height={20} width={120} />
    <Skeleton variant="rectangular" height={40} />
    <Skeleton variant="text" height={20} width={100} />
    <Skeleton variant="rectangular" height={40} />
    <Skeleton variant="text" height={20} width={140} />
    <Skeleton variant="rectangular" height={80} />
  </div>
)

// Intersection Observer hook for lazy loading on scroll
export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])

  return isIntersecting
}

// Component that only renders children when in viewport
export const LazyRender: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}> = ({ 
  children, 
  fallback, 
  className,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
  })

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  )
}

export default LazyRender