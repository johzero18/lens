'use client'

import React from 'react'
import Link from 'next/link'
import { mockFeaturedProfiles } from '@/lib/mockData'

export default function ProfilePageTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-8">
            Test de Páginas de Perfil
          </h1>
          
          <p className="text-secondary-600 mb-8">
            Haz clic en cualquier perfil para ver la página de perfil público completa:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFeaturedProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/${profile.username}`}
                className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {profile.full_name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      @{profile.username}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Funcionalidades implementadas:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Header de perfil con imagen de portada y avatar</li>
              <li>✅ Información básica y específica por rol</li>
              <li>✅ Sección de portfolio con grid de imágenes</li>
              <li>✅ Botón de contacto y modal de contacto</li>
              <li>✅ Diseño responsive para móvil y desktop</li>
              <li>✅ Visualización de imágenes en modal</li>
              <li>✅ Datos mock para testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}