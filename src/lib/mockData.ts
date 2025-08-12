import { Profile, UserRole, ExperienceLevel, ModelType, PhotographySpecialty, MakeupSpecialty, StudioAccess, HairColor, EyeColor, StylistSpecialty, ProducerSpecialty, BudgetRange } from '@/types'

// Mock data for featured profiles
export const mockFeaturedProfiles: Profile[] = [
  {
    id: '1',
    username: 'sofia_martinez',
    full_name: 'Sofía Martínez',
    role: 'photographer' as UserRole,
    bio: 'Fotógrafa especializada en moda y retratos. Más de 5 años de experiencia trabajando con marcas reconocidas.',
    location: 'Buenos Aires, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/6366f1/ffffff&text=SM',
    cover_image_url: 'https://dummyimage.com/1200x300/e0e7ff/6366f1&text=Fotógrafa',
    subscription_tier: 'pro',
    role_specific_data: {
      specialties: [PhotographySpecialty.FASHION, PhotographySpecialty.PORTRAIT],
      experience_level: ExperienceLevel.ADVANCED,
      studio_access: StudioAccess.OWN_STUDIO,
      equipment_highlights: 'Canon R5, Sony A7R IV, iluminación profesional Profoto',
      post_production_skills: ['Adobe Lightroom', 'Adobe Photoshop', 'Capture One'],
      years_experience: 5,
    },
    portfolio_images: [
      {
        id: '1-1',
        profile_id: '1',
        image_url: 'https://dummyimage.com/600x800/6366f1/ffffff&text=Moda',
        alt_text: 'Sesión de moda urbana',
        sort_order: 1,
        created_at: new Date(),
      },
      {
        id: '1-2',
        profile_id: '1',
        image_url: 'https://dummyimage.com/600x800/6366f1/ffffff&text=Retrato',
        alt_text: 'Retrato artístico',
        sort_order: 2,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    username: 'valentina_model',
    full_name: 'Valentina López',
    role: 'model' as UserRole,
    bio: 'Modelo profesional con experiencia en moda, comercial y editorial. Disponible para sesiones en CABA y GBA.',
    location: 'Buenos Aires, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/ec4899/ffffff&text=VL',
    cover_image_url: 'https://dummyimage.com/1200x300/fce7f3/ec4899&text=Modelo',
    subscription_tier: 'free',
    role_specific_data: {
      model_type: [ModelType.FASHION, ModelType.COMMERCIAL],
      experience_level: ExperienceLevel.INTERMEDIATE,
      height_cm: 175,
      measurements: {
        bust_cm: 86,
        waist_cm: 61,
        hips_cm: 89,
      },
      shoe_size_eu: 38,
      dress_size_eu: 36,
      hair_color: HairColor.BROWN,
      eye_color: EyeColor.BROWN,
      special_attributes: {
        tattoos: false,
        piercings: true,
      },
      languages: ['Español', 'Inglés'],
    },
    portfolio_images: [
      {
        id: '2-1',
        profile_id: '2',
        image_url: 'https://dummyimage.com/600x800/ec4899/ffffff&text=Fashion',
        alt_text: 'Sesión de moda',
        sort_order: 1,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    username: 'lucia_makeup',
    full_name: 'Lucía Fernández',
    role: 'makeup_artist' as UserRole,
    bio: 'Maquilladora profesional especializada en moda y belleza. Trabajo con productos de alta gama y técnicas innovadoras.',
    location: 'Córdoba, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/a855f7/ffffff&text=LF',
    cover_image_url: 'https://dummyimage.com/1200x300/f3e8ff/a855f7&text=Maquilladora',
    subscription_tier: 'pro',
    role_specific_data: {
      specialties: [MakeupSpecialty.FASHION, MakeupSpecialty.BEAUTY],
      experience_level: ExperienceLevel.EXPERT,
      kit_highlights: ['MAC', 'NARS', 'Charlotte Tilbury', 'Fenty Beauty'],
      services_offered: ['Maquillaje de día', 'Maquillaje de noche', 'Maquillaje editorial', 'Asesoramiento'],
      travel_availability: true,
      years_experience: 8,
    },
    portfolio_images: [
      {
        id: '3-1',
        profile_id: '3',
        image_url: 'https://dummyimage.com/600x800/a855f7/ffffff&text=Makeup',
        alt_text: 'Maquillaje editorial',
        sort_order: 1,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    username: 'diego_stylist',
    full_name: 'Diego Ramírez',
    role: 'stylist' as UserRole,
    bio: 'Estilista con más de 6 años de experiencia en moda masculina y femenina. Especializado en looks comerciales y editoriales.',
    location: 'Rosario, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/10b981/ffffff&text=DR',
    cover_image_url: 'https://dummyimage.com/1200x300/ecfdf5/10b981&text=Estilista',
    subscription_tier: 'free',
    role_specific_data: {
      specialties: [StylistSpecialty.FASHION, StylistSpecialty.COMMERCIAL],
      experience_level: ExperienceLevel.ADVANCED,
      industry_focus: ['Moda', 'Publicidad', 'Editorial'],
      wardrobe_access: 'Showroom propio + marcas asociadas',
      years_experience: 6,
    },
    portfolio_images: [
      {
        id: '4-1',
        profile_id: '4',
        image_url: 'https://dummyimage.com/600x800/10b981/ffffff&text=Style',
        alt_text: 'Styling comercial',
        sort_order: 1,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '5',
    username: 'martin_producer',
    full_name: 'Martín González',
    role: 'producer' as UserRole,
    bio: 'Productor audiovisual especializado en campañas publicitarias y contenido de moda. Gestión integral de proyectos.',
    location: 'Buenos Aires, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/f97316/ffffff&text=MG',
    cover_image_url: 'https://dummyimage.com/1200x300/fff7ed/f97316&text=Productor',
    subscription_tier: 'pro',
    role_specific_data: {
      specialties: [ProducerSpecialty.ADVERTISING, ProducerSpecialty.FASHION],
      services: ['Producción integral', 'Casting', 'Locaciones', 'Coordinación de equipos'],
      typical_budget_range: BudgetRange.FROM_100K_TO_500K,
      years_experience: 10,
    },
    portfolio_images: [
      {
        id: '5-1',
        profile_id: '5',
        image_url: 'https://dummyimage.com/600x800/f97316/ffffff&text=Producer',
        alt_text: 'Producción publicitaria',
        sort_order: 1,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '6',
    username: 'ana_photographer',
    full_name: 'Ana Rodríguez',
    role: 'photographer' as UserRole,
    bio: 'Fotógrafa especializada en retratos y lifestyle. Me apasiona capturar la esencia natural de las personas.',
    location: 'Mendoza, Argentina',
    avatar_url: 'https://dummyimage.com/400x400/0ea5e9/ffffff&text=AR',
    cover_image_url: 'https://dummyimage.com/1200x300/f0f9ff/0ea5e9&text=Fotógrafa',
    subscription_tier: 'free',
    role_specific_data: {
      specialties: [PhotographySpecialty.PORTRAIT, PhotographySpecialty.LIFESTYLE],
      experience_level: ExperienceLevel.INTERMEDIATE,
      studio_access: StudioAccess.RENTAL_ACCESS,
      equipment_highlights: 'Nikon D850, lentes fijos, luz natural',
      post_production_skills: ['Lightroom', 'Photoshop'],
      years_experience: 3,
    },
    portfolio_images: [
      {
        id: '6-1',
        profile_id: '6',
        image_url: 'https://dummyimage.com/600x800/0ea5e9/ffffff&text=Portrait',
        alt_text: 'Retrato natural',
        sort_order: 1,
        created_at: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  },
]

// Platform statistics
export const platformStats = {
  totalProfiles: 1247,
  photographers: 423,
  models: 356,
  makeupArtists: 198,
  stylists: 156,
  producers: 114,
  projectsCompleted: 2834,
  citiesCovered: 15,
}

// Role information for the benefits section
export const roleInfo = [
  {
    role: 'photographer',
    title: 'Fotógrafos',
    description: 'Muestra tu portfolio y conecta con modelos, estilistas y otros creativos para tus próximos proyectos.',
    icon: '📸',
    benefits: [
      'Portfolio profesional optimizado',
      'Conexión directa con modelos y creativos',
      'Gestión de proyectos integrada',
      'Visibilidad en búsquedas especializadas'
    ]
  },
  {
    role: 'model',
    title: 'Modelos',
    description: 'Construye tu perfil profesional y sé descubierto por fotógrafos, agencias y marcas.',
    icon: '👤',
    benefits: [
      'Perfil completo con medidas y características',
      'Portfolio visual impactante',
      'Contacto directo con fotógrafos',
      'Oportunidades de trabajo constantes'
    ]
  },
  {
    role: 'makeup_artist',
    title: 'Maquilladores',
    description: 'Destaca tu talento y técnicas únicas para ser elegido en producciones de moda y belleza.',
    icon: '💄',
    benefits: [
      'Showcase de trabajos y técnicas',
      'Red de contactos profesionales',
      'Disponibilidad y servicios claros',
      'Reconocimiento en la industria'
    ]
  },
  {
    role: 'stylist',
    title: 'Estilistas',
    description: 'Presenta tu visión creativa y conecta con equipos de producción que necesiten tu expertise.',
    icon: '👗',
    benefits: [
      'Portfolio de looks y estilos',
      'Conexión con marcas y diseñadores',
      'Proyectos colaborativos',
      'Crecimiento profesional'
    ]
  },
  {
    role: 'producer',
    title: 'Productores',
    description: 'Gestiona equipos creativos y coordina proyectos con los mejores talentos de la industria.',
    icon: '🎬',
    benefits: [
      'Acceso a talento verificado',
      'Gestión integral de proyectos',
      'Red de proveedores confiables',
      'Optimización de presupuestos'
    ]
  }
]