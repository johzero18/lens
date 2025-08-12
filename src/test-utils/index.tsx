import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock data for testing
export const mockProfile = {
  id: '1',
  username: 'testuser',
  full_name: 'Test User',
  role: 'photographer' as const,
  bio: 'Test bio for photographer',
  location: 'Buenos Aires, Argentina',
  avatar_url: '/test-avatar.jpg',
  cover_image_url: '/test-cover.jpg',
  subscription_tier: 'free' as const,
  role_specific_data: {
    specialties: ['Retrato', 'Moda'],
    experience_level: 'Intermedio',
    studio_access: 'Propio',
    equipment_highlights: 'Canon EOS R5, Lentes profesionales',
    post_production_skills: ['Lightroom', 'Photoshop']
  },
  portfolio_images: [
    {
      id: '1',
      image_url: '/test-portfolio-1.jpg',
      alt_text: 'Test portfolio image 1',
      sort_order: 1
    },
    {
      id: '2',
      image_url: '/test-portfolio-2.jpg',
      alt_text: 'Test portfolio image 2',
      sort_order: 2
    }
  ],
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
}

export const mockModelProfile = {
  ...mockProfile,
  id: '2',
  username: 'testmodel',
  full_name: 'Test Model',
  role: 'model' as const,
  bio: 'Test bio for model',
  role_specific_data: {
    model_type: ['Comercial', 'Moda'],
    experience_level: 'Principiante',
    height_cm: 175,
    measurements: {
      bust_cm: 90,
      waist_cm: 65,
      hips_cm: 95
    },
    shoe_size_eu: 38,
    dress_size_eu: 40,
    hair_color: 'Castaño',
    eye_color: 'Marrones',
    special_attributes: {
      tattoos: false,
      piercings: true
    }
  }
}

export const mockContactMessage = {
  id: '1',
  sender_id: '1',
  receiver_id: '2',
  subject: 'Colaboración fotográfica',
  message: 'Hola, me interesa trabajar contigo en un proyecto de moda.',
  created_at: new Date('2024-01-01')
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Utility functions for testing
export const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  })
  return file
}

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Responsive design testing utilities
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  large: { width: 1440, height: 900 }
}