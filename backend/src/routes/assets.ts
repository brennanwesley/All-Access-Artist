/**
 * Assets Routes - HTTP handlers for Brand Kit asset management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages artist assets (logos, headshots, artwork) with Supabase Storage
 * Features: File upload, signed URLs, asset organization, primary asset management
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AssetService } from '../services/assetService.js'
import { 
  CreateArtistAssetSchema, 
  UpdateArtistAssetSchema,
  FileUploadSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const assets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/assets - Get all assets with optional filtering
assets.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const assetType = c.req.query('type')
    const folder = c.req.query('folder')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getAllAssets(userId, assetType, folder, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch assets' 
    }, 500)
  }
})

// GET /api/assets/:id - Get asset by ID
assets.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getAssetById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch asset' 
    }, 500)
  }
})

// POST /api/assets - Create new asset
assets.post('/', zValidator('json', CreateArtistAssetSchema), async (c) => {
  try {
    const assetData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.createAsset(userId, assetData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create asset' 
    }, 500)
  }
})

// PUT /api/assets/:id - Update asset
assets.put('/:id', zValidator('json', UpdateArtistAssetSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const assetData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.updateAsset(id, userId, assetData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update asset' 
    }, 500)
  }
})

// DELETE /api/assets/:id - Delete asset
assets.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.deleteAsset(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete asset' 
    }, 500)
  }
})

// GET /api/assets/primary/:type? - Get primary assets (for AI generation)
assets.get('/primary/:type?', async (c) => {
  try {
    const assetType = c.req.param('type')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getPrimaryAssets(userId, assetType)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch primary assets' 
    }, 500)
  }
})

// POST /api/assets/upload-url - Generate signed URL for file upload
assets.post('/upload-url', zValidator('json', FileUploadSchema), async (c) => {
  try {
    const uploadData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.generateUploadUrl(userId, uploadData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate upload URL' 
    }, 500)
  }
})

// POST /api/assets/:id/download-url - Generate signed URL for file download
assets.post('/:id/download-url', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Get asset to extract file path
    const assetService = new AssetService(supabase)
    const asset = await assetService.getAssetById(id, userId)
    
    // Extract file path from URL
    const url = new URL(asset.file_url)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'assets')
    
    if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
      throw new Error('Invalid file URL format')
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    const expiresIn = parseInt(c.req.query('expires_in') || '3600')
    
    const downloadUrl = await assetService.generateDownloadUrl(filePath, expiresIn)
    
    return c.json({ 
      success: true, 
      data: { 
        download_url: downloadUrl,
        expires_in: expiresIn 
      } 
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate download URL' 
    }, 500)
  }
})

// GET /api/assets/stats - Get asset statistics
assets.get('/stats', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getAssetStats(userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch asset statistics' 
    }, 500)
  }
})

export default assets
