import type { Context } from "https://edge.netlify.com"

export default async (request: Request, context: Context) => {
  const startTime = Date.now()
  
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      edge_location: context.geo?.city || 'unknown',
      response_time: Date.now() - startTime,
      version: '1.0.0',
    }

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time: Date.now() - startTime,
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}

export const config = {
  path: "/api/health-edge"
}