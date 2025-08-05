/**
 * CORS middleware configuration
 * All Access Artist - Backend API v2.0.0
 */
import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://all-access-artist.vercel.app',
    'https://artist-rocket-launch.vercel.app'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
})
