-- Sample data for development and testing
-- This file should only be run in development environments

-- Insert sample role-specific data structures for reference
-- These are examples of what role_specific_data JSONB should contain

-- Sample photographer data structure
INSERT INTO profiles (
  id, username, full_name, role, bio, location, role_specific_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sample_photographer',
  'Fotógrafo de Ejemplo',
  'photographer',
  'Fotógrafo profesional especializado en retratos y moda con más de 5 años de experiencia.',
  'Buenos Aires, Argentina',
  '{
    "specialties": ["retratos", "moda", "eventos"],
    "experience_level": "profesional",
    "studio_access": "propio",
    "equipment_highlights": "Canon EOS R5, lentes profesionales, iluminación de estudio",
    "post_production_skills": ["lightroom", "photoshop", "capture_one"]
  }'
) ON CONFLICT (id) DO NOTHING;

-- Sample model data structure
INSERT INTO profiles (
  id, username, full_name, role, bio, location, role_specific_data
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'sample_model',
  'Modelo de Ejemplo',
  'model',
  'Modelo profesional con experiencia en moda, publicidad y pasarela.',
  'Córdoba, Argentina',
  '{
    "model_type": ["moda", "comercial", "pasarela"],
    "experience_level": "profesional",
    "height_cm": 175,
    "measurements": {
      "bust_cm": 86,
      "waist_cm": 61,
      "hips_cm": 89
    },
    "shoe_size_eu": 38,
    "dress_size_eu": 36,
    "hair_color": "castaño",
    "eye_color": "marrones",
    "special_attributes": {
      "tattoos": false,
      "piercings": true
    }
  }'
) ON CONFLICT (id) DO NOTHING;

-- Sample makeup artist data structure
INSERT INTO profiles (
  id, username, full_name, role, bio, location, role_specific_data
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'sample_makeup_artist',
  'Maquilladora de Ejemplo',
  'makeup_artist',
  'Maquilladora profesional especializada en moda, belleza y efectos especiales.',
  'Rosario, Argentina',
  '{
    "specialties": ["moda", "belleza", "editorial", "efectos_especiales"],
    "experience_level": "profesional",
    "kit_highlights": ["MAC", "Urban Decay", "Fenty Beauty", "aerógrafo"],
    "services_offered": ["maquillaje_dia", "maquillaje_noche", "maquillaje_novias", "body_painting"],
    "travel_availability": true
  }'
) ON CONFLICT (id) DO NOTHING;

-- Sample stylist data structure
INSERT INTO profiles (
  id, username, full_name, role, bio, location, role_specific_data
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'sample_stylist',
  'Estilista de Ejemplo',
  'stylist',
  'Estilista de moda con experiencia en producciones editoriales y comerciales.',
  'Mendoza, Argentina',
  '{
    "specialties": ["moda", "editorial", "comercial", "styling_personal"],
    "experience_level": "profesional",
    "industry_focus": ["moda", "publicidad", "television"],
    "wardrobe_access": "showroom_propio",
    "portfolio_url": "https://example.com/portfolio"
  }'
) ON CONFLICT (id) DO NOTHING;

-- Sample producer data structure
INSERT INTO profiles (
  id, username, full_name, role, bio, location, role_specific_data
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'sample_producer',
  'Productor de Ejemplo',
  'producer',
  'Productor audiovisual especializado en contenido publicitario y fashion films.',
  'La Plata, Argentina',
  '{
    "specialties": ["publicidad", "fashion_films", "contenido_digital"],
    "services": ["produccion_ejecutiva", "casting", "locaciones", "post_produccion"],
    "typical_budget_range": "50000-200000",
    "portfolio_url": "https://example.com/producer-portfolio"
  }'
) ON CONFLICT (id) DO NOTHING;

-- Sample portfolio images
INSERT INTO portfolio_images (profile_id, image_url, alt_text, sort_order) VALUES
('00000000-0000-0000-0000-000000000001', 'https://example.com/photo1.jpg', 'Retrato profesional en estudio', 1),
('00000000-0000-0000-0000-000000000001', 'https://example.com/photo2.jpg', 'Sesión de moda urbana', 2),
('00000000-0000-0000-0000-000000000002', 'https://example.com/model1.jpg', 'Foto de portfolio - look comercial', 1),
('00000000-0000-0000-0000-000000000002', 'https://example.com/model2.jpg', 'Sesión editorial de moda', 2)
ON CONFLICT DO NOTHING;

-- Sample contact messages
INSERT INTO contacts (sender_id, receiver_id, subject, message) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Propuesta de colaboración',
  'Hola! Me encanta tu portfolio. Me gustaría proponerte una colaboración para una sesión de retratos. ¿Te interesaría? Podemos coordinar los detalles.'
),
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Consulta sobre sesión',
  'Hola! Vi tu trabajo y me parece excelente. Tengo una sesión programada para la próxima semana y necesito un fotógrafo. ¿Estarías disponible?'
)
ON CONFLICT DO NOTHING;