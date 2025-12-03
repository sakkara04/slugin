// home page --> to be finished

import Navbar from "@/components/ui/navbar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SavedOpportunitiesList from '@/components/opportunities/SavedOpportunitiesList'
import UserOpportunitiesClient from '@/components/opportunities/UserOpportunitiesClient'

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
    // OMITTED: email verification doesn't work
    /*if (user && !user.email_confirmed_at) {
        redirect(`/verify-email?email=${encodeURIComponent(user.email || '')}`)
    }*/

    const first_name = (user as any)?.user_metadata?.first_name || 'there';

    // fetch profile to see if user can post (faculty)
    const { data: profile } = await supabase
        .from('profiles')
        .select('can_post')
        .eq('id', user.id)
        .single();

    const isFaculty = !!profile?.can_post;

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
    if (!isFaculty && savedIds.length > 0) {
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

        // For faculty: fetch opportunities posted by this user
    let userPostedOpps: any[] = [];
    let userActiveCount = 0;
    let userTotalCount = 0;
    if (isFaculty) {
      const { data: posted } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      userPostedOpps = posted || [];
      userTotalCount = userPostedOpps.length;
      userActiveCount = userPostedOpps.filter((o: any) => {
        if (!o.deadline) return true;
        const d = new Date(o.deadline);
        return d >= new Date(today.toDateString());
      }).length;
    }
        const userPostedActive = userPostedOpps.filter((o: any) => {
            if (!o.deadline) return true;
            const d = new Date(o.deadline);
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

    // count faculty (profiles with can_post = true)
    const { count: facultyCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: false })
        .eq('can_post', true);

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
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-center items-center">
                                    <div className="bg-white rounded-md p-3 shadow-sm flex flex-col items-center justify-center h-28">
                                        <div className="text-2xl font-bold">{activePostsCount ?? 0}</div>
                                        <div className="text-xs text-muted-foreground">Active posts</div>
                                    </div>
                                    <div className="bg-white rounded-md p-3 shadow-sm flex flex-col items-center justify-center h-28">
                                        <div className="text-2xl font-bold">{usersCount ?? 0}</div>
                                        <div className="text-xs text-muted-foreground">Users</div>
                                    </div>
                                    <div className="bg-white rounded-md p-3 shadow-sm flex flex-col items-center justify-center h-28">
                                        <div className="text-2xl font-bold">{facultyCount ?? 0}</div>
                                        <div className="text-xs text-muted-foreground">Faculty</div>
                                    </div>
                                    <div className="bg-white rounded-md p-3 shadow-sm flex flex-col items-center justify-center h-28">
                                        {/* make wrapper a flex center so the image stays centered regardless of box width */}
                                        <div className="flex items-center justify-center w-full h-full">
                                            <img src="/images/banana_slug.png" alt="Banana slug" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="text-xs text-muted-foreground">Meet Slugi!</div>
                                    </div>
                                </div>
                    </div>
                </section>
                                {/* Role-specific section: students vs faculty */}
                                {!isFaculty ? (
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
                                ) : (
                                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: actions for faculty */}
                                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                                        <h3 className="text-lg font-medium">For Faculty</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">Post opportunities for students and manage your postings from here.</p>

                                        <div className="mt-4 flex flex-col gap-2">
                                            <a href="/post" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-center">Post Opportunity</a>
                                            <a href="/profile" className="inline-block border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-center">Edit your profile</a>
                                        </div>
                                    </div>

                                    {/* Middle: posted opportunities list (active) */}
                                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                                        <h3 className="text-lg font-medium">Your posted opportunities</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Active opportunities you've posted</p>

                                        <div className="mt-4 space-y-3">
                                            <UserOpportunitiesClient initial={userPostedActive} />
                                        </div>
                                    </div>

                                    {/* Right: faculty stats */}
                                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm">
                                        <h3 className="text-lg font-medium">Your activity</h3>
                                        <div className="mt-4 grid grid-cols-1 gap-3">
                                            <div className="p-4 bg-gray-50 rounded-md">
                                                <div className="text-sm text-muted-foreground">Active opportunities</div>
                                                <div className="text-2xl font-bold mt-2">{userActiveCount}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-md">
                                                <div className="text-sm text-muted-foreground">All-time opportunities posted</div>
                                                <div className="text-2xl font-bold mt-2">{userTotalCount}</div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                )}

                {/* Features / How it works — tailored by role */}
                {!isFaculty ? (
                <>
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
                </>
                ) : (
                <>
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">What you can do</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">✍️</div>
                            <h3 className="mt-3 font-medium">Post Opportunities</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Create detailed postings with application links or contact emails so students can apply directly.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">🛠️</div>
                            <h3 className="mt-3 font-medium">Manage & Edit</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Edit, update or remove your postings. Use the dashboard to keep openings current and highlight urgent roles.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-3xl">📬</div>
                            <h3 className="mt-3 font-medium">Receive Applications</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Students will apply via the link you provide or contact you by the email in the posting — review and manage replies in your own workflow.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 bg-white/80 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3">
                            <div className="text-2xl font-bold">1</div>
                            <div className="mt-2">Complete your profile so students can find your postings and contact information.</div>
                        </div>
                        <div className="p-3">
                            <div className="text-2xl font-bold">2</div>
                            <div className="mt-2">Post an opportunity and include an application link or contact email — students will apply directly using that information.</div>
                        </div>
                        <div className="p-3">
                            <div className="text-2xl font-bold">3</div>
                            <div className="mt-2">Manage your postings from the dashboard. Edit details, update deadlines, or remove filled roles. Applicants will contact you via the method you specified (link or email).</div>
                        </div>
                    </div>
                </section>
                </>
                )}

                                {/* Footer */}
                                <section className="mt-10 text-center">
                                        <p className="mb-4 text-sm text-muted-foreground">Ready to get started?</p>
                                        <div className="flex justify-center gap-4">
                                                {isFaculty ? (
                                                    <a href="/post" className="bg-blue-600 text-white px-5 py-3 rounded-md">Post Opportunities</a>
                                                ) : (
                                                    <a href="/opportunities" className="bg-blue-600 text-white px-5 py-3 rounded-md">Browse Opportunities</a>
                                                )}
                                        </div>
                                </section>
            </main>
        </div>
    )
}