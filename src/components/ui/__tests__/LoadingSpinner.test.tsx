import React from 'react'
import { render, screen } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import LoadingSpinner from '../LoadingSpinner'

expect.extend(toHaveNoViolations)

describe('LoadingSpinner Component', () => {
  // Unit tests for basic functionality
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Cargando...')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders without text when showText is false', () => {
    render(<LoadingSpinner text="Loading..." showText={false} />)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-spinner')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<LoadingSpinner variant="primary" />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(<LoadingSpinner variant="secondary" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<LoadingSpinner />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Cargando...')
  })

  it('has proper ARIA attributes with custom text', () => {
    render(<LoadingSpinner text="Custom loading text" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading text')
  })

  // Integration tests
  it('works as overlay spinner', () => {
    render(
      <div className="relative">
        <div>Content behind spinner</div>
        <LoadingSpinner overlay />
      </div>
    )
    
    expect(screen.getByText('Content behind spinner')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('maintains animation classes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status').querySelector('svg')
    expect(spinner).toHaveClass('animate-spin')
  })
})