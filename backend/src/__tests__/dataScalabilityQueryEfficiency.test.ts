import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AdminService } from '../services/adminService.js'

type AccountType = 'admin' | 'artist' | 'manager' | 'label'

interface UserProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
  account_type: AccountType
  phone_verified: boolean | null
  created_at: string
}

interface AuthUserRow {
  id: string
  email: string | null
}

interface MockState {
  userProfiles: UserProfileRow[]
  authUserPages: AuthUserRow[][]
  rowCounts: {
    music_releases: number
    release_tasks: number
  }
}

interface CountQueryResult {
  count: number | null
  error: { message: string } | null
}

class MockFromBuilder {
  private isCountQuery = false
  private accountTypeFilter: AccountType | null = null

  constructor(
    private readonly tableName: string,
    private readonly state: MockState
  ) {}

  select(_columns: string, options?: { count?: 'exact'; head?: boolean }) {
    if (options?.head) {
      this.isCountQuery = true
    }
    return this
  }

  order(_column: string, _options: { ascending: boolean }) {
    if (this.tableName === 'user_profiles' && !this.isCountQuery) {
      return Promise.resolve({ data: this.state.userProfiles, error: null })
    }

    return Promise.resolve({ data: [], error: null })
  }

  eq(column: string, value: string) {
    if (this.tableName === 'user_profiles' && this.isCountQuery && column === 'account_type') {
      this.accountTypeFilter = value as AccountType
    }

    return this
  }

  then<TResult1 = CountQueryResult, TResult2 = never>(
    onfulfilled?: ((value: CountQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.resolveCountResult()).then(onfulfilled ?? undefined, onrejected ?? undefined)
  }

  private resolveCountResult(): CountQueryResult {
    if (this.tableName === 'user_profiles') {
      if (this.accountTypeFilter === null) {
        return { count: this.state.userProfiles.length, error: null }
      }

      const filteredCount = this.state.userProfiles.filter(
        (profile) => profile.account_type === this.accountTypeFilter
      ).length

      return { count: filteredCount, error: null }
    }

    if (this.tableName === 'music_releases') {
      return { count: this.state.rowCounts.music_releases, error: null }
    }

    if (this.tableName === 'release_tasks') {
      return { count: this.state.rowCounts.release_tasks, error: null }
    }

    return { count: null, error: { message: `Unknown table: ${this.tableName}` } }
  }
}

class MockSupabaseAdmin {
  private readonly state: MockState

  public readonly listUsersMock: ReturnType<typeof vi.fn>
  public readonly getUserByIdMock: ReturnType<typeof vi.fn>

  public readonly auth: {
    admin: {
      listUsers: (params: { page: number; perPage: number }) => Promise<{ data: { users: AuthUserRow[] }; error: null }>
      getUserById: (...args: unknown[]) => unknown
    }
  }

  constructor(state: MockState) {
    this.state = state

    this.listUsersMock = vi.fn(async ({ page }: { page: number; perPage: number }) => {
      const users = this.state.authUserPages[page - 1] ?? []
      return {
        data: { users },
        error: null,
      }
    })

    this.getUserByIdMock = vi.fn()

    this.auth = {
      admin: {
        listUsers: this.listUsersMock,
        getUserById: this.getUserByIdMock,
      },
    }
  }

  from(tableName: string) {
    return new MockFromBuilder(tableName, this.state)
  }
}

describe('P4-08 data scalability and query efficiency', () => {
  it('avoids auth N+1 lookups by batching admin auth list calls', async () => {
    const mockSupabase = new MockSupabaseAdmin({
      userProfiles: [
        {
          id: 'user-1',
          first_name: 'Ada',
          last_name: 'Lovelace',
          account_type: 'admin',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
        {
          id: 'user-2',
          first_name: 'Grace',
          last_name: 'Hopper',
          account_type: 'artist',
          phone_verified: true,
          created_at: '2026-02-18T00:00:00.000Z',
        },
      ],
      authUserPages: [
        [
          { id: 'user-1', email: 'ada@example.com' },
          { id: 'user-2', email: 'grace@example.com' },
        ],
      ],
      rowCounts: {
        music_releases: 10,
        release_tasks: 25,
      },
    })

    const adminService = new AdminService(mockSupabase as unknown as SupabaseClient)
    const users = await adminService.getAllUsers()

    expect(users).toHaveLength(2)
    expect(users[0]?.email).toBe('ada@example.com')
    expect(users[1]?.email).toBe('grace@example.com')

    expect(mockSupabase.listUsersMock).toHaveBeenCalledTimes(1)
    expect(mockSupabase.listUsersMock).toHaveBeenCalledWith({ page: 1, perPage: 200 })
    expect(mockSupabase.getUserByIdMock).not.toHaveBeenCalled()
  })

  it('continues auth pagination until matching profile users are found', async () => {
    const firstPageWithoutTarget: AuthUserRow[] = Array.from({ length: 200 }, (_value, index) => ({
      id: `unused-${index}`,
      email: `unused-${index}@example.com`,
    }))

    const mockSupabase = new MockSupabaseAdmin({
      userProfiles: [
        {
          id: 'target-user',
          first_name: 'Target',
          last_name: 'User',
          account_type: 'artist',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
      ],
      authUserPages: [
        firstPageWithoutTarget,
        [{ id: 'target-user', email: 'target@example.com' }],
      ],
      rowCounts: {
        music_releases: 10,
        release_tasks: 25,
      },
    })

    const adminService = new AdminService(mockSupabase as unknown as SupabaseClient)
    const users = await adminService.getAllUsers()

    expect(users).toHaveLength(1)
    expect(users[0]?.email).toBe('target@example.com')
    expect(mockSupabase.listUsersMock).toHaveBeenCalledTimes(2)
    expect(mockSupabase.listUsersMock).toHaveBeenNthCalledWith(1, { page: 1, perPage: 200 })
    expect(mockSupabase.listUsersMock).toHaveBeenNthCalledWith(2, { page: 2, perPage: 200 })
  })

  it('pushes dashboard stats aggregation to SQL count queries', async () => {
    const mockSupabase = new MockSupabaseAdmin({
      userProfiles: [
        {
          id: 'admin-1',
          first_name: 'Admin',
          last_name: 'One',
          account_type: 'admin',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
        {
          id: 'artist-1',
          first_name: 'Artist',
          last_name: 'One',
          account_type: 'artist',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
        {
          id: 'artist-2',
          first_name: 'Artist',
          last_name: 'Two',
          account_type: 'artist',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
        {
          id: 'manager-1',
          first_name: 'Manager',
          last_name: 'One',
          account_type: 'manager',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
        {
          id: 'label-1',
          first_name: 'Label',
          last_name: 'One',
          account_type: 'label',
          phone_verified: true,
          created_at: '2026-02-19T00:00:00.000Z',
        },
      ],
      authUserPages: [[]],
      rowCounts: {
        music_releases: 97,
        release_tasks: 540,
      },
    })

    const adminService = new AdminService(mockSupabase as unknown as SupabaseClient)
    const stats = await adminService.getSystemStats()

    expect(stats.total_users).toBe(5)
    expect(stats.admin_users).toBe(1)
    expect(stats.artist_users).toBe(2)
    expect(stats.manager_users).toBe(1)
    expect(stats.label_users).toBe(1)
    expect(stats.total_releases).toBe(97)
    expect(stats.total_tasks).toBe(540)
  })
})
