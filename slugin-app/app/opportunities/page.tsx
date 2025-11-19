"use client";

import { useEffect, useState } from 'react';
import OpportunityCard from './opportunityCard'
import { createClient } from '@/utils/supabase/client'
import Navbar from "@/components/ui/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const mockOpportunities = [
  {
    id: 'abc123',
    title: 'Join the AI Research Lab',
    description: 'Work on cutting-edge machine learning projects with UCSC faculty.',
    professor: 'Dr. Nguyen',
    application_link: 'Apply here',
    deadline: '2025-12-31', //changed to string
    status: 'Active',
    location: 'Engineering 2',
    categories: 'Research',
    listedBy: 'Dr. Nguyen',
  },
  {
    id: 'def456',
    title: 'Environmental Action Club',
    description: 'Help organize campus events and advocate for sustainability.',
    professor: 'Prof. Martinez',
    application_link: 'Apply here',
    deadline: '2025-11-25', //changed to string
    status: 'Active',
    location: 'Earth & Marine Sciences',
    categories: 'Club',
    listedBy: 'Prof. Martinez',
  },
  {
    id: 'ghi789',
    title: 'Summer Research Program',
    description: 'Already expired opportunity for testing.',
    professor: 'Dr. Smith',
    application_link: 'Apply here',
    deadline: '2025-01-01', // Changed to string - this should not show now
    status: 'Archived',
    location: 'Baskin Engineering', // Added
    categories: 'Research', // Added
    listedBy: 'Dr. Smith', // Added
  },
]


// US 3.1 - Task 3: update status based on deadline
export default function OpportunitiesPage() {
  const currentDate = new Date()
  const updatedOpportunities = mockOpportunities.map(opp => ({
    ...opp,
    status: new Date(opp.deadline) < currentDate ? 'Archived' : 'Active' //converted string to date
  }))

  const activeOpportunities = updatedOpportunities.filter(
    opp => opp.status === 'Active'
  )

  return (
   <div>
    <Navbar />
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Available Opportunities</CardTitle>
          <CardDescription>
            Browse and mark opportunities you've applied to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </CardContent>
      </Card>
    </div>
   </div>
  );
}
