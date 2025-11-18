// server actions for posting opportunities

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function postOpportunity(formData: FormData) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // redirect('/signin')
  }

  // Get form data
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const deadline = formData.get('deadline') as string
  const location = formData.get('location') as string
  const categories = formData.get('categories') as string
  const file = formData.get('file') as File | null

  // TODO: Implement database insertion
  // This will need to:
  // 1. Parse categories (comma-separated string into array or separate table)
  // 2. Handle file upload to Supabase Storage if file is provided
  // 3. Insert opportunity data into database table
  // 4. Handle errors appropriately

  console.log('Opportunity data:', {
    title,
    description,
    deadline,
    location,
    categories,
    file: file?.name,
    userId: user.id,
  })

  // Build row to insert. Keep categories as a comma-separated string for now.
  const row: Record<string, any> = {
    title,
    description,
    deadline: deadline || null,
    location,
    categories,
    user_id: user?.id,
  }

  try {
    const { error } = await supabase.from('opportunities').insert(row)
    if (error) {
      console.error('Error inserting opportunity:', error)
      revalidatePath('/post')
      return
    }

    // Revalidate the post page so server-rendered list updates.
    revalidatePath('/post')
    return
  } catch (err) {
    console.error('Unexpected error inserting opportunity:', err)
    revalidatePath('/post')
    return
  }
}

