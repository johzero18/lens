import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Textarea from '../Textarea'

expect.extend(toHaveNoViolations)

describe('Textarea Component', () => {
  // Unit tests for basic functionality
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Textarea label="Message" placeholder="Enter message" />)
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    render(<Textarea helperText="Maximum 500 characters" />)
    expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument()
  })

  it('renders with error state', () => {
    render(<Textarea error="This field is required" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-error-300')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders with success state', () => {
    render(<Textarea variant="success" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-success-300')
  })

  it('handles disabled state', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />)
    const textarea = screen.getByPlaceholderText('Disabled textarea')
    expect(textarea).toBeDisabled()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Textarea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')
    
    fireEvent.change(textarea, { target: { value: 'test message' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(textarea).toHaveValue('test message')
  })

  it('respects rows prop', () => {
    render(<Textarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('respects maxLength prop', () => {
    render(<Textarea maxLength={100} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('shows character count when showCount is true', () => {
    render(<Textarea showCount maxLength={100} value="Hello" />)
    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-textarea')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Textarea label="Accessible textarea" placeholder="Enter text" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper label association', () => {
    render(<Textarea label="Message" />)
    const textarea = screen.getByLabelText('Message')
    expect(textarea).toBeInTheDocument()
  })

  it('has proper focus management', () => {
    render(<Textarea placeholder="Focus test" />)
    const textarea = screen.getByPlaceholderText('Focus test')
    
    textarea.focus()
    expect(textarea).toHaveFocus()
  })

  it('has proper error state accessibility', () => {
    render(<Textarea label="Message" error="Invalid message" />)
    const textarea = screen.getByLabelText('Message')
    const errorMessage = screen.getByText('Invalid message')
    
    expect(textarea).toHaveAttribute('aria-invalid')
    expect(errorMessage).toBeInTheDocument()
  })

  // Integration tests
  it('works correctly in forms', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Textarea name="message" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'test message' } })
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('handles resize prop correctly', () => {
    const { rerender } = render(<Textarea resize="none" />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-none')

    rerender(<Textarea resize="vertical" />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-y')

    rerender(<Textarea resize="horizontal" />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-x')
  })

  it('prioritizes error over helper text', () => {
    render(<Textarea error="Error message" helperText="Helper text" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('updates character count on input', () => {
    render(<Textarea showCount maxLength={50} />)
    const textarea = screen.getByRole('textbox')
    
    fireEvent.change(textarea, { target: { value: 'Hello world' } })
    expect(screen.getByText('11/50')).toBeInTheDocument()
  })

  it('shows warning when approaching character limit', () => {
    render(<Textarea showCount maxLength={10} value="123456789" />)
    const countElement = screen.getByText('9/10')
    expect(countElement).toHaveClass('text-warning-600')
  })

  it('shows error when exceeding character limit', () => {
    render(<Textarea showCount maxLength={5} value="123456" />)
    const countElement = screen.getByText('6/5')
    expect(countElement).toHaveClass('text-error-600')
  })
})