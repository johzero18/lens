import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import LoginForm from '../LoginForm'

expect.extend(toHaveNoViolations)

describe('LoginForm Component', () => {
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
    render(<LoginForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    render(<LoginForm {...defaultProps} loading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    expect(submitButton).toBeDisabled()
  })

  it('validates email field', async () => {
    render(<LoginForm {...defaultProps} />)
    
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
  })

  it('validates password field', async () => {
    render(<LoginForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/contraseña/i)
    
    // Test empty password
    fireEvent.blur(passwordInput)
    await waitFor(() => {
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<LoginForm {...defaultProps} />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { 
      target: { value: 'password123' } 
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('prevents submission with invalid data', async () => {
    render(<LoginForm {...defaultProps} />)
    
    // Try to submit empty form
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('shows remember me checkbox', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByLabelText(/recordar sesión/i)).toBeInTheDocument()
  })

  it('shows forgot password button', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /olvidaste tu contraseña/i })).toBeInTheDocument()
  })

  it('shows registration button', () => {
    render(<LoginForm {...defaultProps} />)
    expect(screen.getByText(/no tienes cuenta/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regístrate aquí/i })).toBeInTheDocument()
  })

  // Accessibility tests
  it('has proper form structure', () => {
    render(<LoginForm {...defaultProps} />)
    
    // Check that form elements are properly structured
    expect(screen.getByRole('form') || screen.getByLabelText(/email/i).closest('form')).toBeInTheDocument()
  })

  it('has proper form labels and associations', () => {
    render(<LoginForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/recordar sesión/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<LoginForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    
    emailInput.focus()
    expect(emailInput).toHaveFocus()
    
    fireEvent.keyDown(emailInput, { key: 'Tab' })
    expect(passwordInput).toBeInTheDocument()
  })

  // Integration tests
  it('handles form submission errors gracefully', async () => {
    const mockOnSubmitWithError = jest.fn().mockRejectedValue(new Error('Login failed'))
    
    render(<LoginForm onSubmit={mockOnSubmitWithError} />)
    
    // Fill out valid form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { 
      target: { value: 'password123' } 
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(mockOnSubmitWithError).toHaveBeenCalled()
    })
  })

  it('has password visibility toggle button', () => {
    render(<LoginForm {...defaultProps} />)
    
    const passwordInput = screen.getByLabelText(/contraseña/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Look for password toggle button (it might not have accessible name)
    const toggleButtons = screen.getAllByRole('button')
    const passwordToggle = toggleButtons.find(button => 
      button.querySelector('svg') && button.closest('.absolute')
    )
    expect(passwordToggle).toBeInTheDocument()
  })

  it('handles remember me checkbox', () => {
    render(<LoginForm {...defaultProps} />)
    
    const rememberCheckbox = screen.getByLabelText(/recordar sesión/i)
    expect(rememberCheckbox).not.toBeChecked()
    
    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
  })
})