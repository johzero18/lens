import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import MessagesPageClient from '@/app/mensajes/MessagesPageClient'

export default function MessagesTestPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Test Messages Page
            </h1>
            <p className="text-secondary-600">
              This is a test page for the messages functionality.
            </p>
          </div>
        </div>
      </div>
      <MessagesPageClient />
    </MainLayout>
  )
}