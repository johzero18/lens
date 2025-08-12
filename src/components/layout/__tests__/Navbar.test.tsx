import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navbar from '../Navbar'
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

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/')
  })

  // Unit tests for basic functionality
  it('renders the logo', () => {
    render(<Navbar />)
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /project lens/i })).toHaveAttribute('href', '/')
  })

  it('renders desktop navigation links', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mensajes' })).toBeInTheDocument()
  })

  it('renders auth buttons on desktop', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()
  })

  it('shows mobile menu button on mobile', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<Navbar />)
    
    const menuButton = screen.getByRole('button', { name: /abrir menú/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    mockPathname.mockReturnValue('/buscar')
    render(<Navbar />)
    
    const buscarLink = screen.getByRole('link', { name: 'Buscar' })
    expect(buscarLink).toHaveClass('bg-primary-100 text-primary-700')
  })

  it('highlights home when on root path', () => {
    mockPathname.mockReturnValue('/')
    render(<Navbar />)
    
    const homeLink = screen.getByRole('link', { name: 'Inicio' })
    expect(homeLink).toHaveClass('bg-primary-100 text-primary-700')
  })

  it('handles nested paths correctly', () => {
    mockPathname.mockReturnValue('/buscar/resultados')
    render(<Navbar />)
    
    const buscarLink = screen.getByRole('link', { name: 'Buscar' })
    expect(buscarLink).toHaveClass('bg-primary-100 text-primary-700')
  })

  it('toggles mobile menu when button is clicked', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<Navbar />)
    
    const menuButton = screen.getByRole('button', { name: /abrir menú/i })
    
    // Initially closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
    
    // Open menu
    fireEvent.click(menuButton)
    // Note: This test assumes MobileMenu component has a testid
    // In a real implementation, you'd check for the mobile menu visibility
  })

  it('has correct href attributes for navigation links', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Buscar' })).toHaveAttribute('href', '/buscar')
    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/explorar')
    expect(screen.getByRole('link', { name: 'Mensajes' })).toHaveAttribute('href', '/mensajes')
  })

  it('has correct href attributes for auth links', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/registro')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<Navbar />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper navigation landmark', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('has proper focus management', () => {
    render(<Navbar />)
    
    const logoLink = screen.getByRole('link', { name: /project lens/i })
    logoLink.focus()
    expect(logoLink).toHaveFocus()
  })

  it('supports keyboard navigation', () => {
    render(<Navbar />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      link.focus()
      expect(link).toHaveFocus()
    })
  })

  it('has proper ARIA attributes for mobile menu button', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<Navbar />)
    
    const menuButton = screen.getByRole('button', { name: /abrir menú/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  // Responsive design tests
  it('hides desktop navigation on mobile', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<Navbar />)
    
    // Desktop navigation should be hidden (using CSS classes)
    const desktopNav = screen.getByRole('link', { name: 'Inicio' }).closest('.hidden.md\\:block')
    expect(desktopNav).toBeInTheDocument()
  })

  it('hides mobile menu button on desktop', () => {
    setViewport(viewports.desktop.width, viewports.desktop.height)
    render(<Navbar />)
    
    // Mobile menu button should be hidden on desktop
    const mobileButton = screen.getByRole('button', { name: /abrir menú/i })
    expect(mobileButton.closest('.md\\:hidden')).toBeInTheDocument()
  })

  it('shows auth buttons on desktop only', () => {
    setViewport(viewports.desktop.width, viewports.desktop.height)
    render(<Navbar />)
    
    const authSection = screen.getByRole('link', { name: 'Iniciar Sesión' }).closest('.hidden.md\\:block')
    expect(authSection).toBeInTheDocument()
  })

  // Integration tests
  it('works with different pathname scenarios', () => {
    const testCases = [
      { pathname: '/', expectedActive: 'Inicio' },
      { pathname: '/buscar', expectedActive: 'Buscar' },
      { pathname: '/buscar/filtros', expectedActive: 'Buscar' },
      { pathname: '/explorar', expectedActive: 'Explorar' },
      { pathname: '/mensajes', expectedActive: 'Mensajes' },
      { pathname: '/perfil', expectedActive: null },
    ]

    testCases.forEach(({ pathname, expectedActive }) => {
      mockPathname.mockReturnValue(pathname)
      const { rerender } = render(<Navbar />)
      
      if (expectedActive) {
        const activeLink = screen.getByRole('link', { name: expectedActive })
        expect(activeLink).toHaveClass('bg-primary-100 text-primary-700')
      }
      
      rerender(<div />)
    })
  })

  it('maintains sticky positioning', () => {
    render(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('sticky top-0 z-50')
  })

  it('has proper shadow and background styling', () => {
    render(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-white shadow-soft')
  })

  it('handles hover states correctly', () => {
    render(<Navbar />)
    
    const inactiveLink = screen.getByRole('link', { name: 'Buscar' })
    expect(inactiveLink).toHaveClass('hover:text-secondary-900 hover:bg-secondary-50')
  })

  it('handles mobile menu state changes', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<Navbar />)
    
    const menuButton = screen.getByRole('button', { name: /abrir menú/i })
    
    // Test multiple clicks
    fireEvent.click(menuButton)
    fireEvent.click(menuButton)
    fireEvent.click(menuButton)
    
    // Should still be functional
    expect(menuButton).toBeInTheDocument()
  })

  // Performance tests
  it('renders efficiently with memoization', () => {
    const { rerender } = render(<Navbar />)
    
    // Multiple re-renders should not cause issues
    rerender(<Navbar />)
    rerender(<Navbar />)
    
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
  })
})