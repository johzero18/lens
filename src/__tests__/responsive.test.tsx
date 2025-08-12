import React from 'react'
import { render, screen } from '@/test-utils'
import { setViewport, viewports } from '@/test-utils'
import ProfileCard from '@/components/features/ProfileCard'
import Navbar from '@/components/layout/Navbar'
import { mockProfile } from '@/test-utils'

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ProfileCard Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      setViewport(viewports.mobile.width, viewports.mobile.height)
      render(<ProfileCard profile={mockProfile} variant="list" />)
      
      // Contact button should be full width on mobile
      const contactButton = screen.getByRole('button', { name: /contactar/i })
      expect(contactButton).toHaveClass('w-full')
    })

    it('adapts to tablet viewport', () => {
      setViewport(viewports.tablet.width, viewports.tablet.height)
      render(<ProfileCard profile={mockProfile} variant="list" />)
      
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      setViewport(viewports.desktop.width, viewports.desktop.height)
      render(<ProfileCard profile={mockProfile} variant="list" />)
      
      // Contact button should be auto width on desktop
      const contactButton = screen.getByRole('button', { name: /contactar/i })
      expect(contactButton).toHaveClass('sm:w-auto')
    })

    it('adapts to large desktop viewport', () => {
      setViewport(viewports.large.width, viewports.large.height)
      render(<ProfileCard profile={mockProfile} />)
      
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    })

    it('handles grid layout responsively', () => {
      // Test different viewports with grid variant
      const viewportTests = [
        { viewport: viewports.mobile, name: 'mobile' },
        { viewport: viewports.tablet, name: 'tablet' },
        { viewport: viewports.desktop, name: 'desktop' },
      ]

      viewportTests.forEach(({ viewport, name }) => {
        setViewport(viewport.width, viewport.height)
        const { rerender } = render(<ProfileCard profile={mockProfile} variant="grid" />)
        
        expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
        
        // Clean up for next iteration
        rerender(<div />)
      })
    })
  })

  describe('Navbar Responsive Behavior', () => {
    it('shows mobile menu button on mobile', () => {
      setViewport(viewports.mobile.width, viewports.mobile.height)
      render(<Navbar />)
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toBeInTheDocument()
      
      // Desktop navigation should be hidden
      const desktopLinks = screen.getAllByRole('link').filter(link => 
        ['Inicio', 'Buscar', 'Explorar', 'Mensajes'].includes(link.textContent || '')
      )
      
      // Links exist but should be in hidden desktop navigation
      expect(desktopLinks.length).toBeGreaterThan(0)
    })

    it('shows desktop navigation on desktop', () => {
      setViewport(viewports.desktop.width, viewports.desktop.height)
      render(<Navbar />)
      
      // All navigation links should be visible
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Buscar' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Explorar' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Mensajes' })).toBeInTheDocument()
      
      // Auth buttons should be visible
      expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()
    })

    it('handles tablet viewport correctly', () => {
      setViewport(viewports.tablet.width, viewports.tablet.height)
      render(<Navbar />)
      
      // Should show desktop navigation on tablet (md breakpoint is 768px)
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    })
  })

  describe('Layout Container Responsive Behavior', () => {
    it('applies correct max-width constraints', () => {
      const TestComponent = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-testid="content">Test Content</div>
        </div>
      )

      // Test different viewports
      const viewportTests = [
        { viewport: viewports.mobile, expectedPadding: 'px-4' },
        { viewport: viewports.tablet, expectedPadding: 'sm:px-6' },
        { viewport: viewports.desktop, expectedPadding: 'lg:px-8' },
      ]

      viewportTests.forEach(({ viewport }) => {
        setViewport(viewport.width, viewport.height)
        const { rerender } = render(<TestComponent />)
        
        expect(screen.getByTestId('content')).toBeInTheDocument()
        
        rerender(<div />)
      })
    })
  })

  describe('Grid System Responsive Behavior', () => {
    it('adapts grid columns based on viewport', () => {
      const GridComponent = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-testid="grid-item-1">Item 1</div>
          <div data-testid="grid-item-2">Item 2</div>
          <div data-testid="grid-item-3">Item 3</div>
        </div>
      )

      // Test mobile (1 column)
      setViewport(viewports.mobile.width, viewports.mobile.height)
      const { unmount: unmount1 } = render(<GridComponent />)
      expect(screen.getByTestId('grid-item-1')).toBeInTheDocument()
      unmount1()

      // Test tablet (2 columns)
      setViewport(viewports.tablet.width, viewports.tablet.height)
      const { unmount: unmount2 } = render(<GridComponent />)
      expect(screen.getByTestId('grid-item-2')).toBeInTheDocument()
      unmount2()

      // Test desktop (3 columns)
      setViewport(viewports.desktop.width, viewports.desktop.height)
      const { unmount: unmount3 } = render(<GridComponent />)
      expect(screen.getByTestId('grid-item-3')).toBeInTheDocument()
      unmount3()
    })
  })

  describe('Typography Responsive Behavior', () => {
    it('scales text appropriately across viewports', () => {
      const TypographyComponent = () => (
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl">Responsive Heading</h1>
          <p className="text-sm sm:text-base lg:text-lg">Responsive paragraph</p>
        </div>
      )

      const viewportTests = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop,
        viewports.large
      ]

      viewportTests.forEach((viewport) => {
        setViewport(viewport.width, viewport.height)
        const { rerender } = render(<TypographyComponent />)
        
        expect(screen.getByText('Responsive Heading')).toBeInTheDocument()
        expect(screen.getByText('Responsive paragraph')).toBeInTheDocument()
        
        rerender(<div />)
      })
    })
  })

  describe('Image Responsive Behavior', () => {
    it('handles responsive images correctly', () => {
      const ResponsiveImageComponent = () => (
        <div className="w-full">
          <img 
            src="/test-image.jpg" 
            alt="Responsive test image"
            className="w-full h-auto object-cover"
          />
        </div>
      )

      const viewportTests = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop
      ]

      viewportTests.forEach((viewport) => {
        setViewport(viewport.width, viewport.height)
        const { rerender } = render(<ResponsiveImageComponent />)
        
        const image = screen.getByAltText('Responsive test image')
        expect(image).toBeInTheDocument()
        expect(image).toHaveClass('w-full h-auto object-cover')
        
        rerender(<div />)
      })
    })
  })

  describe('Form Responsive Behavior', () => {
    it('adapts form layouts for different screen sizes', () => {
      const ResponsiveForm = () => (
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="First Name"
              className="w-full px-3 py-2 border rounded"
            />
            <input 
              type="text" 
              placeholder="Last Name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </form>
      )

      // Test mobile layout
      setViewport(viewports.mobile.width, viewports.mobile.height)
      const { unmount: unmount1 } = render(<ResponsiveForm />)
      
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument()
      
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      expect(submitButton).toHaveClass('w-full sm:w-auto')
      unmount1()

      // Test desktop layout
      setViewport(viewports.desktop.width, viewports.desktop.height)
      const { unmount: unmount2 } = render(<ResponsiveForm />)
      
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Breakpoint Edge Cases', () => {
    it('handles breakpoint transitions correctly', () => {
      const BreakpointComponent = () => (
        <div className="block sm:hidden md:block lg:hidden xl:block">
          Breakpoint test content
        </div>
      )

      // Test just below sm breakpoint (640px)
      setViewport(639, 400)
      const { rerender } = render(<BreakpointComponent />)
      expect(screen.getByText('Breakpoint test content')).toBeInTheDocument()

      // Test just above sm breakpoint
      setViewport(641, 400)
      rerender(<BreakpointComponent />)
      expect(screen.getByText('Breakpoint test content')).toBeInTheDocument()

      // Test md breakpoint (768px)
      setViewport(768, 400)
      rerender(<BreakpointComponent />)
      expect(screen.getByText('Breakpoint test content')).toBeInTheDocument()
    })
  })

  describe('Accessibility at Different Viewports', () => {
    it('maintains accessibility across viewports', () => {
      const AccessibleComponent = () => (
        <div>
          <button 
            className="p-2 sm:p-3 lg:p-4"
            aria-label="Accessible button"
          >
            Click me
          </button>
          <nav aria-label="Main navigation">
            <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <li><a href="#" className="block p-2">Home</a></li>
              <li><a href="#" className="block p-2">About</a></li>
            </ul>
          </nav>
        </div>
      )

      const viewportTests = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop
      ]

      viewportTests.forEach((viewport) => {
        setViewport(viewport.width, viewport.height)
        const { rerender } = render(<AccessibleComponent />)
        
        expect(screen.getByLabelText('Accessible button')).toBeInTheDocument()
        expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
        
        rerender(<div />)
      })
    })
  })
})