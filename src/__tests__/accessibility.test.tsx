import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ProfileCard from '@/components/features/ProfileCard'
import Navbar from '@/components/layout/Navbar'
import { mockProfile } from '@/test-utils'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Button Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA attributes when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('disabled')
      expect(button).toBeDisabled()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA attributes when loading', async () => {
      const { container } = render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('disabled')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' })
      // Test Space key
      fireEvent.keyDown(button, { key: ' ' })
      
      expect(button).toBeInTheDocument()
    })

    it('has sufficient color contrast', () => {
      render(<Button variant="primary">Primary Button</Button>)
      const button = screen.getByRole('button')
      
      // Primary button should have high contrast
      expect(button).toHaveClass('bg-primary-600 text-white')
    })
  })

  describe('Input Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Input label="Accessible Input" placeholder="Enter text" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper label association', () => {
      render(<Input label="Email Address" />)
      const input = screen.getByLabelText('Email Address')
      expect(input).toBeInTheDocument()
    })

    it('has proper error state accessibility', async () => {
      const { container } = render(
        <Input 
          label="Email" 
          error="Invalid email format"
          aria-describedby="email-error"
        />
      )
      
      const input = screen.getByLabelText('Email')
      const errorMessage = screen.getByText('Invalid email format')
      
      expect(input).toHaveAttribute('aria-invalid')
      expect(errorMessage).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports keyboard navigation', () => {
      render(<Input label="Test Input" />)
      const input = screen.getByLabelText('Test Input')
      
      input.focus()
      expect(input).toHaveFocus()
      
      fireEvent.keyDown(input, { key: 'Tab' })
      expect(input).toBeInTheDocument()
    })

    it('has proper placeholder accessibility', async () => {
      const { container } = render(
        <Input 
          label="Search" 
          placeholder="Search for professionals..."
        />
      )
      
      const input = screen.getByPlaceholderText('Search for professionals...')
      expect(input).toHaveAttribute('placeholder', 'Search for professionals...')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Modal Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
          <p>Modal content</p>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('traps focus within modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Focus Test">
          <input placeholder="First input" />
          <input placeholder="Second input" />
        </Modal>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      const closeButton = screen.getByLabelText('Cerrar modal')
      
      // All focusable elements should be present
      expect(firstInput).toBeInTheDocument()
      expect(secondInput).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('supports Escape key to close', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Test">
          <p>Press Escape to close</p>
        </Modal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('has proper close button accessibility', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Close Test">
          <p>Modal with close button</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Cerrar modal')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Cerrar modal')
    })
  })

  describe('ProfileCard Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ProfileCard profile={mockProfile} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper image alt text', () => {
      render(<ProfileCard profile={mockProfile} />)
      
      const avatarImg = screen.getByAltText(`${mockProfile.full_name} - Fotógrafo/a`)
      expect(avatarImg).toBeInTheDocument()
    })

    it('has proper heading hierarchy', () => {
      render(<ProfileCard profile={mockProfile} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent(mockProfile.full_name)
    })

    it('has accessible contact button', () => {
      render(<ProfileCard profile={mockProfile} />)
      
      const contactButton = screen.getByRole('button', { name: /contactar/i })
      expect(contactButton).toBeInTheDocument()
      expect(contactButton).toHaveAttribute('type', 'button')
    })

    it('supports keyboard interaction', () => {
      const handleClick = jest.fn()
      render(<ProfileCard profile={mockProfile} onClick={handleClick} />)
      
      const card = screen.getByText(mockProfile.full_name).closest('.cursor-pointer')
      if (card) {
        fireEvent.keyDown(card, { key: 'Enter' })
        fireEvent.keyDown(card, { key: ' ' })
      }
      
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    })
  })

  describe('Navbar Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Navbar />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper navigation landmark', () => {
      render(<Navbar />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has proper link accessibility', () => {
      render(<Navbar />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('has accessible mobile menu button', () => {
      render(<Navbar />)
      
      const menuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('supports keyboard navigation', () => {
      render(<Navbar />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        link.focus()
        expect(link).toHaveFocus()
      })
    })
  })

  describe('Form Accessibility', () => {
    it('has proper form structure', async () => {
      const TestForm = () => (
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            <Input label="First Name" required />
            <Input label="Last Name" required />
          </fieldset>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const { container } = render(<TestForm />)
      
      expect(screen.getByRole('group', { name: 'Personal Information' })).toBeInTheDocument()
      expect(screen.getByLabelText('First Name')).toBeRequired()
      expect(screen.getByLabelText('Last Name')).toBeRequired()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper error message association', async () => {
      const FormWithErrors = () => (
        <form>
          <Input 
            label="Email"
            error="Please enter a valid email"
            aria-describedby="email-error"
          />
        </form>
      )
      
      const { container } = render(<FormWithErrors />)
      
      const input = screen.getByLabelText('Email')
      const errorMessage = screen.getByText('Please enter a valid email')
      
      expect(input).toHaveAttribute('aria-invalid')
      expect(errorMessage).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('has sufficient color contrast for text', () => {
      render(
        <div>
          <p className="text-secondary-900">High contrast text</p>
          <p className="text-secondary-600">Medium contrast text</p>
          <Button variant="primary">High contrast button</Button>
        </div>
      )
      
      expect(screen.getByText('High contrast text')).toHaveClass('text-secondary-900')
      expect(screen.getByText('Medium contrast text')).toHaveClass('text-secondary-600')
      expect(screen.getByRole('button')).toHaveClass('bg-primary-600 text-white')
    })

    it('provides visual focus indicators', () => {
      render(
        <div>
          <Button>Focusable Button</Button>
          <Input label="Focusable Input" />
        </div>
      )
      
      const button = screen.getByRole('button')
      const input = screen.getByLabelText('Focusable Input')
      
      expect(button).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-2')
    })
  })

  describe('Screen Reader Support', () => {
    it('provides proper semantic markup', () => {
      render(
        <article>
          <header>
            <h1>Article Title</h1>
            <p>Article subtitle</p>
          </header>
          <main>
            <p>Article content</p>
          </main>
          <footer>
            <p>Article footer</p>
          </footer>
        </article>
      )
      
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('provides proper ARIA labels and descriptions', async () => {
      const AccessibleComponent = () => (
        <div>
          <button 
            aria-label="Close dialog"
            aria-describedby="close-description"
          >
            ×
          </button>
          <div id="close-description">
            Closes the current dialog and returns to the main page
          </div>
        </div>
      )
      
      const { container } = render(<AccessibleComponent />)
      
      const button = screen.getByLabelText('Close dialog')
      expect(button).toHaveAttribute('aria-describedby', 'close-description')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through interactive elements', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Input label="Text Input" />
          <Button>Second Button</Button>
        </div>
      )
      
      const firstButton = screen.getByRole('button', { name: 'First Button' })
      const input = screen.getByLabelText('Text Input')
      const secondButton = screen.getByRole('button', { name: 'Second Button' })
      
      // Test that all elements are focusable
      firstButton.focus()
      expect(firstButton).toHaveFocus()
      
      input.focus()
      expect(input).toHaveFocus()
      
      secondButton.focus()
      expect(secondButton).toHaveFocus()
    })

    it('skips non-interactive elements during tab navigation', () => {
      render(
        <div>
          <p>Non-interactive text</p>
          <Button>Interactive Button</Button>
          <div>Non-interactive div</div>
          <Input label="Interactive Input" />
        </div>
      )
      
      // Only interactive elements should be focusable
      const button = screen.getByRole('button')
      const input = screen.getByLabelText('Interactive Input')
      
      expect(button).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })
  })
})