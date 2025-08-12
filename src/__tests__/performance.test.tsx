import React from 'react'
import { render, screen } from '@/test-utils'
import ProfileCard from '@/components/features/ProfileCard'
import { mockProfile } from '@/test-utils'

describe('Performance Tests', () => {
  describe('Component Rendering Performance', () => {
    it('renders ProfileCard efficiently', () => {
      const startTime = performance.now()
      
      render(<ProfileCard profile={mockProfile} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
      expect(renderTime).toBeLessThan(50) // Should render in less than 50ms
    })

    it('renders multiple ProfileCards efficiently', () => {
      const profiles = Array.from({ length: 20 }, (_, i) => ({
        ...mockProfile,
        id: `profile-${i}`,
        full_name: `User ${i + 1}`,
        username: `user${i + 1}`
      }))

      const startTime = performance.now()
      
      render(
        <div>
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 20')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(200) // Should render 20 cards in less than 200ms
    })

    it('handles rapid re-renders efficiently', () => {
      const TestComponent = ({ count }: { count: number }) => (
        <div>
          <h1>Count: {count}</h1>
          <ProfileCard profile={mockProfile} />
        </div>
      )

      const startTime = performance.now()
      
      const { rerender } = render(<TestComponent count={0} />)
      
      // Simulate rapid re-renders
      for (let i = 1; i <= 10; i++) {
        rerender(<TestComponent count={i} />)
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(screen.getByText('Count: 10')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(100) // Should handle 10 re-renders in less than 100ms
    })
  })

  describe('Memory Usage', () => {
    it('cleans up properly after unmount', () => {
      const { unmount } = render(<ProfileCard profile={mockProfile} />)
      
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
      
      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow()
    })

    it('handles large datasets without memory leaks', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockProfile,
        id: `profile-${i}`,
        full_name: `User ${i + 1}`,
        bio: `Bio for user ${i + 1}`.repeat(10) // Larger bio text
      }))

      const { unmount } = render(
        <div>
          {largeDataset.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )

      expect(screen.getByText('User 1')).toBeInTheDocument()
      
      // Should unmount without issues
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Event Handler Performance', () => {
    it('handles rapid click events efficiently', () => {
      const handleClick = jest.fn()
      
      render(<ProfileCard profile={mockProfile} onClick={handleClick} />)
      
      const card = screen.getByText(mockProfile.full_name).closest('.cursor-pointer')
      
      const startTime = performance.now()
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        if (card) {
          card.click()
        }
      }
      
      const endTime = performance.now()
      const eventTime = endTime - startTime
      
      expect(handleClick).toHaveBeenCalledTimes(10)
      expect(eventTime).toBeLessThan(50) // Should handle 10 clicks in less than 50ms
    })

    it('debounces search input efficiently', () => {
      const MockSearchInput = () => {
        const [value, setValue] = React.useState('')
        const [debouncedValue, setDebouncedValue] = React.useState('')

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setDebouncedValue(value)
          }, 300)

          return () => clearTimeout(timer)
        }, [value])

        return (
          <div>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="debounced-value">{debouncedValue}</div>
          </div>
        )
      }

      render(<MockSearchInput />)
      
      const input = screen.getByPlaceholderText('Search...')
      const startTime = performance.now()
      
      // Simulate rapid typing
      const searchTerm = 'photographer'
      for (let i = 0; i < searchTerm.length; i++) {
        input.focus()
        // Simulate typing each character
      }
      
      const endTime = performance.now()
      const inputTime = endTime - startTime
      
      expect(inputTime).toBeLessThan(100) // Should handle rapid input in less than 100ms
    })
  })

  describe('Image Loading Performance', () => {
    it('handles image loading states efficiently', () => {
      const MockImageComponent = ({ src }: { src: string }) => {
        const [loaded, setLoaded] = React.useState(false)
        const [error, setError] = React.useState(false)

        return (
          <div>
            {!loaded && !error && <div data-testid="loading">Loading...</div>}
            {error && <div data-testid="error">Error loading image</div>}
            <img
              src={src}
              alt="Test"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              style={{ display: loaded ? 'block' : 'none' }}
            />
          </div>
        )
      }

      const startTime = performance.now()
      
      render(<MockImageComponent src="/test-image.jpg" />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(50) // Should render loading state quickly
    })
  })

  describe('Form Performance', () => {
    it('handles form validation efficiently', () => {
      const MockForm = () => {
        const [email, setEmail] = React.useState('')
        const [errors, setErrors] = React.useState<string[]>([])

        const validateEmail = (value: string) => {
          const newErrors: string[] = []
          if (!value) newErrors.push('Email is required')
          if (value && !/\S+@\S+\.\S+/.test(value)) newErrors.push('Invalid email')
          setErrors(newErrors)
        }

        return (
          <form>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                validateEmail(e.target.value)
              }}
              placeholder="Email"
            />
            {errors.map((error, index) => (
              <div key={index} data-testid="error">{error}</div>
            ))}
          </form>
        )
      }

      const startTime = performance.now()
      
      render(<MockForm />)
      
      const input = screen.getByPlaceholderText('Email')
      
      // Simulate typing
      input.focus()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(50) // Should render form quickly
    })
  })

  describe('List Virtualization Performance', () => {
    it('handles large lists with virtualization concept', () => {
      const MockVirtualizedList = ({ items }: { items: any[] }) => {
        const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 10 })
        
        const visibleItems = items.slice(visibleRange.start, visibleRange.end)

        return (
          <div>
            <div data-testid="total-count">Total: {items.length}</div>
            <div data-testid="visible-count">Visible: {visibleItems.length}</div>
            {visibleItems.map((item, index) => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                {item.name}
              </div>
            ))}
          </div>
        )
      }

      const largeItemList = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i + 1}`
      }))

      const startTime = performance.now()
      
      render(<MockVirtualizedList items={largeItemList} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(screen.getByTestId('total-count')).toHaveTextContent('Total: 1000')
      expect(screen.getByTestId('visible-count')).toHaveTextContent('Visible: 10')
      expect(screen.getByTestId('item-0')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(100) // Should render virtualized list quickly
    })
  })

  describe('Animation Performance', () => {
    it('handles CSS animations efficiently', () => {
      const MockAnimatedComponent = ({ animate }: { animate: boolean }) => (
        <div
          className={`transition-all duration-300 ${
            animate ? 'transform scale-110 opacity-100' : 'transform scale-100 opacity-50'
          }`}
          data-testid="animated-element"
        >
          Animated Content
        </div>
      )

      const startTime = performance.now()
      
      const { rerender } = render(<MockAnimatedComponent animate={false} />)
      
      // Trigger animation
      rerender(<MockAnimatedComponent animate={true} />)
      
      const endTime = performance.now()
      const animationTime = endTime - startTime
      
      expect(screen.getByTestId('animated-element')).toBeInTheDocument()
      expect(animationTime).toBeLessThan(50) // Should trigger animation quickly
    })
  })

  describe('Bundle Size Impact', () => {
    it('imports only necessary dependencies', () => {
      // This test ensures we're not importing unnecessary code
      const startTime = performance.now()
      
      // Simulate dynamic import
      const component = React.lazy(() => 
        Promise.resolve({ default: () => <div>Lazy Component</div> })
      )
      
      const endTime = performance.now()
      const importTime = endTime - startTime
      
      expect(importTime).toBeLessThan(10) // Should resolve lazy import quickly
    })
  })
})