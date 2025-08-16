/**
 * CORS Middleware - Dynamic Origin Validation for Vercel Deployments
 * All Access Artist - Backend API v2.0.0
 */
import { cors } from 'hono/cors'

// Dynamic CORS origin validation
const isAllowedOrigin = (origin: string): boolean => {
  // Allow localhost for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true
  }
  
  // Allow production Vercel domain
  if (origin === 'https://all-access-artist.vercel.app') {
    return true
  }
  
  // Allow all Vercel preview deployments for brennan-wesley
  const vercelPreviewPattern = /^https:\/\/all-access-artist-[a-z0-9]+-brennan-wesley\.vercel\.app$/
  if (vercelPreviewPattern.test(origin)) {
    return true
  }
  
  return false
}

export const corsMiddleware = cors({
  origin: (origin: string | undefined) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return undefined
    
    return isAllowedOrigin(origin) ? origin : undefined
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400, // 24 hours
  credentials: true,
})
