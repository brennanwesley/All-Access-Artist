/**
 * Tasks Routes - HTTP handlers for release task management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Bindings, Variables } from '../types/bindings.js'

const tasks = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Schema for updating task completion status
const UpdateTaskSchema = z.object({
  completed_at: z.string().datetime().nullable()
})

// PATCH /api/tasks/:taskId - Update task completion status
tasks.patch('/:taskId', zValidator('json', UpdateTaskSchema), async (c) => {
  try {
    const taskId = c.req.param('taskId')
    const { completed_at } = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')
    
    if (!user?.sub) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const { data, error } = await supabase
      .from('release_tasks')
      .update({ completed_at })
      .eq('id', taskId)
      .eq('user_id', user.sub)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task' 
    }, 500)
  }
})

export default tasks
