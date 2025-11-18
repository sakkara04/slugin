import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
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

    const { data, error } = await supabase
      .from('opportunities')
      .delete()
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
