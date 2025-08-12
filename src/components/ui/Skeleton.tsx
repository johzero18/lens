'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-secondary-200'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could be enhanced with custom wave animation
    none: '',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  )
}

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC<{ variant?: 'grid' | 'list' }> = ({ 
  variant = 'grid' 
}) => {
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={20} width="60%" />
          <Skeleton variant="text" height={16} width="40%" />
          <Skeleton variant="text" height={14} width="80%" />
          <div className="flex gap-2 mt-3">
            <Skeleton variant="text" height={24} width={60} />
            <Skeleton variant="text" height={24} width={80} />
          </div>
        </div>
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton variant="rectangular" height={128} />
      <div className="p-4">
        <div className="relative -mt-8 mb-3">
          <Skeleton variant="circular" width={64} height={64} />
        </div>
        <Skeleton variant="text" height={20} width="80%" className="mb-2" />
        <Skeleton variant="text" height={16} width="50%" className="mb-2" />
        <Skeleton variant="text" height={14} width="60%" className="mb-2" />
        <Skeleton variant="text" height={14} width="90%" className="mb-3" />
        <div className="flex gap-1 mb-4">
          <Skeleton variant="text" height={20} width={50} />
          <Skeleton variant="text" height={20} width={60} />
        </div>
        <Skeleton variant="rectangular" height={36} />
      </div>
    </div>
  )
}

// Portfolio Grid Skeleton
export const PortfolioGridSkeleton: React.FC<{ count?: number }> = ({ 
  count = 6 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          className="aspect-square"
        />
      ))}
    </div>
  )
}

// Search Results Skeleton
export const SearchResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6}).map((_, index) => (
        <ProfileCardSkeleton key={index} variant="list" />
      ))}
    </div>
  )
}

export default Skeleton