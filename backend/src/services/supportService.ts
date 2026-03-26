/**
 * Support Service - Business logic for support ticket tracking
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateSupportTicketData, UpdateSupportTicketStatusData } from '../types/schemas.js'
import { logger } from '../utils/logger.js'

const supportLogger = logger.child('supportService')
const SUPPORT_OVERVIEW_LIMIT = 8

type SupportTicketStatusFilter = 'open' | 'in_progress' | 'resolved'

export interface SupportTicketRow {
  id: string
  user_id: string
  subject: string
  category: string
  priority: string
  status: string
  description: string
  admin_notes: string | null
  resolved_at: string | null
  last_response_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SupportTicketUserProfile {
  first_name: string | null
  last_name: string | null
  artist_name: string | null
  account_type: string | null
}

export interface SupportTicketAdminRow extends SupportTicketRow {
  user_profiles?: SupportTicketUserProfile | SupportTicketUserProfile[] | null
}

export interface SupportTicketOverview {
  summary: {
    total_tickets: number
    open_tickets: number
    in_progress_tickets: number
    resolved_tickets: number
  }
  recent_tickets: SupportTicketAdminRow[]
}

export class SupportService {
  constructor(private supabase: SupabaseClient) {}

  async createSupportTicket(userId: string, ticketData: CreateSupportTicketData): Promise<SupportTicketRow> {
    supportLogger.debug('createSupportTicket called', {
      userId,
      category: ticketData.category,
      priority: ticketData.priority,
    })

    const { data, error } = await this.supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject: ticketData.subject.trim(),
        category: ticketData.category,
        priority: ticketData.priority,
        description: ticketData.description.trim(),
        status: 'open',
      })
      .select('*')
      .single()

    if (error) {
      supportLogger.error('Failed to create support ticket', {
        userId,
        error: error.message,
        code: error.code,
      })
      throw new Error(`Failed to create support ticket: ${error.message}`)
    }

    supportLogger.info('Support ticket created', { ticketId: data.id, userId })
    return data as SupportTicketRow
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicketRow[]> {
    supportLogger.debug('getUserSupportTickets called', { userId })

    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      supportLogger.error('Failed to fetch support tickets', {
        userId,
        error: error.message,
        code: error.code,
      })
      throw new Error(`Failed to fetch support tickets: ${error.message}`)
    }

    const tickets = (data ?? []) as SupportTicketRow[]
    supportLogger.debug('Support tickets retrieved', { userId, count: tickets.length })
    return tickets
  }

  async getAdminSupportOverview(): Promise<SupportTicketOverview> {
    supportLogger.debug('getAdminSupportOverview called')

    const [totalTickets, openTickets, inProgressTickets, resolvedTickets, recentTicketsResult] = await Promise.all([
      this.countTickets(),
      this.countTickets('open'),
      this.countTickets('in_progress'),
      this.countTickets('resolved'),
      this.supabase
        .from('support_tickets')
        .select(`
          id,
          user_id,
          subject,
          category,
          priority,
          status,
          description,
          admin_notes,
          resolved_at,
          last_response_at,
          created_at,
          updated_at,
          user_profiles (
            first_name,
            last_name,
            artist_name,
            account_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(SUPPORT_OVERVIEW_LIMIT),
    ])

    if (recentTicketsResult.error) {
      supportLogger.error('Failed to fetch recent support tickets', {
        error: recentTicketsResult.error.message,
        code: recentTicketsResult.error.code,
      })
      throw new Error(`Failed to fetch recent support tickets: ${recentTicketsResult.error.message}`)
    }

    const overview: SupportTicketOverview = {
      summary: {
        total_tickets: totalTickets,
        open_tickets: openTickets,
        in_progress_tickets: inProgressTickets,
        resolved_tickets: resolvedTickets,
      },
      recent_tickets: (recentTicketsResult.data ?? []) as SupportTicketAdminRow[],
    }

    supportLogger.debug('Support overview retrieved', {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      recentTicketCount: overview.recent_tickets.length,
    })

    return overview
  }

  async updateSupportTicketStatus(ticketId: string, ticketData: UpdateSupportTicketStatusData): Promise<SupportTicketAdminRow> {
    supportLogger.debug('updateSupportTicketStatus called', {
      ticketId,
      status: ticketData.status,
      hasAdminNotes: ticketData.admin_notes !== undefined,
    })

    const resolvedAt = ticketData.status === 'resolved' || ticketData.status === 'closed' ? new Date().toISOString() : null
    const updatePayload: {
      status: string
      admin_notes?: string | null
      last_response_at: string
      resolved_at: string | null
    } = {
      status: ticketData.status,
      last_response_at: new Date().toISOString(),
      resolved_at: resolvedAt,
    }

    if (ticketData.admin_notes !== undefined) {
      updatePayload.admin_notes = ticketData.admin_notes?.trim() || null
    }

    const { data, error } = await this.supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', ticketId)
      .select(`
        id,
        user_id,
        subject,
        category,
        priority,
        status,
        description,
        admin_notes,
        resolved_at,
        last_response_at,
        created_at,
        updated_at,
        user_profiles (
          first_name,
          last_name,
          artist_name,
          account_type
        )
      `)
      .single()

    if (error) {
      supportLogger.error('Failed to update support ticket', {
        ticketId,
        status: ticketData.status,
        error: error.message,
        code: error.code,
      })
      throw new Error(`Failed to update support ticket: ${error.message}`)
    }

    supportLogger.info('Support ticket updated', { ticketId, status: ticketData.status })
    return data as SupportTicketAdminRow
  }

  private async countTickets(status?: SupportTicketStatusFilter): Promise<number> {
    let query = this.supabase.from('support_tickets').select('id', { count: 'exact', head: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { count, error } = await query
    if (error) {
      throw new Error(`Failed to count support tickets: ${error.message}`)
    }

    return count ?? 0
  }
}
