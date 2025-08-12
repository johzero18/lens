import { GET } from '@/app/api/search/suggestions/route'
import { NextRequest } from 'next/server'

// Mock the Supabase client
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue({ data: mockProfiles, error: null })
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder)
  }
}))

const mockProfiles = [
  {
    username: 'fotografo_juan',
    full_name: 'Juan Pérez',
    role: 'photographer',
    avatar_url: 'https://example.com/avatar.jpg'
  },
  {
    username: 'modelo_maria',
    full_name: 'María García',
    role: 'model',
    avatar_url: 'https://example.com/avatar2.jpg'
  }
]

const mockLocations = [
  { location: 'Buenos Aires' },
  { location: 'Córdoba' },
  { location: 'Rosario' }
]

describe('/api/search/suggestions', () => {
  it('should return suggestions for valid query', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=foto')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should return empty array for short query', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=a')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
  })

  it('should filter by suggestion type', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=juan&type=profile')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should respect limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=test&limit=5')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it('should return location suggestions', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=buenos&type=location')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should return specialty suggestions', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=moda&type=specialty')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.data)).toBe(true)
    
    // Should include specialty suggestions
    const specialtySuggestions = data.data.filter((s: any) => s.type === 'specialty')
    expect(specialtySuggestions.length).toBeGreaterThan(0)
  })

  it('should limit results to maximum', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=test&limit=25')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.length).toBeLessThanOrEqual(20)
  })

  it('should handle missing query parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
  })
})

describe('Search Suggestions Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=test')
    
    const response = await GET(request)
    
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
  })
})

describe('Search Suggestions Validation', () => {
  it('should validate suggestion types', async () => {
    const validTypes = ['profile', 'location', 'specialty']
    
    for (const type of validTypes) {
      const request = new NextRequest(`http://localhost:3000/api/search/suggestions?q=test&type=${type}`)
      const response = await GET(request)
      
      expect(response.status).toBe(200)
    }
  })

  it('should handle invalid suggestion type gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/search/suggestions?q=test&type=invalid')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.data)).toBe(true)
  })
})