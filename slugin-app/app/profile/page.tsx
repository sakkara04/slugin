// profile page
// TO-DO:
// --> update ui

import Navbar from "@/components/ui/navbar"
import ProfileCard from "./profile-card"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to signin if no user
  if (!user) {
    redirect('/signin')
  }

  // Redirect to email verification if email is not confirmed
  if (user && !user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || '')}`)
  }
  
  return (
    <div>
      <Navbar user={user} />
      <ProfileCard />
    </div>
  )
}