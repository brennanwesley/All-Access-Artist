/**
 * Admin Service - Business logic for admin operations
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminUserListData } from '../types/schemas.js'

const AUTH_USERS_PAGE_SIZE = 200

type AccountType = 'admin' | 'artist' | 'manager' | 'label'

export class AdminService {
  constructor(private supabaseAdmin: SupabaseClient) {}

  /**
   * Get all users with their account types for admin dashboard
   * Uses admin client to bypass RLS and access all user data
   */
  async getAllUsers(): Promise<AdminUserListData[]> {
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
      throw new Error(`Failed to fetch user profiles: ${error.message}`)
    }

    const profiles = users ?? []
    if (profiles.length === 0) {
      return []
    }

    // Fetch auth users in paginated batches (avoids N+1 getUserById calls)
    const authUsersMap = await this.getAuthEmailMap(profiles.map((profile) => profile.id))

    // Combine profile and auth data
    return profiles.map((user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: authUsersMap.get(user.id) || 'unknown@example.com',
      account_type: user.account_type as AccountType,
      created_at: user.created_at,
      phone_verified: user.phone_verified,
    }))
  }

  /**
   * Get system statistics for admin dashboard
   */
  async getSystemStats() {
    const [
      totalUsers,
      adminUsers,
      artistUsers,
      managerUsers,
      labelUsers,
      releaseCount,
      taskCount,
    ] = await Promise.all([
      this.countUserProfiles(),
      this.countUserProfiles('admin'),
      this.countUserProfiles('artist'),
      this.countUserProfiles('manager'),
      this.countUserProfiles('label'),
      this.countTableRows('music_releases'),
      this.countTableRows('release_tasks'),
    ])

    return {
      total_users: totalUsers,
      admin_users: adminUsers,
      artist_users: artistUsers,
      manager_users: managerUsers,
      label_users: labelUsers,
      total_releases: releaseCount,
      total_tasks: taskCount,
      last_updated: new Date().toISOString(),
    }
  }

  private async getAuthEmailMap(userIds: string[]): Promise<Map<string, string | null>> {
    const remainingUserIds = new Set(userIds)
    const authUsersMap = new Map<string, string | null>()

    let page = 1

    while (remainingUserIds.size > 0) {
      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: AUTH_USERS_PAGE_SIZE,
      })

      if (error) {
        throw new Error(`Failed to fetch auth users: ${error.message}`)
      }

      const authUsers = data.users ?? []
      if (authUsers.length === 0) {
        break
      }

      for (const authUser of authUsers) {
        if (!remainingUserIds.has(authUser.id)) {
          continue
        }

        authUsersMap.set(authUser.id, authUser.email ?? null)
        remainingUserIds.delete(authUser.id)
      }

      if (authUsers.length < AUTH_USERS_PAGE_SIZE) {
        break
      }

      page += 1
    }

    return authUsersMap
  }

  private async countUserProfiles(accountType?: AccountType): Promise<number> {
    let query = this.supabaseAdmin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })

    if (accountType) {
      query = query.eq('account_type', accountType)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`)
    }

    return count || 0
  }

  private async countTableRows(tableName: 'music_releases' | 'release_tasks'): Promise<number> {
    const { count, error } = await this.supabaseAdmin
      .from(tableName)
      .select('id', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to count rows in ${tableName}: ${error.message}`)
    }

    return count || 0
  }
}
