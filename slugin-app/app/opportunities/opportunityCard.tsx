'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

type Opportunity = {
  id: any
  title?: string
  description?: string
  deadline?: string
  location?: string
  categories?: string
  listedBy?: string
  application_link?: string | undefined
}

type Props = {
  opportunity: Opportunity
}

export default function OpportunityCard({ opportunity }: Props) {
  const user = useUser()
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
          <strong>Listed By:</strong> {opportunity.listedBy}
        </p>
        <p>
          {opportunity.application_link && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-blue underline hover:text-dark-blue transition"
          >
            View Flyer Here
          </a>
        )}
        </p>
        {opportunity.application_link && (
          <a
            href={opportunity.application_link}
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
      </CardContent>
    </Card>
  )
}