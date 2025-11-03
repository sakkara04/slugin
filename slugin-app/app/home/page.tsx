// home page --> to be implemented

import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
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
        <div>
            <h1>Home page!</h1>
            <h2>Welcome, { first_name }.</h2>
            <form action="/auth/signout" method="post">
                <Button variant="outline" type="submit">
                    Sign out
                </Button>
            </form>
        </div>
    )
}