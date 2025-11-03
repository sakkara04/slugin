// home page --> to be implemented

import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

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