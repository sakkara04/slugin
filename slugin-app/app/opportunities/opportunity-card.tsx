'use client'

// individual opportunity card
// TO-DO:
// --> implement modal to display more info when clicked
// --> update ui

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UUID } from 'crypto'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

type Opportunity = {
  id: any
  title?: string
  description?: string
  link?: string
  deadline?: string
  location?: string
  categories?: string
  user_id?: UUID
  status: string
  profiles: {
    first_name: string
  }
}

type Props = {
  opportunity: Opportunity
  user: User | null
}

export default function OpportunityCard({ opportunity, user }: Props) {
  const supabase = createClient()

  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)
        .single()

      if (data) setApplied(true)
    }

    checkStatus()
  }, [user, opportunity.id])

  const handleApply = async () => {
    if (!user) return

    const { error } = await supabase
      .from('applications')
      .upsert({
        user_id: user.id,
        opportunity_id: opportunity.id,
        status: 'applied',
        applied_at: new Date().toISOString(),
      })

    if (!error) setApplied(true)
  }

  const active = opportunity.status === 'Active'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{opportunity.title}</CardTitle>
        <CardDescription>{opportunity.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* catgeory, file upload */}
        <p className="text-sm">
          <strong>Deadline:</strong> {opportunity.deadline}
        </p>
        <p className="text-sm">
          <strong>Location:</strong> {opportunity.location}
        </p>
        <p className="text-sm">
          <strong>Listed By:</strong> {opportunity.profiles?.first_name ?? 'Unknown'}
        </p>
        {opportunity.link && (
          <a
            href={opportunity.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-blue underline hover:text-dark-blue transition"
          >
            Apply Here
          </a>
        )}
        {user && (
          <Button onClick={handleApply} disabled={applied}>
            {applied ? 'Applied' : 'Mark Applied'}
          </Button>
        )}
        <Label>{active ? 'Active' : 'Expired'}</Label>
      </CardContent>
    </Card>
  )
}
