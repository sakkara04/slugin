// middleware

import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Handle email verification redirects
  const url = request.nextUrl.clone()
  
  // If user is trying to access protected routes but email is not verified
  if (url.pathname.startsWith('/home') || url.pathname.startsWith('/dashboard')) {
    // Let the page handle the verification check
    return response
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}