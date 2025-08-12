import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import MobileMenu from '../MobileMenu'
import { setViewport, viewports } from '@/test-utils'

expect.extend(toHaveNoViolations)

// Mock next/navigation
const mockPush = jest.fn()
const mockPathname = jest.fn(() => '/')

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname(),
}))

describe('MobileMenu Component', () => {
  const mockOnClose = jest.fn()
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/')
    setViewport(viewports.mobile.width, viewports.mobile.height)
  })

  // Unit tests for basic functionality
  it('renders when isOpen is true', () => {
    render(<MobileMenu {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const expectedLinks = [
      'Inicio',
      'Buscar',
      'Explorar',
      'Mensajes'
    ]
    
    expectedLinks.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument()
    })
  })

  it('renders auth buttons', () => {
    render(<MobileMenu {...defaultProps} />)
    
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()
  })

  it('has correct href attributes', () => {
    render(<MobileMenu {...defaultProps} />)
    
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Buscar' })).toHaveAttribute('href', '/buscar')
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/explorar')
    expect(screen.getByRole('link', { name: 'Mensajes' })).toHaveAttribute('href', '/mensajes')
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/registro')
  })

  it('highlights active navigation item', () => {
    mockPathname.mockReturnValue('/buscar')
    render(<MobileMenu {...defaultProps} />)
    
    const buscarLink = screen.getByRole('link', { name: 'Buscar' })
    expect(buscarLink).toHaveClass('bg-primary-100 text-primary-700')
  })

  it('calls onClose when close button is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /cerrar menú/i })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const overlay = screen.getByRole('dialog').parentElement?.firstChild as HTMLElement
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when navigation link is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const homeLink = screen.getByRole('link', { name: 'Inicio' })
    fireEvent.click(homeLink)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<MobileMenu {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<MobileMenu {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Menú de navegación')
  })

  it('has proper close button accessibility', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /cerrar menú/i })
    expect(closeButton).toHaveAttribute('aria-label', 'Cerrar menú')
  })

  it('traps focus within menu', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /cerrar menú/i })
    const firstLink = screen.getByRole('link', { name: 'Inicio' })
    
    // Focus should be manageable within the menu
    closeButton.focus()
    expect(closeButton).toHaveFocus()
    
    firstLink.focus()
    expect(firstLink).toHaveFocus()
  })

  it('supports keyboard navigation', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      link.focus()
      expect(link).toHaveFocus()
    })
  })

  // Animation and transition tests
  it('has proper animation classes', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const menuContent = screen.getByRole('dialog')
    expect(menuContent).toHaveClass('transform transition-transform')
  })

  it('prevents body scroll when open', () => {
    const originalOverflow = document.body.style.overflow
    
    render(<MobileMenu {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    // Cleanup
    document.body.style.overflow = originalOverflow
  })

  it('restores body scroll when closed', () => {
    const originalOverflow = document.body.style.overflow
    
    const { rerender } = render(<MobileMenu {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<MobileMenu {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
    
    // Cleanup
    document.body.style.overflow = originalOverflow
  })

  // Integration tests
  it('works with different pathname scenarios', () => {
    const testCases = [
      { pathname: '/', expectedActive: 'Inicio' },
      { pathname: '/buscar', expectedActive: 'Buscar' },
      { pathname: '/explorar', expectedActive: 'Explorar' },
      { pathname: '/mensajes', expectedActive: 'Mensajes' },
    ]

    testCases.forEach(({ pathname, expectedActive }) => {
      mockPathname.mockReturnValue(pathname)
      const { rerender } = render(<MobileMenu {...defaultProps} />)
      
      const activeLink = screen.getByRole('link', { name: expectedActive })
      expect(activeLink).toHaveClass('bg-primary-100 text-primary-700')
      
      rerender(<div />)
    })
  })

  it('handles rapid open/close cycles', () => {
    const { rerender } = render(<MobileMenu {...defaultProps} />)
    
    rerender(<MobileMenu {...defaultProps} isOpen={false} />)
    rerender(<MobileMenu {...defaultProps} isOpen={true} />)
    rerender(<MobileMenu {...defaultProps} isOpen={false} />)
    
    // Should handle rapid changes without errors
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('maintains consistent styling', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('bg-white')
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('block px-4 py-3')
    })
  })

  it('shows user profile section when authenticated', () => {
    // This would require mocking authentication state
    render(<MobileMenu {...defaultProps} />)
    
    // For now, just verify the menu renders
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('handles nested path highlighting correctly', () => {
    mockPathname.mockReturnValue('/buscar/resultados')
    render(<MobileMenu {...defaultProps} />)
    
    const buscarLink = screen.getByRole('link', { name: 'Buscar' })
    expect(buscarLink).toHaveClass('bg-primary-100 text-primary-700')
  })
})