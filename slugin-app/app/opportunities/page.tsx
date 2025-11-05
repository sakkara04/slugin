'use client'

import OpportunityCard from './opportunityCard'
import { createClient } from '@/utils/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
const supabase = createClient();
const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
/*const mockOpportunities = [
  {
    id: 'abc123',
    title: 'Join the AI Research Lab',
    description: 'Work on cutting-edge machine learning projects with UCSC faculty.',
    deadline: "Nov 4th",
    location: "sc",
    categories: "cs, ce",
    listedBy: 'Dr. Nguyen',
    application_link: 'Apply here',
  },
  {
    id: 'def456',
    title: 'Environmental Action Club',
    description: 'Help organize campus events and advocate for sustainability.',
    deadline: "Nov 4th",
    location: "sc",
    categories: "cs, ce",
    listedBy: 'Dr. Nguyen',
    application_link: 'Apply here',
  },
]
*/
export default function OpportunitiesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Available Opportunities</CardTitle>
          <CardDescription>
            Browse and mark opportunities you’ve applied to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}