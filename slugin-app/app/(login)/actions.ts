'use server'

// server actions for user sign up/sign in
// TO-DO:
// --> fix email verification error on account creation

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const canPost = formData.get("can_post") === "true"

  const data = {
    email: formData.get('email') as string,
    password: formData.get('email') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`,
      data: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        website: formData.get('website') as string,
        can_post: canPost,
      }
    }
  }

  const { data: result, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error)
    redirect('/error')
  }

  if (result.user) {
    await supabase.from('profiles').insert({
      id: result.user.id,
      email: data.email,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      can_post: canPost,
    });
  }
  
redirect('/home')
  // Navigate to check email confirmation
  // revalidatePath('/', 'layout');
  // redirect('/verify-email?email=' + encodeURIComponent(data.email));
}