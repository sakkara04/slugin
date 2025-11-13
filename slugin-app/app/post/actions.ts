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
    // redirect('/signin') // commented out for dev purposes
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const deadline = formData.get('deadline') as string
  const link = formData.get('link') as string
  const location = formData.get('location') as string
  const categories = formData.get('categories') as string
  const file = formData.get('file') as File | null

  // TODO: Implement database insertion
  // need to:
  // Parse categories (comma-separated string into array or separate table)
  // Handle file upload to Supabase Storage if file is provided
  // Insert opportunity data into database table
  

  console.log('Opportunity data:', {
    title,
    description,
    deadline,
    link,
    location,
    categories,
    file: file?.name,
    userId: user.id,
  })

  // For now, just redirect to home
  revalidatePath('/post')
  revalidatePath('/home')
  redirect('/home')
}

