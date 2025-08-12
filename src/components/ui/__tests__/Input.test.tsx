import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Input from '../Input'

expect.extend(toHaveNoViolations)

describe('Input Component', () => {
  // Unit tests for basic functionality
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('border-secondary-300')
  })

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    render(<Input helperText="This is helper text" />)
    expect(screen.getByText('This is helper text')).toBeInTheDocument()
  })

  it('renders with error state', () => {
    render(<Input error="This field is required" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-error-300')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveClass('text-error-600')
  })

  it('renders with success state', () => {
    render(<Input variant="success" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-success-300')
  })

  it('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">📧</span>
    render(<Input leftIcon={<LeftIcon />} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pl-10')
  })

  it('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">🔍</span>
    render(<Input rightIcon={<RightIcon />} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pr-10')
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    
    fireEvent.change(input, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('test value')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Input label="Accessible input" placeholder="Enter text" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper label association', () => {
    render(<Input label="Email Address" />)
    const input = screen.getByLabelText('Email Address')
    expect(input).toBeInTheDocument()
  })

  it('has proper focus management', () => {
    render(<Input placeholder="Focus test" />)
    const input = screen.getByPlaceholderText('Focus test')
    
    input.focus()
    expect(input).toHaveFocus()
    expect(input).toHaveClass('focus:ring-2')
  })

  it('supports keyboard navigation', () => {
    render(<Input placeholder="Keyboard test" />)
    const input = screen.getByPlaceholderText('Keyboard test')
    
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(input).toBeInTheDocument()
  })

  // Error state accessibility
  it('has proper error state accessibility', () => {
    render(<Input label="Email" error="Invalid email format" />)
    const input = screen.getByLabelText('Email')
    const errorMessage = screen.getByText('Invalid email format')
    
    expect(errorMessage).toHaveClass('text-error-600')
    expect(input).toHaveClass('border-error-300')
  })

  // Integration tests
  it('works correctly in forms', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Input name="email" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('shows error icon when in error state', () => {
    render(<Input error="Error message" />)
    const errorIcon = screen.getByRole('textbox').parentElement?.querySelector('svg')
    expect(errorIcon).toBeInTheDocument()
  })

  it('shows success icon when in success state', () => {
    render(<Input variant="success" />)
    const successIcon = screen.getByRole('textbox').parentElement?.querySelector('svg')
    expect(successIcon).toBeInTheDocument()
  })

  it('prioritizes error over helper text', () => {
    render(<Input error="Error message" helperText="Helper text" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })
})