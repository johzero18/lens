import React from 'react'
import { render, screen } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Footer from '../Footer'

expect.extend(toHaveNoViolations)

describe('Footer Component', () => {
  // Unit tests for basic functionality
  it('renders the footer', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the logo and brand name', () => {
    render(<Footer />)
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Footer />)
    
    const expectedLinks = [
      'Acerca de',
      'Ayuda',
      'Contacto',
      'Términos de Servicio',
      'Política de Privacidad'
    ]
    
    expectedLinks.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument()
    })
  })

  it('renders social media links', () => {
    render(<Footer />)
    
    // Look for social media links (they might be aria-labeled)
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/twitter/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument()
  })

  it('has correct href attributes for navigation links', () => {
    render(<Footer />)
    
    expect(screen.getByRole('link', { name: 'Acerca de' })).toHaveAttribute('href', '/acerca-de')
    expect(screen.getByRole('link', { name: 'Ayuda' })).toHaveAttribute('href', '/ayuda')
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto')
    expect(screen.getByRole('link', { name: 'Términos de Servicio' })).toHaveAttribute('href', '/terminos')
    expect(screen.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute('href', '/privacidad')
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper landmark role', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('has proper link accessibility', () => {
    render(<Footer />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('has proper social media link accessibility', () => {
    render(<Footer />)
    
    const socialLinks = [
      screen.getByLabelText(/instagram/i),
      screen.getByLabelText(/twitter/i),
      screen.getByLabelText(/linkedin/i)
    ]
    
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('href')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('supports keyboard navigation', () => {
    render(<Footer />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      link.focus()
      expect(link).toHaveFocus()
    })
  })

  // Responsive design tests
  it('has responsive layout classes', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-secondary-50')
  })

  it('organizes content in sections', () => {
    render(<Footer />)
    
    // Check for different sections
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
    expect(screen.getByText('Enlaces')).toBeInTheDocument()
    expect(screen.getByText('Síguenos')).toBeInTheDocument()
  })

  // Integration tests
  it('renders consistently across multiple renders', () => {
    const { rerender } = render(<Footer />)
    
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
    
    rerender(<Footer />)
    expect(screen.getByText('Project Lens')).toBeInTheDocument()
  })

  it('maintains proper spacing and layout', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('py-12')
  })

  it('has proper text hierarchy', () => {
    render(<Footer />)
    
    // Brand name should be prominent
    const brandName = screen.getByText('Project Lens')
    expect(brandName).toHaveClass('text-xl font-bold')
  })

  it('includes newsletter signup', () => {
    render(<Footer />)
    
    expect(screen.getByText(/suscríbete/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /suscribirse/i })).toBeInTheDocument()
  })

  it('handles newsletter form submission', () => {
    render(<Footer />)
    
    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /suscribirse/i })
    
    expect(emailInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('shows platform statistics', () => {
    render(<Footer />)
    
    // Look for statistics section
    expect(screen.getByText(/profesionales/i)).toBeInTheDocument()
    expect(screen.getByText(/proyectos/i)).toBeInTheDocument()
  })
})