// server actions for posting opportunities

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function postOpportunity(formData: FormData) {
  const supabase = await createClient()

  // check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // If the user is not authenticated, redirect them to the sign-in page.
    redirect('/signin')
  }

  // get form data
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const deadline = formData.get('deadline')
  // Read the link/email input. This field is required in the form and may be
  // either an application URL or a contact email. We'll normalize emails to
  // a mailto: URL so the rest of the app can open it directly.
  const rawLink = formData.get('link')?.toString() || ''
  let link: string | null = null
  const location = formData.get('location') as string
  // Use the categories array for consistency but store as string if the DB expects it (which the insertion logic below assumes).
  const categoriesArray = formData.get('categories')?.toString().split(',').map(c => c.trim())
  const categories = categoriesArray ? categoriesArray.join(', ') : null // Convert back to a string for insertion
  const file = formData.get('file') as File | null
  let fileUrl: string | null = null

  // --- 1. Validation Checks ---
  // Checking required fields are filled (using the fields present in the form data)
  if (!title || !description || !deadline || !location || !categories || !rawLink) {
    console.error('Missing required fields')
    // Revalidate and return to show the error state or redirect back to the form
    revalidatePath('/post') 
    return { error: 'Please fill out all required fields.' }
  }

  // Normalize the link: if it's an email, convert to mailto:, otherwise ensure
  // it's a valid URL (add https:// if the user omitted scheme).
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(rawLink)) {
    link = `mailto:${rawLink}`
  } else {
    try {
      // Try to parse as a URL. If it lacks a scheme, try adding https://
      try {
        // will throw if invalid
        new URL(rawLink)
        link = rawLink
      } catch (_) {
        // Prepend https:// and test again
        const tryUrl = `https://${rawLink}`
        new URL(tryUrl)
        link = tryUrl
      }
    } catch (err) {
      console.error('Invalid link provided:', rawLink)
      revalidatePath('/post')
      return { error: 'Please provide a valid URL or email address for application/contact.' }
    }
  }

  // --- 2. File Upload Handling (from 'main' branch logic) ---
  if (file && file.size > 0) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB limit
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds 5MB limit')
      revalidatePath('/post')
      return { error: 'File size exceeds 5MB limit.' }
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('Invalid file type, only image files (JPEG, PNG, GIF, WebP) are allowed')
      revalidatePath('/post')
      return { error: 'Invalid file type. Only images are allowed.' }
    }
    
    // Upload file to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('flyers').upload(filePath, file)
    
    if (uploadError) {
      console.error('File upload error:', uploadError)
      revalidatePath('/post')
      return { error: 'Failed to upload file.' }
    }
    
    // Get the public URL for the uploaded file
    const { data } = supabase.storage.from('flyers').getPublicUrl(filePath)
    fileUrl = data.publicUrl
  }
  
  // --- 3. Database Insertion (combining 'christina-US3.3-Task2' and 'main' logic) ---
  const row = {
    title,
    description,
    deadline: deadline || null, // Ensure deadline is handled
    link,
    location,
    categories, // This is now a comma-separated string
    file: fileUrl, // The URL from the upload step
    user_id: user.id, // Ensure user ID is correctly linked
  } as const // Ensure the object structure matches your DB column names

  try {
    const { error } = await supabase.from('opportunities').insert(row)

    if (error) {
      console.error('Error inserting opportunity:', error)
      revalidatePath('/post')
      return { error: 'Failed to save opportunity to database.' }
    }

    // --- 4. Success and Redirect (from 'main' branch logic) ---
    console.log('Successfully created post!')
    // Revalidate the /post page (to update the user's list of posts) and redirect
    revalidatePath('/post')
    redirect('/opportunities')

  } catch (err) {
    console.error('Unexpected error inserting opportunity:', err)
    revalidatePath('/post')
    return { error: 'An unexpected server error occurred.' }
  }
}

// Adapter for form action: the App Router expects a server action that returns
// void | Promise<void>. Older `postOpportunity` returns an error object on
// validation failures. This wrapper calls it and converts any error result into
// a thrown Error so the form action has a void return type.
export async function postOpportunityAction(formData: FormData): Promise<void> {
  const result = await postOpportunity(formData)
  if (result && typeof result === 'object' && 'error' in result && (result as any).error) {
    // Throw so the action returns Promise<void> and the runtime surfaces the error.
    throw new Error((result as any).error)
  }
  return
}