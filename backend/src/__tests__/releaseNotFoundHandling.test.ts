import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ReleasesService } from '../services/releasesService.js'

interface EqCall {
  column: string
  value: unknown
}

class MockReleaseQueryBuilder {
  public eqCalls: EqCall[] = []

  select(_fields?: string) {
    return this
  }

  eq(column: string, value: unknown) {
    this.eqCalls.push({ column, value })
    return this
  }

  maybeSingle() {
    return Promise.resolve({ data: null, error: null })
  }
}

class MockSupabaseClient {
  public builder = new MockReleaseQueryBuilder()

  from(_table: string) {
    return this.builder
  }
}

describe('release not found handling', () => {
  it('returns null for missing release so routes can return 404', async () => {
    const mockSupabase = new MockSupabaseClient()
    const service = new ReleasesService(mockSupabase as unknown as SupabaseClient)

    const result = await service.getReleaseById('release-id', 'user-id')

    expect(result).toBeNull()
    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'id', value: 'release-id' })
    expect(mockSupabase.builder.eqCalls).toContainEqual({ column: 'user_id', value: 'user-id' })
  })
})
