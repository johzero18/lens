// UI Components exports
export { default as Button } from './Button'
export type { ButtonProps } from './Button'

export { default as Input } from './Input'
export type { InputProps } from './Input'

export { default as Modal } from './Modal'
export type { ModalProps } from './Modal'

export { default as LoadingSpinner, LoadingState } from './LoadingSpinner'
export type { LoadingSpinnerProps, LoadingStateProps } from './LoadingSpinner'

export { default as Card, CardHeader, CardContent, CardFooter } from './Card'
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from './Card'

export { default as Textarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { default as Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

export { default as MultiSelect } from './MultiSelect'
export type { MultiSelectProps, MultiSelectOption } from './MultiSelect'

export { default as FileUpload } from './FileUpload'
export type { FileUploadProps } from './FileUpload'

// Performance optimized components
export { default as Skeleton, ProfileCardSkeleton, PortfolioGridSkeleton, SearchResultsSkeleton } from './Skeleton'

export { default as OptimizedImage } from './OptimizedImage'

export { 
  default as LazyRender, 
  LazyContactModal, 
  LazyPortfolioManager, 
  LazySearchFilters, 
  useIntersectionObserver,
  withLazyLoading
} from './LazyComponent'