'use client'

import { useState } from 'react'
import PortfolioManager from '@/components/features/PortfolioManager'
import { PortfolioImage } from '@/types'
import { mockFeaturedProfiles } from '@/lib/mockData'

export default function PortfolioManagerTestPage() {
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>(
    mockFeaturedProfiles[0]?.portfolio_images || []
  )

  const handleImagesChange = (images: PortfolioImage[]) => {
    setPortfolioImages(images)
    console.log('Portfolio images updated:', images)
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Test: Portfolio Manager
          </h1>
          <p className="text-secondary-600">
            Esta página es para probar el componente de gestión de portfolio.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <PortfolioManager
            images={portfolioImages}
            onImagesChange={handleImagesChange}
            maxImages={20}
            loading={false}
          />
        </div>

        {/* Debug info */}
        <div className="mt-8 bg-secondary-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-secondary-900 mb-2">
            Debug Info:
          </h3>
          <pre className="text-xs text-secondary-700 overflow-auto">
            {JSON.stringify(portfolioImages, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}