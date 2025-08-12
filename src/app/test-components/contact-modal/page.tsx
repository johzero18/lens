'use client'

import React, { useState } from 'react'
import ContactModal from '@/components/features/ContactModal'
import Button from '@/components/ui/Button'

export default function ContactModalTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">
          Test ContactModal Component
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            ContactModal Test
          </h2>
          <p className="text-secondary-600 mb-6">
            Click the button below to test the contact modal functionality.
          </p>
          
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Open Contact Modal
          </Button>
        </div>

        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipientId="test-recipient-id"
          recipientName="María García"
          recipientRole="Fotógrafa"
        />
      </div>
    </div>
  )
}