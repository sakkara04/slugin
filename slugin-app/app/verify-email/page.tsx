// email verification page

import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already verified, redirect to home
  if (user?.email_confirmed_at) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col gap-6">
          <a href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-blue flex size-6 items-center justify-center rounded-md shadow-2xs">
              <Lightbulb size={18} color="#023047" />
            </div>
            SlugIn
          </a>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/home">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-blue flex size-6 items-center justify-center rounded-md shadow-2xs">
            <Lightbulb size={18} color="#023047" />
          </div>
          SlugIn
        </a>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to{" "}
              <span className="font-medium">{searchParams.email || user?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please check your email and click the verification link to activate your account.
              If you don't see the email, check your spam folder.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/signin">Back to Sign In</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
