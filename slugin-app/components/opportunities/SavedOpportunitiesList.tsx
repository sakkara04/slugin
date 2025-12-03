"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ExternalLink } from 'lucide-react'
import OpportunityModal from './OpportunityModal'

type Opportunity = {
  id: number | string
  title: string
  description?: string
  fullDescription?: string
  location?: string
  categories?: string
  link?: string
  file?: string | null
  deadline?: string | null
}

export default function SavedOpportunitiesList({ initial }: { initial: Opportunity[] }) {
  const [items] = useState<Opportunity[]>(initial || [])
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({})

  const open = (o: Opportunity) => setSelected(o)
  const close = () => setSelected(null)

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">You haven't saved any active opportunities yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{o.title}</div>
                  <div className="text-xs text-muted-foreground">Expires: {o.deadline ? new Date(o.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No expiry'}</div>
                </div>
                <div>
                  <Button size="sm" variant="ghost" onClick={() => open(o)}>View</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <OpportunityModal
          opp={selected}
          isApplied={Boolean(appliedMap[String(selected.id)])}
          isSaved={false}
          isLiked={false}
          onClose={close}
          onAppliedChange={(id, val) => setAppliedMap(prev => ({ ...prev, [String(id)]: val }))}
          onSavedChange={() => {}}
          onLikedChange={() => {}}
          onFilterTag={() => {}}
        />
      )}
    </div>
  )
}
