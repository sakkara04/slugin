// post opportunity page

import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { postOpportunityAction } from "./actions";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import UserOpportunitiesClient from "@/components/opportunities/UserOpportunitiesClient";

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
      <Navbar />
      <div style={{ display: "flex", gap: 24, padding: "24px" }}>
        <div style={{ width: "50%" }}>
          <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Post an Opportunity</CardTitle>
                <CardDescription>
                  Create a job posting to recruit new members for your
                  organization
                </CardDescription>
              </CardHeader>
              {/* Post Opportunity Form */}
              <CardContent>
                <form action={postOpportunityAction}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="title">Title *</FieldLabel>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g., Research Assistant Position"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="description">
                        Description *
                      </FieldLabel>
                      <textarea
                        id="description"
                        name="description"
                        rows={6}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        placeholder="Describe the opportunity, requirements, and responsibilities..."
                        required
                      />
                      <FieldDescription>
                        Provide a detailed description of the opportunity
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="deadline">
                        Deadline/Expiry Date *
                      </FieldLabel>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        required
                      />
                      <FieldDescription>
                        Select when this opportunity expires
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="location">Location *</FieldLabel>
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="e.g., UCSC Campus, Remote, Hybrid"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="categories">
                        Categories/Tags *
                      </FieldLabel>
                      <Input
                        id="categories"
                        name="categories"
                        type="text"
                        placeholder="e.g., Computer Science, Computer Engineering, Biology"
                        required
                      />
                      <FieldDescription>
                        Enter categories separated by commas (e.g., comp sci,
                        comp eng, biotech)
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="link">
                        Application link or contact email *
                      </FieldLabel>
                      <Input
                        id="link"
                        name="link"
                        type="text"
                        placeholder="Paste an application URL or a contact email (e.g. https://example.com/apply or jane@example.com)"
                        required
                      />
                      <FieldDescription>
                        Provide an application URL OR a contact email address.
                        We will accept either; emails will be converted to a
                        mailto: link so applicants can email the contact.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="file">
                        Flyer/Picture (Optional)
                      </FieldLabel>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/*,.pdf"
                      />
                      <FieldDescription>
                        Upload a flyer or picture for this opportunity
                      </FieldDescription>
                    </Field>

                    <Field>
                      <Button type="submit">Post Opportunity</Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Your Opportunities Section */}
        <div style={{ width: "50%" }}>
          <h2 className="text-xl mb-4">Your Opportunities</h2>
          {/* Client-side list + edit modal */}
          <UserOpportunitiesClient initial={userOpportunities} />
        </div>
      </div>
    </div>
  );
}
