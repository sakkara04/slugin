// home page --> to be finished

import Navbar from "@/components/ui/navbar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SavedOpportunitiesList from '@/components/opportunities/SavedOpportunitiesList'

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

    const first_name = (user as any)?.user_metadata?.first_name || 'there';

    // Load user-specific data: saved opportunities + counts of interactions
    const { data: interactions } = await supabase
        .from('user_interactions')
        .select('opportunity_id,action')
        .eq('user_id', user.id);

    const savedIds = (interactions || [])
        .filter((r: any) => r.action === 'saved')
        .map((r: any) => Number(r.opportunity_id));
    const appliedCount = (interactions || []).filter((r: any) => r.action === 'applied').length;

    let savedOpps: any[] = [];
    if (savedIds.length > 0) {
        const { data: oppData } = await supabase
            .from('opportunities')
            .select('*')
            .in('id', savedIds);
        savedOpps = oppData || [];
    }

    // Only show active saved opportunities (deadline in the future or empty)
    const today = new Date();
    const activeSaved = savedOpps.filter((o: any) => {
        if (!o.deadline) return true;
        const d = new Date(o.deadline);
        // treat same-day as active
        return d >= new Date(today.toDateString());
    });

    // Live quick stats: active posts and number of users (profiles)
    const todayISO = new Date().toISOString().slice(0, 10);
    const { count: activePostsCount } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: false })
        .or(`deadline.gte.${todayISO},deadline.is.null`);

    const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-blue-50">
            <Navbar user={user} />

            <main className="container mx-auto py-12 px-6">
                {/* Hero */}
                <section className="bg-white/80 rounded-xl p-8 shadow-md flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-semibold mb-2">Welcome, {first_name} 👋</h1>
                        <p className="text-lg text-muted-foreground mb-4">Find campus jobs, research positions, internships, and events — all in one place.</p>
                        <p className="mb-6 text-sm md:text-base">SlugIn helps UCSC students discover meaningful opportunities to build skills, connect with project teams, and grow their resumes. Save postings, mark as applied, and get suggestions tailored to your interests.</p>
                    </div>

                    <div className="w-full md:w-1/3 bg-gradient-to-br from-indigo-50 to-white rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Quick stats</div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                            <div className="bg-white rounded-md p-3 shadow-sm">
                                <div className="text-2xl font-bold">{activePostsCount ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Active posts</div>
                            </div>
                            <div className="bg-white rounded-md p-3 shadow-sm">
                                <div className="text-2xl font-bold">{usersCount ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Users</div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Student section: browse/profile + saved opportunities + personal stats */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: actions and brief instructions for students */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium">For Students</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Quickly browse opportunities tailored to UCSC students and keep your profile up to date so recommendations match your interests.</p>

                        <div className="mt-4 flex flex-col gap-2">
                            <a href="/opportunities" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-center">Browse Opportunities</a>
                            <a href="/profile" className="inline-block border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-center">Edit your profile</a>
                        </div>
                    </div>

                    {/* Middle: saved opportunities list (active) */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium">Saved opportunities</h3>
                        <p className="text-sm text-muted-foreground mt-1">Active opportunities you've saved</p>

                        <div className="mt-4 space-y-3">
                            {/* Client component that shows saved list and opens the shared modal */}
                            <SavedOpportunitiesList initial={activeSaved} />
                        </div>
                    </div>

                    {/* Right: personal stats */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium">Your activity</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div className="p-4 bg-gray-50 rounded-md">
                                <div className="text-sm text-muted-foreground">Applications marked as applied</div>
                                <div className="text-2xl font-bold mt-2">{appliedCount}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md">
                                <div className="text-sm text-muted-foreground">Active saved opportunities</div>
                                <div className="text-2xl font-bold mt-2">{activeSaved.length}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">What you can do</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">🔍</div>
                            <h3 className="mt-3 font-medium">Discover Opportunities</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Search and browse curated campus positions, events, and research openings. Filter by deadline or tags by hearting the opportunity.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">💾</div>
                            <h3 className="mt-3 font-medium">Save & Track</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Save postings you like, mark them as applied, and keep everything organized in one place.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">🌱</div>
                            <h3 className="mt-3 font-medium">Grow using SlugIn</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Connect with opportunities that help you develop skills and advance your career.</p>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="mt-8 bg-white/80 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3">
                            <div className="text-2xl font-bold">1</div>
                            <div className="mt-2">Create an account and complete your profile so suggestions match your interests.</div>
                        </div>
                        <div className="p-3">
                            <div className="text-2xl font-bold">2</div>
                            <div className="mt-2">Browse listings, save the ones you like, and mark as applied to track your progress.</div>
                        </div>
                        <div className="p-3">
                            <div className="text-2xl font-bold">3</div>
                            <div className="mt-2">Manage opportunities from your dashboard.</div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <section className="mt-10 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">Ready to get started?</p>
                    <div className="flex justify-center gap-4">
                        <a href="/opportunities" className="bg-blue-600 text-white px-5 py-3 rounded-md">Browse Opportunities</a>
                    </div>
                </section>
            </main>
        </div>
    )
}