import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let id: string | undefined
    let title: string | undefined
    let description: string | undefined
    let deadline: string | null = null
    let location: string | undefined
    let categories: string | undefined
  let file: File | null = null
  let rawLink: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      id = form.get('id')?.toString() || undefined
      title = form.get('title')?.toString() || undefined
      description = form.get('description')?.toString() || undefined
  // read link field if present
  rawLink = form.get('link')?.toString() || undefined
      const dl = form.get('deadline')?.toString()
      deadline = dl === '' ? null : dl || null
      location = form.get('location')?.toString() || undefined
      categories = form.get('categories')?.toString() || undefined
      const f = form.get('file')
      if (f && (f as any).name) {
        // Web File from FormData
        file = f as File
      }
    } else {
      const body = await req.json()
      id = body.id
      title = body.title
      description = body.description
  rawLink = body.link
      deadline = body.deadline || null
      location = body.location
      categories = body.categories
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) {
      return NextResponse.json({ success: false, error: userErr.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // If a file was provided, upload it to storage and set the file URL on the update.
    let fileUrl: string | null = null
    if (file) {
      const filePath = `${user.id}/${Date.now()}-${(file as any).name}`
      const { error: uploadError } = await supabase.storage.from('flyers').upload(filePath, file as any)
      if (uploadError) {
        return NextResponse.json({ success: false, error: uploadError.message }, { status: 400 })
      }
      const { data: publicData } = supabase.storage.from('flyers').getPublicUrl(filePath)
      fileUrl = publicData.publicUrl
    }

    const updatePayload: any = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      deadline: deadline || null,
      ...(location !== undefined ? { location } : {}),
      ...(categories !== undefined ? { categories } : {}),
    }
    if (fileUrl) updatePayload.file = fileUrl
    // Normalize and include link if provided
    if (typeof rawLink !== 'undefined') {
      const rl = (rawLink || '').trim()
      if (rl === '') {
        updatePayload.link = null
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(rl)) {
          updatePayload.link = `mailto:${rl}`
        } else {
          try {
            // Ensure it's a valid URL; add https:// if scheme missing
            try {
              new URL(rl)
              updatePayload.link = rl
            } catch (_) {
              const withScheme = `https://${rl}`
              new URL(withScheme)
              updatePayload.link = withScheme
            }
          } catch (err) {
            return NextResponse.json({ success: false, error: 'Invalid link format' }, { status: 400 })
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 })
  }
}
