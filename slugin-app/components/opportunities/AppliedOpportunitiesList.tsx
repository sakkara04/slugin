"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
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

export default function AppliedOpportunitiesList({ initial, count }: { initial: Opportunity[], count: number }) {
  const [items] = useState<Opportunity[]>(initial || [])
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [openList, setOpenList] = useState(false)

  const open = (o: Opportunity) => setSelected(o)
  const close = () => setSelected(null)

  return (
    <div>
      {/* Trigger: render as a button that looks like the numeric stat */}
      <div>
        {items.length === 0 ? (
          <div className="text-2xl font-bold mt-2">{count}</div>
        ) : (
          <Button variant="ghost" onClick={() => setOpenList(true)} className="text-2xl font-bold mt-2 p-0">
            {count}
          </Button>
        )}
      </div>

      {/* Modal: list of applied opportunities */}
      {openList && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-2xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Applied opportunities ({items.length})</h3>
              <button className="text-sm text-muted-foreground" onClick={() => setOpenList(false)}>Close</button>
            </div>

            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">You haven't marked any opportunities as applied.</div>
            ) : (
              <div className="space-y-3">
                {items.map((o) => (
                  <div key={o.id} className="border rounded-md p-3 flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{o.title}</div>
                      <div className="text-xs text-muted-foreground">Expires: {o.deadline ? new Date(o.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No expiry'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => open(o)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opportunity detail modal for a selected item */}
      {selected && (
        <OpportunityModal
          opp={selected}
          isApplied={true}
          isSaved={false}
          isLiked={false}
          onClose={close}
          onAppliedChange={() => {}}
          onSavedChange={() => {}}
          onLikedChange={() => {}}
          onFilterTag={() => {}}
        />
      )}
    </div>
  )
}
