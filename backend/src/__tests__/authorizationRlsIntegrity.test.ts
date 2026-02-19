import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CalendarService } from '../services/calendarService.js'

interface EqCall {
  column: string
  value: unknown
}

class MockQueryBuilder {
  public eqCalls: EqCall[] = []
  public error: null = null

  select(_fields?: string) {
    return this
  }

  order(_column: string, _options: { ascending: boolean }) {
    return this
  }

  insert(_values: Record<string, unknown>) {
    return this
  }

  update(_values: Record<string, unknown>) {
    return this
  }

  delete() {
    return this
  }

  eq(column: string, value: unknown) {
    this.eqCalls.push({ column, value })
    return this
  }

  single() {
    return Promise.resolve({ data: { id: 'event-id' }, error: null })
  }
}

class MockSupabaseClient {
  public builder = new MockQueryBuilder()

  from(_table: string) {
    return this.builder
  }
}

describe('P4-06 authorization/RLS integrity audit', () => {
  it('scopes calendar event reads by authenticated user to block cross-user access', async () => {
    const attackerUserId = 'attacker-user-id'
    const victimEventId = 'victim-event-id'
    const mockSupabase = new MockSupabaseClient()
    const service = new CalendarService(mockSupabase as unknown as SupabaseClient)

    await service.getCalendarEventById(attackerUserId, victimEventId)

    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'id', value: victimEventId })
    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'user_id', value: attackerUserId })
  })

  it('scopes calendar event updates by authenticated user to block cross-user mutations', async () => {
    const attackerUserId = 'attacker-user-id'
    const victimEventId = 'victim-event-id'
    const mockSupabase = new MockSupabaseClient()
    const service = new CalendarService(mockSupabase as unknown as SupabaseClient)

    await service.updateCalendarEvent(attackerUserId, victimEventId, { title: 'malicious overwrite attempt' })

    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'id', value: victimEventId })
    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'user_id', value: attackerUserId })
  })

  it('scopes calendar event deletes by authenticated user to block cross-user deletes', async () => {
    const attackerUserId = 'attacker-user-id'
    const victimEventId = 'victim-event-id'
    const mockSupabase = new MockSupabaseClient()
    const service = new CalendarService(mockSupabase as unknown as SupabaseClient)

    await service.deleteCalendarEvent(attackerUserId, victimEventId)

    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'id', value: victimEventId })
    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'user_id', value: attackerUserId })
  })
})
