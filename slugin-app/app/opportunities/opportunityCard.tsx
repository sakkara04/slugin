'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useUser } from '@supabase/auth-helpers-react'

type Opportunity = {
  id: string
  title: string
  description: String
  professor: string
  application_link?: string
}

type Props = {
  opportunity: Opportunity
}

export default function OpportunityCard({ opportunity }: Props) {
  const user = useUser()
  const [applied, setApplied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)
        .single()

      if (data) setApplied(true)
    }

    checkApplicationStatus()
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
    <div className="card">
      <h3>{opportunity.title}</h3>
      <p>{opportunity.description}</p>
      <p><strong>Professor:</strong> {opportunity.professor}</p>
      {opportunity.application_link && (
        <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer">
          Apply Here
        </a>
      )}
      {user && (
        <button onClick={handleApply} disabled={applied}>
          {applied ? 'Applied' : 'Mark Applied'}
        </button>
      )}
    </div>
  )
}
