// email verification callback route

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Email verification successful, redirect to home
      return NextResponse.redirect(`${origin}/home`);
    }
  }

  // If there's an error or no code, redirect to error page
  return NextResponse.redirect(`${origin}/error`);
}
