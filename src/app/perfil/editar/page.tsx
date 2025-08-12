'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileEditForm from '@/components/features/ProfileEditForm'
import { Profile } from '@/types'
import { mockFeaturedProfiles } from '@/lib/mockData'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Mock: Get current user profile (in real app, this would come from auth context)
  const currentProfile = mockFeaturedProfiles[0] // Using first profile as example

  if (!currentProfile) {
    return <div>Profile not found</div>
  }

  const handleSubmit = async (data: Partial<Profile>) => {
    setLoading(true)
    
    try {
      // Mock API call - in real implementation, this would update the profile in Supabase
      console.log('Updating profile with data:', data)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to profile page after successful update
      router.push(`/${currentProfile.username}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/${currentProfile.username}`)
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <ProfileEditForm
        profile={currentProfile}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}