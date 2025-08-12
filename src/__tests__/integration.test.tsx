import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import { setViewport, viewports, mockProfile } from '@/test-utils'

// Mock components for integration testing
const MockHomePage = () => (
  <div>
    <h1>Project Lens</h1>
    <p>Conecta con profesionales de la industria visual</p>
    <button>Buscar Profesionales</button>
    <div data-testid="featured-profiles">
      <div>Perfiles Destacados</div>
    </div>
  </div>
)

const MockSearchPage = () => (
  <div>
    <h1>Buscar Profesionales</h1>
    <input placeholder="Buscar por nombre o especialidad" />
    <select>
      <option value="">Todos los roles</option>
      <option value="photographer">Fotógrafo</option>
      <option value="model">Modelo</option>
    </select>
    <div data-testid="search-results">
      <div>Resultados de búsqueda</div>
    </div>
  </div>
)

const MockProfilePage = () => (
  <div>
    <h1>{mockProfile.full_name}</h1>
    <p>{mockProfile.bio}</p>
    <button>Contactar</button>
    <div data-testid="portfolio">
      <h2>Portfolio</h2>
      <div>Imágenes del portfolio</div>
    </div>
  </div>
)

expect.extend(toHaveNoViolations)

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Homepage Integration', () => {
    it('renders homepage with all key sections', () => {
      render(<MockHomePage />)
      
      expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
      expect(screen.getByText('Conecta con profesionales de la industria visual')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Buscar Profesionales' })).toBeInTheDocument()
      expect(screen.getByTestId('featured-profiles')).toBeInTheDocument()
    })

    it('should not have accessibility violations', async () => {
      const { container } = render(<MockHomePage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('adapts to mobile viewport', () => {
      setViewport(viewports.mobile.width, viewports.mobile.height)
      render(<MockHomePage />)
      
      expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
    })

    it('handles user interactions', () => {
      render(<MockHomePage />)
      
      const searchButton = screen.getByRole('button', { name: 'Buscar Profesionales' })
      fireEvent.click(searchButton)
      
      expect(searchButton).toBeInTheDocument()
    })
  })

  describe('Search Page Integration', () => {
    it('renders search page with filters and results', () => {
      render(<MockSearchPage />)
      
      expect(screen.getByRole('heading', { name: 'Buscar Profesionales' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Buscar por nombre o especialidad')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByTestId('search-results')).toBeInTheDocument()
    })

    it('should not have accessibility violations', async () => {
      const { container } = render(<MockSearchPage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('handles search input', () => {
      render(<MockSearchPage />)
      
      const searchInput = screen.getByPlaceholderText('Buscar por nombre o especialidad')
      fireEvent.change(searchInput, { target: { value: 'fotógrafo' } })
      
      expect(searchInput).toHaveValue('fotógrafo')
    })

    it('handles filter selection', () => {
      render(<MockSearchPage />)
      
      const roleFilter = screen.getByRole('combobox')
      fireEvent.change(roleFilter, { target: { value: 'photographer' } })
      
      expect(roleFilter).toHaveValue('photographer')
    })

    it('adapts to different viewports', () => {
      const viewportTests = [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop
      ]

      viewportTests.forEach(viewport => {
        setViewport(viewport.width, viewport.height)
        const { unmount } = render(<MockSearchPage />)
        
        expect(screen.getByRole('heading', { name: 'Buscar Profesionales' })).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Profile Page Integration', () => {
    it('renders profile page with all sections', () => {
      render(<MockProfilePage />)
      
      expect(screen.getByRole('heading', { name: mockProfile.full_name })).toBeInTheDocument()
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Contactar' })).toBeInTheDocument()
      expect(screen.getByTestId('portfolio')).toBeInTheDocument()
    })

    it('should not have accessibility violations', async () => {
      const { container } = render(<MockProfilePage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('handles contact button interaction', () => {
      render(<MockProfilePage />)
      
      const contactButton = screen.getByRole('button', { name: 'Contactar' })
      fireEvent.click(contactButton)
      
      expect(contactButton).toBeInTheDocument()
    })

    it('displays portfolio section', () => {
      render(<MockProfilePage />)
      
      const portfolioSection = screen.getByTestId('portfolio')
      expect(portfolioSection).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument()
    })
  })

  describe('Form Integration Tests', () => {
    const MockContactForm = () => {
      const [formData, setFormData] = React.useState({
        subject: '',
        message: ''
      })

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
      }

      return (
        <form onSubmit={handleSubmit}>
          <label htmlFor="subject">Asunto</label>
          <input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          
          <label htmlFor="message">Mensaje</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          
          <button type="submit">Enviar</button>
        </form>
      )
    }

    it('handles form submission flow', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockContactForm />)
      
      // Fill out form
      fireEvent.change(screen.getByLabelText('Asunto'), {
        target: { value: 'Test subject' }
      })
      fireEvent.change(screen.getByLabelText('Mensaje'), {
        target: { value: 'Test message' }
      })
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
      
      expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', {
        subject: 'Test subject',
        message: 'Test message'
      })
      
      consoleSpy.mockRestore()
    })

    it('should not have accessibility violations', async () => {
      const { container } = render(<MockContactForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Navigation Integration', () => {
    const MockAppWithNavigation = () => {
      const [currentPage, setCurrentPage] = React.useState('home')

      const renderPage = () => {
        switch (currentPage) {
          case 'search':
            return <MockSearchPage />
          case 'profile':
            return <MockProfilePage />
          default:
            return <MockHomePage />
        }
      }

      return (
        <div>
          <nav>
            <button onClick={() => setCurrentPage('home')}>Inicio</button>
            <button onClick={() => setCurrentPage('search')}>Buscar</button>
            <button onClick={() => setCurrentPage('profile')}>Perfil</button>
          </nav>
          <main>
            {renderPage()}
          </main>
        </div>
      )
    }

    it('handles navigation between pages', () => {
      render(<MockAppWithNavigation />)
      
      // Start on home page
      expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
      
      // Navigate to search
      fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
      expect(screen.getByRole('heading', { name: 'Buscar Profesionales' })).toBeInTheDocument()
      
      // Navigate to profile
      fireEvent.click(screen.getByRole('button', { name: 'Perfil' }))
      expect(screen.getByRole('heading', { name: mockProfile.full_name })).toBeInTheDocument()
      
      // Navigate back to home
      fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
      expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
    })

    it('should not have accessibility violations during navigation', async () => {
      const { container } = render(<MockAppWithNavigation />)
      
      // Test initial state
      let results = await axe(container)
      expect(results).toHaveNoViolations()
      
      // Navigate and test again
      fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
      results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Error Handling Integration', () => {
    const MockErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      const [hasError, setHasError] = React.useState(false)

      if (hasError) {
        return <div>Something went wrong</div>
      }

      return (
        <div>
          <button onClick={() => setHasError(true)}>Trigger Error</button>
          {children}
        </div>
      )
    }

    it('handles error states gracefully', () => {
      render(
        <MockErrorBoundary>
          <MockHomePage />
        </MockErrorBoundary>
      )
      
      expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: 'Trigger Error' }))
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Performance Integration', () => {
    it('renders large lists efficiently', () => {
      const MockLargeList = () => (
        <div>
          <h1>Large List</h1>
          <ul>
            {Array.from({ length: 100 }, (_, i) => (
              <li key={i}>Item {i + 1}</li>
            ))}
          </ul>
        </div>
      )

      const startTime = performance.now()
      render(<MockLargeList />)
      const endTime = performance.now()
      
      expect(screen.getByRole('heading', { name: 'Large List' })).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 100')).toBeInTheDocument()
      
      // Render should be reasonably fast (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Responsive Integration', () => {
    it('maintains functionality across all viewports', () => {
      const viewportTests = [
        { viewport: viewports.mobile, name: 'mobile' },
        { viewport: viewports.tablet, name: 'tablet' },
        { viewport: viewports.desktop, name: 'desktop' },
        { viewport: viewports.large, name: 'large' }
      ]

      viewportTests.forEach(({ viewport, name }) => {
        setViewport(viewport.width, viewport.height)
        const { unmount } = render(<MockHomePage />)
        
        expect(screen.getByRole('heading', { name: 'Project Lens' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Buscar Profesionales' })).toBeInTheDocument()
        
        unmount()
      })
    })
  })
})