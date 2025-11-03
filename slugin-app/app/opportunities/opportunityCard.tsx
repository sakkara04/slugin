'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useUser } from '@supabase/auth-helpers-react'

type Opportunity = {
  id: string
  title: string
  description: string
  professor: string
  application_link?: string
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
    <div className="border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm space-y-4">
      <h3 className="text-xl font-semibold">{opportunity.title}</h3>
      <p className="text-muted-foreground">{opportunity.description}</p>
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
        <button
          onClick={handleApply}
          disabled={applied}
          className={`button ${applied ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {applied ? 'Applied' : 'Mark Applied'}
        </button>
      )}
    </div>
  )
}
