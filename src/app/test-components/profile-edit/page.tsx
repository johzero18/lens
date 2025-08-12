'use client'

import { useState } from 'react'
import ProfileEditForm from '@/components/features/ProfileEditForm'
import { Profile } from '@/types'
import { mockFeaturedProfiles } from '@/lib/mockData'

export default function ProfileEditTestPage() {
  const [loading, setLoading] = useState(false)

  // Using first profile as example
  const testProfile = mockFeaturedProfiles[0]

  if (!testProfile) {
    return <div>No test profile available</div>
  }

  const handleSubmit = async (data: Partial<Profile>) => {
    setLoading(true)
    
    try {
      console.log('Profile update data:', data)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Perfil actualizado exitosamente!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    alert('Edición cancelada')
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">
          Test: Profile Edit Form
        </h1>
        <p className="text-secondary-600">
          Esta página es para probar el formulario de edición de perfil con datos mock.
        </p>
      </div>
      
      <ProfileEditForm
        profile={testProfile}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}