import { createClient } from '@/utils/supabase/client'

export type UserAction = 'liked' | 'applied' | 'saved'

/**
 * Upsert a user interaction row for (user_id, opportunity_id).
 * Ensures the UNIQUE constraint on (user_id, opportunity_id) is respected by using upsert
 * with onConflict. Throws an error on failure.
 */
export async function upsertUserInteraction(userId: string, opportunityId: number | string, action: UserAction) {
  const supabase = createClient()

  const payload = {
    user_id: userId,
    opportunity_id: Number(opportunityId),
    action,
  }

  const { data, error } = await supabase
    .from('user_interactions')
    .upsert(payload, { onConflict: 'user_id,opportunity_id' })
    .select()

  if (error) {
    console.error('Failed to upsert user interaction', error)
    throw error
  }

  return data
}

export default upsertUserInteraction

/**
 * Delete any interaction row for (user_id, opportunity_id).
 * Used when the user toggles off an action so the DB shows no action.
 */
export async function deleteUserInteraction(userId: string, opportunityId: number | string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_interactions')
    .delete()
    .match({ user_id: userId, opportunity_id: Number(opportunityId) })

  if (error) {
    console.error('Failed to delete user interaction', error)
    throw error
  }

  return true
}
