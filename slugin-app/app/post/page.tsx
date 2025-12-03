// post opportunity page
// TO-DO:
// --> update ui

import { createClient } from "@/utils/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import UserOpportunitiesClient from '@/components/opportunities/UserOpportunitiesClient'
import PostOpportunityForm from "./postOpportunityForm";

export default async function PostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to signin if no user
  if (!user) {
    redirect('/signin')
  }

  // Redirect to email verification if email is not confirmed
  if (user && !user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
  }

  // Fetch opportunities created by the current authenticated user, newest first
  let userOpportunities: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user opportunities:", error);
    } else if (data) {
      userOpportunities = data;
    }
  }

  return (
    <div>
      <Navbar user={user}/>
      <div style={{ display: 'flex', gap: 24, padding: '24px' }}>
        <div style={{ width: '50%' }}>
          <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post an Opportunity</CardTitle>
          <CardDescription>
            Create a job posting to recruit new members for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
         <PostOpportunityForm/>
        </CardContent>
  </Card>
          </div>
        </div>

        <div style={{ width: '50%' }}>
          <h2 className="text-xl mb-4">Your Opportunities</h2>
          {/* Client-side list + edit modal */}
          <UserOpportunitiesClient initial={userOpportunities} />
        </div>
      </div>
    </div>
  );
}
