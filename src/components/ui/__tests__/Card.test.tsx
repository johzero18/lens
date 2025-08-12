import React from 'react'
import { render, screen } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Card from '../Card'

expect.extend(toHaveNoViolations)

describe('Card Component', () => {
  // Unit tests for basic functionality
  it('renders with default props', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<Card title="Card Title">Card content</Card>)
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(
      <Card title="Card Title" subtitle="Card Subtitle">
        Card content
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with footer', () => {
    render(
      <Card footer={<button>Footer Button</button>}>
        Card content
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-card">Card content</Card>)
    const cardElement = screen.getByText('Card content').closest('.custom-card')
    expect(cardElement).toBeInTheDocument()
  })

  it('handles clickable cards', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Clickable card</Card>)
    
    const cardElement = screen.getByText('Clickable card').closest('div')
    expect(cardElement).toHaveClass('cursor-pointer')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Card title="Accessible Card">
        <p>This is accessible content</p>
      </Card>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper heading hierarchy when title is provided', () => {
    render(<Card title="Card Title">Card content</Card>)
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Card Title')
  })

  it('supports keyboard interaction when clickable', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Clickable card</Card>)
    
    const cardElement = screen.getByText('Clickable card').closest('div')
    expect(cardElement).toHaveAttribute('tabIndex', '0')
    expect(cardElement).toHaveAttribute('role', 'button')
  })

  // Integration tests
  it('works with complex content', () => {
    render(
      <Card 
        title="Complex Card" 
        subtitle="With multiple elements"
        footer={<button>Action</button>}
      >
        <div>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      </Card>
    )
    
    expect(screen.getByText('Complex Card')).toBeInTheDocument()
    expect(screen.getByText('With multiple elements')).toBeInTheDocument()
    expect(screen.getByText('Paragraph content')).toBeInTheDocument()
    expect(screen.getByText('List item 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})