'use client'

import React from 'react'
import { ProfileCard } from '@/components/features'
import { mockFeaturedProfiles } from '@/lib/mockData'
import { Profile } from '@/types'

export default function ProfileCardTestPage() {
  const handleProfileClick = (profile: Profile) => {
    console.log('Profile clicked:', profile.username)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ProfileCard Component Test
          </h1>
          <p className="text-gray-600">
            Testing ProfileCard component with different variants and mock data
          </p>
        </div>

        {/* Grid Variant */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Grid Variant (Default)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFeaturedProfiles.slice(0, 6).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="grid"
                onClick={() => handleProfileClick(profile)}
              />
            ))}
          </div>
        </section>

        {/* List Variant */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            List Variant
          </h2>
          <div className="space-y-4">
            {mockFeaturedProfiles.slice(0, 4).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="list"
                onClick={() => handleProfileClick(profile)}
              />
            ))}
          </div>
        </section>

        {/* Without Contact Button */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Without Contact Button
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFeaturedProfiles.slice(0, 3).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="grid"
                showContact={false}
                onClick={() => handleProfileClick(profile)}
              />
            ))}
          </div>
        </section>

        {/* Mobile Responsive Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Mobile Responsive (Single Column)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {mockFeaturedProfiles.slice(0, 2).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="list"
                onClick={() => handleProfileClick(profile)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}