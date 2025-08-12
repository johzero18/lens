import { NextRequest, NextResponse } from 'next/server'

interface ErrorReport {
  error: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  additionalInfo?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json()
    
    // Validate required fields
    if (!errorReport.error || !errorReport.url || !errorReport.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log error to console (in production, you'd send to a service like Sentry)
    console.error('Client Error Report:', {
      error: errorReport.error,
      stack: errorReport.stack,
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      timestamp: errorReport.timestamp,
      userId: errorReport.userId,
      additionalInfo: errorReport.additionalInfo,
    })

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Here you would integrate with Sentry or another error tracking service
      // Example: Sentry.captureException(new Error(errorReport.error), { extra: errorReport })
    }

    // Store in database for analysis (optional)
    // You could create an error_logs table to store these for analysis
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error report received' 
    })

  } catch (error) {
    console.error('Failed to process error report:', error)
    
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

// Rate limiting for error reports
const errorReports = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxReports = 50 // Max 50 error reports per 15 minutes per IP

  if (!errorReports.has(ip)) {
    errorReports.set(ip, [])
  }

  const reports = errorReports.get(ip)!
  
  // Remove old reports outside the window
  const recentReports = reports.filter(timestamp => now - timestamp < windowMs)
  errorReports.set(ip, recentReports)

  // Check if limit exceeded
  if (recentReports.length >= maxReports) {
    return true
  }

  // Add current report
  recentReports.push(now)
  return false
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}