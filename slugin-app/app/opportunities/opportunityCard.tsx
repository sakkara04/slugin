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
import { Label } from '@/components/ui/label'

type Opportunity = {
  id: string
  title: string
  description: string
  professor: string
  application_link?: string
  deadline: Date
  status: string
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
  const currentDate = new Date();
  const active = (opportunity.status === 'Active');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{opportunity.title}</CardTitle>
        <CardDescription>{opportunity.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <strong>Professor:</strong> {opportunity.professor}
        </p>
        {opportunity.application_link && (
          <a
            href={opportunity.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue underline hover:text-dark-blue transition"
          >
            Apply Here
          </a>
        )}
        {user && (
          <Button onClick={handleApply} disabled={applied}>
            {applied ? 'Applied' : 'Mark Applied'}
          </Button>
        )}
        <Label>{active ? 'Active' : 'Expired' }</Label>
      </CardContent>
    </Card>
  )
}