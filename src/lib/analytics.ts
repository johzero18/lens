// Google Analytics and monitoring utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  // Load gtag script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  script.async = true
  document.head.appendChild(script)

  // Initialize gtag
  window.gtag = function gtag(...args: any[]) {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push(args)
  }

  window.gtag('js', new Date())
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  })
}

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Track user interactions
export const trackUserInteraction = (
  element: string,
  action: string,
  details?: Record<string, any>
) => {
  trackEvent(action, 'User Interaction', element, 1)
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('User Interaction:', { element, action, details })
  }
}

// Track performance metrics
export const trackPerformance = (metric: string, value: number, unit = 'ms') => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', 'timing_complete', {
    name: metric,
    value: Math.round(value),
    event_category: 'Performance',
  })

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance: ${metric} = ${value}${unit}`)
  }
}

// Track Core Web Vitals
export const trackWebVitals = (metric: any) => {
  if (!GA_TRACKING_ID) return

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
  })
}

// Track errors
export const trackError = (error: Error, errorInfo?: any) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', 'exception', {
    description: error.message,
    fatal: false,
    event_category: 'Error',
  })

  // Also log to console
  console.error('Tracked Error:', error, errorInfo)
}

// Track search queries
export const trackSearch = (query: string, filters?: Record<string, any>) => {
  trackEvent('search', 'Search', query)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        trackEvent('filter_used', 'Search Filter', `${key}:${value}`)
      }
    })
  }
}

// Track profile views
export const trackProfileView = (username: string, role: string) => {
  trackEvent('profile_view', 'Profile', `${role}:${username}`)
}

// Track contact form submissions
export const trackContactSubmission = (senderRole: string, receiverRole: string) => {
  trackEvent('contact_form_submit', 'Contact', `${senderRole}_to_${receiverRole}`)
}