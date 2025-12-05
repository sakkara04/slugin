// opportunities page

import Navbar from "@/components/ui/navbar"
import OpportunitiesCard from "./opportunities-card"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function OpportunitiesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Redirect to signin if no user
    if (!user) {
        redirect('/signin')
    }

    // Redirect to email verification if email is not confirmed
    // OMITTED: email verification doesn't work
    /*if (user && !user.email_confirmed_at) {
        redirect(`/verify-email?email=${encodeURIComponent(user.email || '')}`)
    }*/

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-blue-50">
            <Navbar user={user} />
            <OpportunitiesCard user={user} />
        </div>
    )
}