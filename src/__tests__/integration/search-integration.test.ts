import { ProfileApi } from '@/lib/api/profileApi'
import { SearchFilters, UserRole } from '@/types'

// Mock fetch for API calls
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Search Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ProfileApi.searchProfiles', () => {
    it('should make correct API call for basic search', async () => {
      const mockResponse = {
        data: {
          profiles: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const filters: SearchFilters = {
        query: 'fotógrafo',
        role: 'photographer' as UserRole
      }

      const result = await ProfileApi.searchProfiles(
        filters,
        { page: 1, limit: 20 }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?query=fot%C3%B3grafo&role=photographer&page=1&limit=20'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )

      expect(result.data).toEqual(mockResponse.data)
    })

    it('should handle search with multiple filters', async () => {
      const mockResponse = {
        data: {
          profiles: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const filters: SearchFilters = {
        role: 'photographer' as UserRole,
        location: 'Buenos Aires',
        specialties: ['moda', 'editorial'],
        travel_availability: true
      }

      await ProfileApi.searchProfiles(filters, { page: 1, limit: 20 })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('role=photographer'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('location=Buenos%20Aires'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('specialties=moda%2Ceditorial'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('travel_availability=true'),
        expect.any(Object)
      )
    })

    it('should handle pagination and sorting', async () => {
      const mockResponse = {
        data: {
          profiles: [],
          total: 100,
          page: 2,
          limit: 10,
          hasMore: true
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.searchProfiles(
        {},
        { page: 2, limit: 10 },
        { sortBy: 'name', sortOrder: 'asc' }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=10&sortBy=name&sortOrder=asc'),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          code: 'SEARCH_ERROR',
          message: 'Error al buscar perfiles'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      } as Response)

      const result = await ProfileApi.searchProfiles(
        { query: 'test' },
        { page: 1, limit: 20 }
      )

      expect(result.error).toEqual(mockError.error)
    })
  })

  describe('ProfileApi.getSearchSuggestions', () => {
    it('should make correct API call for suggestions', async () => {
      const mockResponse = {
        data: [
          {
            type: 'profile',
            value: 'fotografo_juan',
            label: '@fotografo_juan (Juan Pérez)'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await ProfileApi.getSearchSuggestions('foto', 'profile', 5)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search/suggestions?q=foto&type=profile&limit=5'),
        expect.any(Object)
      )

      expect(result.data).toEqual(mockResponse.data)
    })

    it('should handle suggestions without type filter', async () => {
      const mockResponse = { data: [] }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.getSearchSuggestions('test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search/suggestions?q=test&limit=10'),
        expect.any(Object)
      )
    })
  })

  describe('ProfileApi.getFeaturedProfiles', () => {
    it('should make correct API call for featured profiles', async () => {
      const mockResponse = {
        data: {
          profiles: [],
          total: 0,
          page: 1,
          limit: 12,
          hasMore: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.getFeaturedProfiles(12)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?sortBy=score&limit=12'),
        expect.any(Object)
      )
    })
  })

  describe('ProfileApi.getProfilesByRole', () => {
    it('should make correct API call for profiles by role', async () => {
      const mockResponse = {
        data: {
          profiles: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.getProfilesByRole('photographer', 20)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?role=photographer&limit=20&sortBy=recent'),
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await ProfileApi.searchProfiles(
        { query: 'test' },
        { page: 1, limit: 20 }
      )

      expect(result.error).toEqual({
        code: 'NETWORK_ERROR',
        message: 'Error de conexión'
      })
    })

    it('should handle malformed responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      } as Response)

      const result = await ProfileApi.searchProfiles(
        { query: 'test' },
        { page: 1, limit: 20 }
      )

      expect(result.error).toBeDefined()
    })
  })

  describe('URL Encoding', () => {
    it('should properly encode special characters in search queries', async () => {
      const mockResponse = { data: { profiles: [], total: 0, page: 1, limit: 20, hasMore: false } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.searchProfiles(
        { query: 'fotógrafo & modelo' },
        { page: 1, limit: 20 }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=fot%C3%B3grafo%20%26%20modelo'),
        expect.any(Object)
      )
    })

    it('should properly encode location names', async () => {
      const mockResponse = { data: { profiles: [], total: 0, page: 1, limit: 20, hasMore: false } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await ProfileApi.searchProfiles(
        { location: 'Buenos Aires, Argentina' },
        { page: 1, limit: 20 }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('location=Buenos%20Aires%2C%20Argentina'),
        expect.any(Object)
      )
    })
  })
})