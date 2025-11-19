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
    redirect('/signin')
  }

  // get form data
  const title = formData.get('title')
  const description = formData.get('description')
  const deadline = formData.get('deadline')
  const link = formData.get('link')
  const location = formData.get('location')
  const categories = formData.get('categories')?.toString().split(',').map(c => c.trim())
  const file = formData.get('file') as File | null
  let fileUrl = null

  // checking required fields are filled
  if (!title || !description || !deadline || !link || !location || !categories) {
    console.error('Missing required fields')
  }

  // checking if file valid and getting file url
  if (file && file.size > 0) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds 5MB limit')
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('Invalid file type, only image files (JPEG, PNG, GIF, WebP) are allowed')
    }
    const filePath = `${user.id}/${Date.now()}-${file.name}`
    const {error: uploadError} = await supabase.storage.from('flyers').upload(filePath, file)
    if (uploadError) {
      console.error('File upload error: ', uploadError)
    }
    const { data } = supabase.storage.from('flyers').getPublicUrl(filePath)
    fileUrl = data.publicUrl
  }

  // inserting into db
  const {data, error} = await supabase
  .from('opportunities')
  .insert({title, description, deadline, link, location, categories, file: fileUrl, user_id: user.id})

  if (error) {
    console.error('Error saving data:', error)

  }
  else {
    console.log('Successfully created post!')
  }

  // redirect to opportunities page once done
  redirect('/opportunities')
}

