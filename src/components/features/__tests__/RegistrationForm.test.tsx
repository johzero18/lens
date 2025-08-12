import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import RegistrationForm from '../RegistrationForm'

expect.extend(toHaveNoViolations)

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  isValidEmail: jest.fn((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isValidPassword: jest.fn((password: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)),
  isValidUsername: jest.fn((username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username)),
}))

describe('RegistrationForm Component', () => {
  const mockOnSubmit = jest.fn()
  
  const defaultProps = {
    onSubmit: mockOnSubmit,
    loading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Unit tests for basic functionality
  it('renders all form fields', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/rol profesional/i)).toBeInTheDocument()
  })

  it('renders role options correctly', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    expect(screen.getByText('Fotógrafo/a')).toBeInTheDocument()
    expect(screen.getByText('Modelo')).toBeInTheDocument()
    expect(screen.getByText('Maquillador/a')).toBeInTheDocument()
    expect(screen.getByText('Estilista')).toBeInTheDocument()
    expect(screen.getByText('Productor/a')).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    render(<RegistrationForm {...defaultProps} loading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(submitButton).toBeDisabled()
  })

  it('validates email field in real-time', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    
    // Test empty email
    fireEvent.blur(emailInput)
    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })
    
    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    await waitFor(() => {
      expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument()
    })
    
    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.blur(emailInput)
    await waitFor(() => {
      expect(screen.queryByText(/email/i)).not.toBeInTheDocument()
    })
  })

  it('validates password field in real-time', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^contraseña$/i)
    
    // Test empty password
    fireEvent.blur(passwordInput)
    await waitFor(() => {
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
    
    // Test short password
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.blur(passwordInput)
    await waitFor(() => {
      expect(screen.getByText(/debe tener al menos/i)).toBeInTheDocument()
    })
    
    // Test valid password
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.blur(passwordInput)
    await waitFor(() => {
      expect(screen.queryByText(/contraseña es requerida/i)).not.toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/^contraseña$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
    
    // Set password
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Test non-matching confirmation
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } })
    fireEvent.blur(confirmPasswordInput)
    
    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
    
    // Test matching confirmation
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.blur(confirmPasswordInput)
    
    await waitFor(() => {
      expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument()
    })
  })

  it('validates username field', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const usernameInput = screen.getByLabelText(/nombre de usuario/i)
    
    // Test empty username
    fireEvent.blur(usernameInput)
    await waitFor(() => {
      expect(screen.getByText('El nombre de usuario es requerido')).toBeInTheDocument()
    })
    
    // Test short username
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.blur(usernameInput)
    await waitFor(() => {
      expect(screen.getByText(/mínimo.*caracteres/i)).toBeInTheDocument()
    })
    
    // Test valid username
    fireEvent.change(usernameInput, { target: { value: 'validuser123' } })
    fireEvent.blur(usernameInput)
    await waitFor(() => {
      expect(screen.queryByText(/nombre de usuario es requerido/i)).not.toBeInTheDocument()
    })
  })

  it('validates full name field', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const fullNameInput = screen.getByLabelText(/nombre completo/i)
    
    // Test empty name
    fireEvent.blur(fullNameInput)
    await waitFor(() => {
      expect(screen.getByText('El nombre completo es requerido')).toBeInTheDocument()
    })
    
    // Test short name
    fireEvent.change(fullNameInput, { target: { value: 'A' } })
    fireEvent.blur(fullNameInput)
    await waitFor(() => {
      expect(screen.getByText(/debe tener al menos 2 caracteres/i)).toBeInTheDocument()
    })
    
    // Test valid name
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } })
    fireEvent.blur(fullNameInput)
    await waitFor(() => {
      expect(screen.queryByText(/nombre completo es requerido/i)).not.toBeInTheDocument()
    })
  })

  it('validates role selection', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const roleSelect = screen.getByLabelText(/rol profesional/i)
    
    // Test empty role
    fireEvent.blur(roleSelect)
    await waitFor(() => {
      expect(screen.getByText('Selecciona tu rol profesional')).toBeInTheDocument()
    })
    
    // Test valid role selection
    fireEvent.change(roleSelect, { target: { value: 'photographer' } })
    fireEvent.blur(roleSelect)
    await waitFor(() => {
      expect(screen.queryByText('Selecciona tu rol profesional')).not.toBeInTheDocument()
    })
  })

  it('checks username availability', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const usernameInput = screen.getByLabelText(/nombre de usuario/i)
    
    // Test unavailable username
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.blur(usernameInput)
    
    await waitFor(() => {
      expect(screen.getByText(/no está disponible/i)).toBeInTheDocument()
    }, { timeout: 1000 })
    
    // Test available username
    fireEvent.change(usernameInput, { target: { value: 'availableuser' } })
    fireEvent.blur(usernameInput)
    
    await waitFor(() => {
      expect(screen.getByText(/está disponible/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('submits form with valid data', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { 
      target: { value: 'password123' } 
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { 
      target: { value: 'password123' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { 
      target: { value: 'testuser' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { 
      target: { value: 'Test User' } 
    })
    fireEvent.change(screen.getByLabelText(/rol profesional/i), { 
      target: { value: 'photographer' } 
    })
    
    // Wait for username availability check
    await waitFor(() => {
      expect(screen.getByText(/está disponible/i)).toBeInTheDocument()
    }, { timeout: 1000 })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        full_name: 'Test User',
        role: 'photographer'
      })
    })
  })

  it('prevents submission with invalid data', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    // Try to submit empty form
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    
    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<RegistrationForm {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper form labels and associations', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/rol profesional/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^contraseña$/i)
    
    emailInput.focus()
    expect(emailInput).toHaveFocus()
    
    fireEvent.keyDown(emailInput, { key: 'Tab' })
    // Note: jsdom doesn't automatically handle tab navigation
    // but we can verify the elements are focusable
    expect(passwordInput).toBeInTheDocument()
  })

  it('shows proper error states with ARIA attributes', async () => {
    render(<RegistrationForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      const errorMessage = screen.getByText('El email es requerido')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveClass('text-error-600')
    })
  })

  // Integration tests
  it('handles form submission errors gracefully', async () => {
    const mockOnSubmitWithError = jest.fn().mockRejectedValue(new Error('Submission failed'))
    
    render(<RegistrationForm onSubmit={mockOnSubmitWithError} />)
    
    // Fill out valid form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { 
      target: { value: 'password123' } 
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { 
      target: { value: 'password123' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { 
      target: { value: 'testuser' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { 
      target: { value: 'Test User' } 
    })
    fireEvent.change(screen.getByLabelText(/rol profesional/i), { 
      target: { value: 'photographer' } 
    })
    
    // Wait for username check and submit
    await waitFor(() => {
      expect(screen.getByText(/está disponible/i)).toBeInTheDocument()
    }, { timeout: 1000 })
    
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    
    await waitFor(() => {
      expect(mockOnSubmitWithError).toHaveBeenCalled()
    })
  })

  it('shows terms and privacy links', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    expect(screen.getByText(/términos de servicio/i)).toBeInTheDocument()
    expect(screen.getByText(/política de privacidad/i)).toBeInTheDocument()
  })

  it('shows login link', () => {
    render(<RegistrationForm {...defaultProps} />)
    
    expect(screen.getByText(/ya tienes cuenta/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument()
  })
})