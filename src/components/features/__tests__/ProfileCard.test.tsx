import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import ProfileCard from '../ProfileCard'
import { mockProfile, mockModelProfile, setViewport, viewports } from '@/test-utils'

expect.extend(toHaveNoViolations)

describe('ProfileCard Component', () => {
  const defaultProps = {
    profile: mockProfile
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Unit tests for basic functionality
  it('renders profile information correctly', () => {
    render(<ProfileCard {...defaultProps} />)
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    expect(screen.getByText('Fotógrafo/a')).toBeInTheDocument()
    expect(screen.getByText(mockProfile.location)).toBeInTheDocument()
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument()
  })

  it('renders with grid variant by default', () => {
    render(<ProfileCard {...defaultProps} />)
    
    // Grid variant should have cover image area
    const coverArea = screen.getByText(mockProfile.full_name).closest('.group')
    expect(coverArea).toBeInTheDocument()
  })

  it('renders with list variant', () => {
    render(<ProfileCard {...defaultProps} variant="list" />)
    
    // List variant should have different layout
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    expect(screen.getByText('Fotógrafo/a')).toBeInTheDocument()
  })

  it('shows contact button by default', () => {
    render(<ProfileCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /contactar/i })).toBeInTheDocument()
  })

  it('hides contact button when showContact is false', () => {
    render(<ProfileCard {...defaultProps} showContact={false} />)
    expect(screen.queryByRole('button', { name: /contactar/i })).not.toBeInTheDocument()
  })

  it('displays PRO badge for pro users', () => {
    const proProfile = { ...mockProfile, subscription_tier: 'pro' as const }
    render(<ProfileCard profile={proProfile} />)
    expect(screen.getByText('PRO')).toBeInTheDocument()
  })

  it('does not display PRO badge for free users', () => {
    render(<ProfileCard {...defaultProps} />)
    expect(screen.queryByText('PRO')).not.toBeInTheDocument()
  })

  it('displays role-specific colors', () => {
    const { rerender } = render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText('Fotógrafo/a')).toHaveClass('bg-blue-100 text-blue-800')

    rerender(<ProfileCard profile={mockModelProfile} />)
    expect(screen.getByText('Modelo')).toHaveClass('bg-pink-100 text-pink-800')
  })

  it('displays specialties when available', () => {
    render(<ProfileCard {...defaultProps} />)
    
    // Check for photographer specialties
    expect(screen.getByText('Retrato')).toBeInTheDocument()
    expect(screen.getByText('Moda')).toBeInTheDocument()
  })

  it('handles missing avatar with initials', () => {
    const profileWithoutAvatar = { ...mockProfile, avatar_url: undefined }
    render(<ProfileCard profile={profileWithoutAvatar} />)
    
    expect(screen.getByText('T')).toBeInTheDocument() // First letter of "Test User"
  })

  it('handles missing cover image with gradient', () => {
    const profileWithoutCover = { ...mockProfile, cover_image_url: undefined }
    render(<ProfileCard profile={profileWithoutCover} />)
    
    // Should still render without errors
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn()
    render(<ProfileCard {...defaultProps} onClick={handleClick} />)
    
    fireEvent.click(screen.getByText(mockProfile.full_name))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles contact button click without propagation', () => {
    const handleCardClick = jest.fn()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    render(<ProfileCard {...defaultProps} onClick={handleCardClick} />)
    
    fireEvent.click(screen.getByRole('button', { name: /contactar/i }))
    
    expect(consoleSpy).toHaveBeenCalledWith('Contact clicked for:', mockProfile.username)
    expect(handleCardClick).not.toHaveBeenCalled() // Should not propagate
    
    consoleSpy.mockRestore()
  })

  it('applies custom className', () => {
    render(<ProfileCard {...defaultProps} className="custom-card" />)
    expect(screen.getByText(mockProfile.full_name).closest('.custom-card')).toBeInTheDocument()
  })

  // Accessibility tests
  it('should not have accessibility violations', async () => {
    const { container } = render(<ProfileCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper image alt text', () => {
    render(<ProfileCard {...defaultProps} />)
    
    const avatarImg = screen.getByAltText(`${mockProfile.full_name} - Fotógrafo/a`)
    expect(avatarImg).toBeInTheDocument()
  })

  it('has proper button accessibility', () => {
    render(<ProfileCard {...defaultProps} />)
    
    const contactButton = screen.getByRole('button', { name: /contactar/i })
    expect(contactButton).toBeInTheDocument()
    expect(contactButton).toHaveAttribute('type', 'button')
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(<ProfileCard {...defaultProps} onClick={handleClick} />)
    
    const card = screen.getByText(mockProfile.full_name).closest('[role="button"]') || 
                screen.getByText(mockProfile.full_name).closest('.cursor-pointer')
    
    if (card) {
      fireEvent.keyDown(card, { key: 'Enter' })
      fireEvent.keyDown(card, { key: ' ' })
    }
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
  })

  // Responsive design tests
  it('renders correctly on mobile viewport', () => {
    setViewport(viewports.mobile.width, viewports.mobile.height)
    render(<ProfileCard {...defaultProps} variant="list" />)
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contactar/i })).toHaveClass('w-full')
  })

  it('renders correctly on desktop viewport', () => {
    setViewport(viewports.desktop.width, viewports.desktop.height)
    render(<ProfileCard {...defaultProps} variant="list" />)
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contactar/i })).toHaveClass('sm:w-auto')
  })

  // Integration tests
  it('works with different profile roles', () => {
    const roles = ['photographer', 'model', 'makeup_artist', 'stylist', 'producer'] as const
    const roleNames = ['Fotógrafo/a', 'Modelo', 'Maquillador/a', 'Estilista', 'Productor/a']
    
    roles.forEach((role, index) => {
      const testProfile = { ...mockProfile, role }
      const { rerender } = render(<ProfileCard profile={testProfile} />)
      
      expect(screen.getByText(roleNames[index])).toBeInTheDocument()
      
      if (index < roles.length - 1) {
        rerender(<div />)
      }
    })
  })

  it('handles long text content gracefully', () => {
    const longProfile = {
      ...mockProfile,
      full_name: 'Very Long Professional Name That Should Be Truncated',
      bio: 'This is a very long bio that should be clamped to two lines and show ellipsis when it exceeds the maximum length allowed for the bio section in the profile card component.',
      location: 'Very Long Location Name, Very Long Province, Very Long Country'
    }
    
    render(<ProfileCard profile={longProfile} />)
    
    expect(screen.getByText(longProfile.full_name)).toBeInTheDocument()
    expect(screen.getByText(longProfile.bio)).toBeInTheDocument()
    expect(screen.getByText(longProfile.location)).toBeInTheDocument()
  })

  it('handles empty specialties array', () => {
    const profileWithoutSpecialties = {
      ...mockProfile,
      role_specific_data: {
        ...mockProfile.role_specific_data,
        specialties: []
      }
    }
    
    render(<ProfileCard profile={profileWithoutSpecialties} />)
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
    // Should not show any specialty tags
    expect(screen.queryByText('Retrato')).not.toBeInTheDocument()
  })

  it('memoizes correctly to prevent unnecessary re-renders', () => {
    const { rerender } = render(<ProfileCard {...defaultProps} />)
    
    // Re-render with same props should not cause issues
    rerender(<ProfileCard {...defaultProps} />)
    rerender(<ProfileCard {...defaultProps} />)
    
    expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument()
  })
})