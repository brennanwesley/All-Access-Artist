/**
 * Admin Service - Business logic for admin operations
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminUserListData } from '../types/schemas.js'

export class AdminService {
  constructor(private supabaseAdmin: SupabaseClient) {}

  /**
   * Get all users with their account types for admin dashboard
   * Uses admin client to bypass RLS and access all user data
   */
  async getAllUsers(): Promise<AdminUserListData[]> {
    console.log('AdminService.getAllUsers called')
    
    try {
      // Query user profiles with auth.users data using admin client
      const { data: users, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          account_type,
          phone_verified,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Error fetching user profiles:', error)
        throw new Error(`Failed to fetch user profiles: ${error.message}`)
      }

      console.log(`Found ${users?.length || 0} user profiles`)

      // Get corresponding auth.users data for emails
      const userIds = users?.map(user => user.id) || []
      if (userIds.length === 0) {
        return []
      }

      console.log('Fetching auth user data for', userIds.length, 'users')
      
      // Fetch auth users in batches to get email addresses
      const authUsersPromises = userIds.map(async (userId) => {
        const { data: authUser, error: authError } = await this.supabaseAdmin.auth.admin.getUserById(userId)
        if (authError) {
          console.log(`Error fetching auth data for user ${userId}:`, authError)
          return null
        }
        return {
          id: userId,
          email: authUser.user?.email || null
        }
      })

      const authUsersResults = await Promise.all(authUsersPromises)
      const authUsersMap = new Map(
        authUsersResults
          .filter(result => result !== null)
          .map(result => [result!.id, result!.email])
      )

      console.log('Successfully fetched auth data for', authUsersMap.size, 'users')

      // Combine profile and auth data
      const combinedUsers: AdminUserListData[] = users.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: authUsersMap.get(user.id) || 'unknown@example.com',
        account_type: user.account_type as 'admin' | 'artist' | 'manager' | 'label',
        created_at: user.created_at,
        phone_verified: user.phone_verified
      }))

      console.log('Combined user data successfully')
      return combinedUsers
    } catch (error) {
      console.log('AdminService.getAllUsers ERROR:', error)
      throw error
    }
  }

  /**
   * Get system statistics for admin dashboard
   */
  async getSystemStats() {
    console.log('AdminService.getSystemStats called')
    
    try {
      // Get user count by account type
      const { data: userStats, error: userStatsError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('account_type')

      if (userStatsError) {
        throw new Error(`Failed to fetch user stats: ${userStatsError.message}`)
      }

      // Count users by type
      const stats = {
        total_users: userStats?.length || 0,
        admin_users: userStats?.filter(u => u.account_type === 'admin').length || 0,
        artist_users: userStats?.filter(u => u.account_type === 'artist').length || 0,
        manager_users: userStats?.filter(u => u.account_type === 'manager').length || 0,
        label_users: userStats?.filter(u => u.account_type === 'label').length || 0
      }

      // Get release count
      const { count: releaseCount, error: releaseError } = await this.supabaseAdmin
        .from('releases')
        .select('id', { count: 'exact' })

      if (releaseError) {
        console.log('Warning: Could not fetch release count:', releaseError)
      }

      // Get task count
      const { count: taskCount, error: taskError } = await this.supabaseAdmin
        .from('tasks')
        .select('id', { count: 'exact' })

      if (taskError) {
        console.log('Warning: Could not fetch task count:', taskError)
      }

      return {
        ...stats,
        total_releases: releaseCount || 0,
        total_tasks: taskCount || 0,
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.log('AdminService.getSystemStats ERROR:', error)
      throw error
    }
  }
}
