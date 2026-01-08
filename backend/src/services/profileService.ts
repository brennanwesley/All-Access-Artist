/**
 * Profile Service - Business logic for user profile management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateUserProfileData, UpdateUserProfileData } from '../types/schemas.js'
import { logger, extractErrorInfo } from '../utils/logger.js'

const profileLogger = logger.child('profileService')

export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get user profile with email from auth.users
   */
  async getUserProfile(userId: string, supabaseAdmin: SupabaseClient) {
    profileLogger.debug('getUserProfile called', { userId })
    
    try {
      // Get user profile data using user-scoped client (for RLS)
      const { data: profileData, error: profileError } = await this.supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          phone_verified,
          account_type,
          billing_address,
          payment_method_last4,
          referral_code,
          referral_credits,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single()

      if (profileError) {
        // If user profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          profileLogger.info('Profile not found, creating new profile', { userId })
          const newProfile = await this.createUserProfile(userId)
          return {
            ...newProfile,
            email: null,
            phone: null
          }
        }
        throw new Error(`Failed to fetch user profile: ${profileError.message}`)
      }

      // Get user data from Supabase Auth using admin client (no JWT conflicts)
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (authError) {
        profileLogger.error('Auth error fetching user data', { userId, error: authError.message })
        throw new Error(`Failed to fetch user auth data: ${authError.message}`)
      }

      // Combine the data
      const profile = {
        ...profileData,
        email: authUser.user?.email,
        phone: authUser.user?.phone
      }

      profileLogger.debug('Profile retrieved successfully', { userId })
      return profile
    } catch (error) {
      profileLogger.error('getUserProfile error', { userId, ...extractErrorInfo(error) })
      throw error
    }
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(userId: string, profileData: UpdateUserProfileData) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select(`
        id,
        first_name,
        last_name,
        phone_verified,
        account_type,
        billing_address,
        payment_method_last4,
        referral_code,
        referral_credits,
        updated_at
      `)
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }

  /**
   * Validate referral code and check eligibility
   */
  async validateReferralCode(code: string, userId: string) {
    // Check if referral code exists and get referrer info
    const { data: referrer, error: referrerError } = await this.supabase
      .from('user_profiles')
      .select('id, first_name, last_name, referral_code')
      .eq('referral_code', code)
      .single()

    if (referrerError || !referrer) {
      throw new Error('Invalid referral code')
    }

    // Prevent self-referral
    if (referrer.id === userId) {
      throw new Error('Cannot use your own referral code')
    }

    // Check if user already has a referrer
    const { data: currentUser, error: userError } = await this.supabase
      .from('user_profiles')
      .select('referred_by')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error('Failed to validate user eligibility')
    }

    if (currentUser.referred_by) {
      throw new Error('User already has a referrer')
    }

    return {
      valid: true,
      referrer: {
        id: referrer.id,
        name: `${referrer.first_name || ''} ${referrer.last_name || ''}`.trim(),
        referral_code: referrer.referral_code
      }
    }
  }

  /**
   * Apply referral code and award credits
   */
  async applyReferralCode(code: string, userId: string) {
    // First validate the referral code
    const validation = await this.validateReferralCode(code, userId)
    
    if (!validation.valid) {
      throw new Error('Invalid referral code')
    }

    // Use a transaction to update both users
    const { data, error } = await this.supabase.rpc('apply_referral_code', {
      p_referral_code: code,
      p_referred_user_id: userId,
      p_credit_amount: 1 // Award 1 credit for now
    })

    if (error) {
      // If RPC doesn't exist, fall back to manual updates
      try {
        // Update referred user
        await this.supabase
          .from('user_profiles')
          .update({ referred_by: validation.referrer.id })
          .eq('id', userId)

        // Award credit to referrer - get current credits first
        const { data: referrerData, error: referrerError } = await this.supabase
          .from('user_profiles')
          .select('referral_credits')
          .eq('id', validation.referrer.id)
          .single()

        if (referrerError) {
          throw new Error(`Failed to get referrer data: ${referrerError.message}`)
        }

        await this.supabase
          .from('user_profiles')
          .update({ 
            referral_credits: (referrerData.referral_credits || 0) + 1
          })
          .eq('id', validation.referrer.id)

        return {
          success: true,
          referrer: validation.referrer,
          credits_awarded: 1
        }
      } catch (fallbackError) {
        throw new Error(`Failed to apply referral code: ${fallbackError}`)
      }
    }

    return data
  }

  /**
   * Get referral statistics for user
   */
  async getReferralStats(userId: string) {
    // Get user's referral info
    const { data: userProfile, error: userError } = await this.supabase
      .from('user_profiles')
      .select('referral_code, referral_credits, referred_by')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch referral stats: ${userError.message}`)
    }

    // Count users referred by this user
    const { count: referredCount, error: countError } = await this.supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .eq('referred_by', userId)

    if (countError) {
      throw new Error(`Failed to count referred users: ${countError.message}`)
    }

    // Get referrer info if user was referred
    let referredBy = null
    if (userProfile.referred_by) {
      const { data: referrerData, error: referrerError } = await this.supabase
        .from('user_profiles')
        .select('first_name, last_name, referral_code')
        .eq('id', userProfile.referred_by)
        .single()

      if (!referrerError && referrerData) {
        referredBy = {
          name: `${referrerData.first_name || ''} ${referrerData.last_name || ''}`.trim(),
          referral_code: referrerData.referral_code
        }
      }
    }

    return {
      referral_code: userProfile.referral_code,
      referral_credits: userProfile.referral_credits || 0,
      users_referred: referredCount || 0,
      referred_by: referredBy
    }
  }

  /**
   * Create user profile for new signups
   */
  async createUserProfile(userId: string, profileData: CreateUserProfileData = {}) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        ...profileData
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  }
}
