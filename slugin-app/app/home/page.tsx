// home page --> to be finished

import Navbar from "@/components/ui/navbar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
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

    const first_name = user?.user_metadata?.first_name;

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-blue-50">
            <Navbar user={user} />
            <main style={{ padding: 30 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: '60%' }}>
                        <h1 className="text-3xl">Welcome, {first_name}.</h1>
                        <p className="text-2xl"> This is the home page. More features coming soon! </p>
                        <p className="text-lg">Looking for ways to get involved, build experience, or explore what’s out there? Our platform helps UCSC students discover up-to-date campus jobs, research openings, internships, and events—all tailored to your interests. Whether you’re just getting started or ready to level up, we make it easy to find opportunities that help you grow and make the most of your time at Santa Cruz.</p>
                    </div>
                    <div style={{ flex: 1 }} />
                </div>
            </main>
        </div>
    )
}