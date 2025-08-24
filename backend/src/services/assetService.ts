/**
 * Asset Service - Business logic for Brand Kit asset management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages CRUD operations for artist assets (logos, headshots, artwork)
 * Features: File upload to Supabase Storage, signed URLs, asset organization
 * Database: artist_assets table with user-scoped RLS policies
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  CreateArtistAssetData, 
  UpdateArtistAssetData,
  FileUploadData 
} from '../types/schemas.js'

export class AssetService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all assets for a user with optional filtering
   * @param userId - User ID for RLS filtering
   * @param assetType - Optional filter by asset type
   * @param folder - Optional filter by folder
   * @param limit - Optional limit for pagination
   * @param offset - Optional offset for pagination
   */
  async getAllAssets(
    userId: string,
    assetType?: string,
    folder?: string,
    limit: number = 50,
    offset: number = 0
  ) {
    console.log('=== GET ALL ASSETS DEBUG ===')
    console.log('1. Input userId:', userId)
    console.log('2. Asset type filter:', assetType || 'none')
    console.log('3. Folder filter:', folder || 'none')
    console.log('4. Pagination - limit:', limit, 'offset:', offset)
    
    let query = this.supabase
      .from('artist_assets')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters if provided
    if (assetType) {
      query = query.eq('asset_type', assetType)
    }
    if (folder) {
      query = query.eq('folder', folder)
    }

    const { data, error } = await query

    console.log('5. Assets found:', data?.length || 0)
    console.log('=== END GET ALL ASSETS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch assets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get asset by ID with user verification
   * @param assetId - Asset ID to retrieve
   * @param userId - User ID for RLS verification
   */
  async getAssetById(assetId: string, userId: string) {
    console.log('=== GET ASSET BY ID DEBUG ===')
    console.log('Asset ID:', assetId)
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('artist_assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Asset query result:', { data: !!data, error })
    console.log('=== END GET ASSET BY ID DEBUG ===')

    if (error) {
      console.log('Asset query error:', error.message)
      throw new Error(`Failed to fetch asset: ${error.message}`)
    }

    if (!data) {
      throw new Error('Asset not found or access denied')
    }

    return data
  }

  /**
   * Create new asset record
   * @param userId - User ID for ownership
   * @param assetData - Asset creation data
   */
  async createAsset(userId: string, assetData: CreateArtistAssetData) {
    console.log('=== CREATE ASSET DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. Asset type:', assetData.asset_type)
    console.log('3. Asset name:', assetData.asset_name)
    console.log('4. Is primary:', assetData.is_primary)
    
    // If this is set as primary, unset other primary assets of the same type
    if (assetData.is_primary) {
      await this.unsetPrimaryAssets(userId, assetData.asset_type)
    }

    // Prepare data with user_id and defaults
    const insertData = {
      user_id: userId,
      ...assetData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('artist_assets')
      .insert(insertData)
      .select()
      .single()

    console.log('5. Asset creation result:', { success: !!data, error })
    console.log('=== END CREATE ASSET DEBUG ===')

    if (error) {
      console.log('Asset creation error:', error.message)
      throw new Error(`Failed to create asset: ${error.message}`)
    }

    return data
  }

  /**
   * Update existing asset
   * @param assetId - Asset ID to update
   * @param userId - User ID for RLS verification
   * @param updateData - Asset update data
   */
  async updateAsset(
    assetId: string,
    userId: string,
    updateData: UpdateArtistAssetData
  ) {
    console.log('=== UPDATE ASSET DEBUG ===')
    console.log('1. Asset ID:', assetId)
    console.log('2. User ID:', userId)
    console.log('3. Update fields:', Object.keys(updateData))
    
    // If setting as primary, unset other primary assets of the same type
    if (updateData.is_primary && updateData.asset_type) {
      await this.unsetPrimaryAssets(userId, updateData.asset_type)
    }

    // Add updated timestamp
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('artist_assets')
      .update(updatePayload)
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('4. Asset update result:', { success: !!data, error })
    console.log('=== END UPDATE ASSET DEBUG ===')

    if (error) {
      console.log('Asset update error:', error.message)
      throw new Error(`Failed to update asset: ${error.message}`)
    }

    if (!data) {
      throw new Error('Asset not found or access denied')
    }

    return data
  }

  /**
   * Delete asset by ID (also removes file from storage)
   * @param assetId - Asset ID to delete
   * @param userId - User ID for RLS verification
   */
  async deleteAsset(assetId: string, userId: string) {
    console.log('=== DELETE ASSET DEBUG ===')
    console.log('1. Asset ID:', assetId)
    console.log('2. User ID:', userId)
    
    // First get the asset to extract file path for storage deletion
    const asset = await this.getAssetById(assetId, userId)
    
    // Delete from database
    const { data, error } = await this.supabase
      .from('artist_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('3. Asset deletion result:', { success: !!data, error })

    if (error) {
      console.log('Asset deletion error:', error.message)
      throw new Error(`Failed to delete asset: ${error.message}`)
    }

    if (!data) {
      throw new Error('Asset not found or access denied')
    }

    // Extract file path from URL and delete from storage
    try {
      const filePath = this.extractFilePathFromUrl(asset.file_url)
      if (filePath) {
        await this.deleteFileFromStorage(filePath)
      }
    } catch (storageError) {
      console.log('Storage deletion warning:', storageError)
      // Don't fail the entire operation if storage deletion fails
    }

    console.log('=== END DELETE ASSET DEBUG ===')
    return { success: true, message: 'Asset deleted successfully' }
  }

  /**
   * Get primary assets by type for AI generation
   * @param userId - User ID for RLS filtering
   * @param assetType - Optional specific asset type
   */
  async getPrimaryAssets(userId: string, assetType?: string) {
    console.log('=== GET PRIMARY ASSETS DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. Asset type filter:', assetType || 'all')
    
    let query = this.supabase
      .from('artist_assets')
      .select('id, asset_name, asset_type, file_url, dominant_colors, ai_description')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .order('created_at', { ascending: false })

    if (assetType) {
      query = query.eq('asset_type', assetType)
    }

    const { data, error } = await query

    console.log('3. Primary assets found:', data?.length || 0)
    console.log('=== END GET PRIMARY ASSETS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch primary assets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Generate signed URL for file upload
   * @param userId - User ID for folder organization
   * @param uploadData - File upload metadata
   */
  async generateUploadUrl(userId: string, uploadData: FileUploadData) {
    console.log('=== GENERATE UPLOAD URL DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. File name:', uploadData.file_name)
    console.log('3. File type:', uploadData.file_type)
    console.log('4. File size:', uploadData.file_size)
    
    // Create unique file path: users/{userId}/{folder}/{timestamp}_{filename}
    const timestamp = Date.now()
    const sanitizedFileName = uploadData.file_name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `users/${userId}/${uploadData.folder}/${timestamp}_${sanitizedFileName}`
    
    console.log('5. Generated file path:', filePath)

    // Generate signed URL for upload (expires in 1 hour)
    const { data, error } = await this.supabase.storage
      .from('assets')
      .createSignedUploadUrl(filePath, {
        upsert: false
      })

    console.log('6. Signed URL generation result:', { success: !!data, error })
    console.log('=== END GENERATE UPLOAD URL DEBUG ===')

    if (error) {
      throw new Error(`Failed to generate upload URL: ${error.message}`)
    }

    return {
      upload_url: data.signedUrl,
      file_path: filePath,
      expires_in: 3600 // 1 hour
    }
  }

  /**
   * Generate signed URL for file download/access
   * @param filePath - File path in storage
   * @param expiresIn - Expiration time in seconds (default 1 hour)
   */
  async generateDownloadUrl(filePath: string, expiresIn: number = 3600) {
    console.log('=== GENERATE DOWNLOAD URL DEBUG ===')
    console.log('1. File path:', filePath)
    console.log('2. Expires in:', expiresIn, 'seconds')
    
    const { data, error } = await this.supabase.storage
      .from('assets')
      .createSignedUrl(filePath, expiresIn)

    console.log('3. Signed URL generation result:', { success: !!data, error })
    console.log('=== END GENERATE DOWNLOAD URL DEBUG ===')

    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`)
    }

    return data.signedUrl
  }

  /**
   * Get asset statistics for user dashboard
   * @param userId - User ID for statistics
   */
  async getAssetStats(userId: string) {
    console.log('=== GET ASSET STATS DEBUG ===')
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('artist_assets')
      .select('asset_type, file_size_bytes, created_at, folder')
      .eq('user_id', userId)

    console.log('Stats query result:', { count: data?.length || 0, error })
    console.log('=== END GET ASSET STATS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch asset statistics: ${error.message}`)
    }

    // Calculate statistics
    const stats = {
      total_assets: data?.length || 0,
      by_type: {} as Record<string, number>,
      by_folder: {} as Record<string, number>,
      total_size_bytes: 0,
      recent_assets: 0 // Last 7 days
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    data?.forEach(item => {
      // Count by type
      stats.by_type[item.asset_type] = (stats.by_type[item.asset_type] || 0) + 1
      
      // Count by folder
      stats.by_folder[item.folder] = (stats.by_folder[item.folder] || 0) + 1
      
      // Sum total size
      stats.total_size_bytes += item.file_size_bytes || 0
      
      // Count recent assets
      if (new Date(item.created_at) > sevenDaysAgo) {
        stats.recent_assets++
      }
    })

    return stats
  }

  /**
   * Private helper: Unset primary flag for other assets of the same type
   * @param userId - User ID for RLS filtering
   * @param assetType - Asset type to unset primary flag
   */
  private async unsetPrimaryAssets(userId: string, assetType: string) {
    console.log('Unsetting primary assets for type:', assetType)
    
    const { error } = await this.supabase
      .from('artist_assets')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('asset_type', assetType)
      .eq('is_primary', true)

    if (error) {
      console.log('Warning: Failed to unset primary assets:', error.message)
      // Don't throw error, just log warning
    }
  }

  /**
   * Private helper: Extract file path from Supabase Storage URL
   * @param fileUrl - Full Supabase Storage URL
   */
  private extractFilePathFromUrl(fileUrl: string): string | null {
    try {
      const url = new URL(fileUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'assets')
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Private helper: Delete file from Supabase Storage
   * @param filePath - File path in storage bucket
   */
  private async deleteFileFromStorage(filePath: string) {
    console.log('Deleting file from storage:', filePath)
    
    const { error } = await this.supabase.storage
      .from('assets')
      .remove([filePath])

    if (error) {
      throw new Error(`Failed to delete file from storage: ${error.message}`)
    }
  }
}
