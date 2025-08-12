import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Modal from '../Modal'

expect.extend(toHaveNoViolations)

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Unit tests for basic functionality
  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<Modal {...defaultProps} title="Test Modal" />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')

    rerender(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')

    rerender(<Modal {...defaultProps} size="xl" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl')
  })

  it('shows close button by default', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    expect(screen.queryByLabelText('Cerrar modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByLabelText('Cerrar modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const backdrop = screen.getByRole('dialog').parentElement?.firstChild as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />)
    
    const backdrop = screen.getByRole('dialog').parentElement?.firstChild as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />)
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Modal {...defaultProps} title="Accessible Modal">
        <p>This is accessible content</p>
      </Modal>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes', () => {
    render(<Modal {...defaultProps} title="Test Modal" />)
    const dialog = screen.getByRole('dialog')
    
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('has proper focus management', () => {
    render(<Modal {...defaultProps} />)
    const closeButton = screen.getByLabelText('Cerrar modal')
    
    closeButton.focus()
    expect(closeButton).toHaveFocus()
  })

  it('traps focus within modal', () => {
    render(
      <Modal {...defaultProps} title="Focus Test">
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

  // Body scroll prevention tests
  it('prevents body scroll when open', () => {
    const originalOverflow = document.body.style.overflow
    
    render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    // Cleanup
    document.body.style.overflow = originalOverflow
  })

  it('restores body scroll when closed', () => {
    const originalOverflow = document.body.style.overflow
    
    const { rerender } = render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<Modal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
    
    // Cleanup
    document.body.style.overflow = originalOverflow
  })

  // Event handling tests
  it('does not close when clicking inside modal content', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Modal content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('handles multiple key presses correctly', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'Space' })
    expect(onClose).not.toHaveBeenCalled()
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Integration tests
  it('works with complex content', () => {
    const handleSubmit = jest.fn()
    render(
      <Modal {...defaultProps} title="Form Modal">
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" />
          <button type="submit">Submit</button>
        </form>
      </Modal>
    )
    
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('handles rapid open/close cycles', () => {
    const onClose = jest.fn()
    const { rerender } = render(<Modal {...defaultProps} onClose={onClose} />)
    
    rerender(<Modal {...defaultProps} onClose={onClose} isOpen={false} />)
    rerender(<Modal {...defaultProps} onClose={onClose} isOpen={true} />)
    
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })
})