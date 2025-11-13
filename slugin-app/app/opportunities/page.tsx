'use client'

import { Button } from '@/components/ui/button'
import OpportunityCard from './opportunityCard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from 'react'

const mockOpportunities = [
  {
    id: 'abc123',
    title: 'Join the AI Research Lab',
    description: 'Work on cutting-edge machine learning projects with UCSC faculty.',
    professor: 'Dr. Nguyen',
    application_link: 'Apply here',
  },
  {
    id: 'def456',
    title: 'Environmental Action Club',
    description: 'Help organize campus events and advocate for sustainability.',
    professor: 'Prof. Martinez',
    application_link: 'Apply here',
  },
]

export default function OpportunitiesPage() {
  const [position, setPosition] = React.useState("")

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className = "flex justify-between">
          <CardTitle className="text-2xl">Available Opportunities</CardTitle>
          <Button>
          <DropdownMenu>
              <DropdownMenuTrigger>Sort By ↓</DropdownMenuTrigger>
              <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
              <DropdownMenuContent>
                <DropdownMenuItem>Most recently posted</DropdownMenuItem>
                <DropdownMenuItem>Oldest Posting</DropdownMenuItem>
                <DropdownMenuItem>Oldest Due Date</DropdownMenuItem>
                <DropdownMenuItem>Newest Due Date</DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenuRadioGroup>
            </DropdownMenu>
          </Button>
          </div>
          <CardDescription>
            Browse and mark opportunities you've applied to
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