import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const path: string | undefined = body?.path
    if (!path) {
      return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 })
    }

    const supabase = await createClient()

    // createSignedUrl requires server credentials. Return a short-lived signed URL.
    const expiresIn = 60 * 60 // 1 hour
    const { data, error } = await supabase.storage.from('flyers').createSignedUrl(path, expiresIn)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, signedUrl: data.signedUrl })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 })
  }
}
