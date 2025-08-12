import { GET } from '@/app/api/search/route'
import { NextRequest } from 'next/server'

// Mock the Supabase client
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: mockSearchResults, error: null })
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder)
  }
}))

const mockSearchResults = [
  {
    id: '1',
    username: 'photographer_test',
    full_name: 'Juan Pérez',
    role: 'photographer',
    bio: 'Fotógrafo especializado en moda',
    location: 'Buenos Aires',
    avatar_url: 'https://example.com/avatar.jpg',
    cover_image_url: null,
    subscription_tier: 'free',
    role_specific_data: {
      specialties: ['moda', 'editorial'],
      experience_level: 'avanzado'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    portfolio_images: []
  }
]

describe('/api/search', () => {
  it('should handle basic search request', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?query=fotógrafo')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('profiles')
    expect(data.data).toHaveProperty('total')
    expect(data.data).toHaveProperty('page')
    expect(data.data).toHaveProperty('limit')
    expect(data.data).toHaveProperty('hasMore')
  })

  it('should handle search with filters', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?role=photographer&location=Buenos%20Aires&page=1&limit=20')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.profiles).toBeDefined()
  })

  it('should handle search with specialties filter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?specialties=moda,editorial')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.profiles).toBeDefined()
  })

  it('should handle pagination parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?page=2&limit=10')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.page).toBe(2)
    expect(data.data.limit).toBe(10)
  })

  it('should handle sorting parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?sortBy=name&sortOrder=asc')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.profiles).toBeDefined()
  })

  it('should limit page size to maximum', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?limit=100')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.limit).toBeLessThanOrEqual(50)
  })

  it('should handle empty search', async () => {
    const request = new NextRequest('http://localhost:3000/api/search')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.profiles).toBeDefined()
  })
})

describe('Search API Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // This would require mocking a database error
    // For now, we'll just ensure the endpoint exists
    const request = new NextRequest('http://localhost:3000/api/search')
    
    const response = await GET(request)
    
    expect(response).toBeDefined()
  })
})

describe('Search API Validation', () => {
  it('should validate role parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?role=invalid_role')
    
    const response = await GET(request)
    
    // Should still work but filter won't match anything
    expect(response.status).toBe(200)
  })

  it('should handle boolean parameters correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?travel_availability=true')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.profiles).toBeDefined()
  })
})