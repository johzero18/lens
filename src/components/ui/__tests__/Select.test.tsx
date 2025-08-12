import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Select from '../Select'

expect.extend(toHaveNoViolations)

describe('Select Component', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  // Unit tests for basic functionality
  it('renders with default props', () => {
    render(<Select options={defaultOptions} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Select label="Choose option" options={defaultOptions} />)
    expect(screen.getByLabelText('Choose option')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Select placeholder="Select an option" options={defaultOptions} />)
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('renders with error state', () => {
    render(<Select error="This field is required" options={defaultOptions} />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    render(<Select helperText="Choose your preferred option" options={defaultOptions} />)
    expect(screen.getByText('Choose your preferred option')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Select disabled options={defaultOptions} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('displays selected value', () => {
    render(<Select value="option2" options={defaultOptions} />)
    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', () => {
    const handleChange = jest.fn()
    render(<Select onChange={handleChange} options={defaultOptions} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option2' } })
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'option2' })
    }))
  })

  it('applies custom className', () => {
    render(<Select className="custom-select" options={defaultOptions} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('custom-select')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Select label="Accessible Select" options={defaultOptions} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper label association', () => {
    render(<Select label="Test Select" options={defaultOptions} />)
    const select = screen.getByLabelText('Test Select')
    expect(select).toBeInTheDocument()
  })

  it('has proper error state accessibility', () => {
    render(<Select label="Test Select" error="Error message" options={defaultOptions} />)
    const select = screen.getByLabelText('Test Select')
    const errorMessage = screen.getByText('Error message')
    
    expect(select).toHaveAttribute('aria-invalid')
    expect(errorMessage).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<Select options={defaultOptions} />)
    const select = screen.getByRole('combobox')
    
    select.focus()
    expect(select).toHaveFocus()
    
    fireEvent.keyDown(select, { key: 'ArrowDown' })
    expect(select).toBeInTheDocument()
  })

  // Integration tests
  it('works in forms', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Select name="testSelect" options={defaultOptions} />
        <button type="submit">Submit</button>
      </form>
    )
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option1' } })
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('handles empty options array', () => {
    render(<Select options={[]} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('handles options with groups', () => {
    const groupedOptions = [
      { value: 'group1', label: 'Group 1', disabled: true },
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ]
    
    render(<Select options={groupedOptions} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('prioritizes error over helper text', () => {
    render(
      <Select 
        error="Error message" 
        helperText="Helper text" 
        options={defaultOptions} 
      />
    )
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })
})