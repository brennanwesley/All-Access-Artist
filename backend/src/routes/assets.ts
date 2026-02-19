/**
 * Assets Routes - HTTP handlers for Brand Kit asset management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages artist assets (logos, headshots, artwork) with Supabase Storage
 * Features: File upload, signed URLs, asset organization, primary asset management
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { AssetService } from '../services/assetService.js'
import { 
  IdParamSchema,
  CreateArtistAssetSchema, 
  UpdateArtistAssetSchema,
  FileUploadSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const assets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const AssetListQuerySchema = z.object({
  type: z.string().optional(),
  folder: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

const DownloadUrlQuerySchema = z.object({
  expires_in: z.coerce.number().int().min(60).max(86400).optional(),
})

const PrimaryAssetTypeParamSchema = z.object({
  type: z.string().optional(),
})

// GET /api/assets - Get all assets with optional filtering
assets.get('/', validateRequest('query', AssetListQuerySchema), async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const {
      type: assetType,
      folder,
      limit = 50,
      offset = 0,
    } = c.req.valid('query')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getAllAssets(userId, assetType, folder, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch assets',
      'ASSET_LIST_FAILED'
    )
  }
})

// GET /api/assets/:id - Get asset by ID
assets.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getAssetById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch asset',
      'ASSET_FETCH_FAILED'
    )
  }
})

// POST /api/assets - Create new asset
assets.post('/', validateRequest('json', CreateArtistAssetSchema), async (c) => {
  try {
    const assetData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.createAsset(userId, assetData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create asset',
      'ASSET_CREATE_FAILED'
    )
  }
})

// PUT /api/assets/:id - Update asset
assets.put(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', UpdateArtistAssetSchema),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const assetData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.updateAsset(id, userId, assetData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update asset',
      'ASSET_UPDATE_FAILED'
    )
  }
})

// DELETE /api/assets/:id - Delete asset
assets.delete('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.deleteAsset(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete asset',
      'ASSET_DELETE_FAILED'
    )
  }
})

// GET /api/assets/primary/:type? - Get primary assets (for AI generation)
assets.get('/primary/:type?', validateRequest('param', PrimaryAssetTypeParamSchema), async (c) => {
  try {
    const { type: assetType } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.getPrimaryAssets(userId, assetType)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch primary assets',
      'ASSET_PRIMARY_FETCH_FAILED'
    )
  }
})

// POST /api/assets/upload-url - Generate signed URL for file upload
assets.post('/upload-url', validateRequest('json', FileUploadSchema), async (c) => {
  try {
    const uploadData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const assetService = new AssetService(supabase)
    const data = await assetService.generateUploadUrl(userId, uploadData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to generate upload URL',
      'ASSET_UPLOAD_URL_FAILED'
    )
  }
})

// POST /api/assets/:id/download-url - Generate signed URL for file download
assets.post(
  '/:id/download-url',
  validateRequest('param', IdParamSchema),
  validateRequest('query', DownloadUrlQuerySchema),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const { expires_in: expiresIn = 3600 } = c.req.valid('query')
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
    
    const downloadUrl = await assetService.generateDownloadUrl(filePath, expiresIn)
    
    return c.json({ 
      success: true, 
      data: { 
        download_url: downloadUrl,
        expires_in: expiresIn 
      } 
    })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to generate download URL',
      'ASSET_DOWNLOAD_URL_FAILED'
    )
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch asset statistics',
      'ASSET_STATS_FAILED'
    )
  }
})

export default assets
