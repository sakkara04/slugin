"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Check, Heart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { upsertUserInteraction, deleteUserInteraction } from '@/utils/supabase/interactions'

type Props = {
  opp: any
  isApplied?: boolean
  isSaved?: boolean
  isLiked?: boolean
  onClose: () => void
  onAppliedChange?: (id: string, val: boolean) => void
  onSavedChange?: (id: string, val: boolean) => void
  onLikedChange?: (id: string, val: boolean) => void
  onFilterTag?: (tag: string | null) => void
}

export default function OpportunityModal({ opp, isApplied = false, isSaved = false, isLiked = false, onClose, onAppliedChange, onSavedChange, onLikedChange, onFilterTag }: Props) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [triedSignedFor, setTriedSignedFor] = useState<Record<string, boolean>>({})

  const handleApplyToggle = async () => {
    const next = !isApplied
    // optimistic parent update
    onAppliedChange?.(opp.id, next)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (next) await upsertUserInteraction(user.id, opp.id, 'applied')
      else await deleteUserInteraction(user.id, opp.id)
      // clear saved/liked in parent when applied
      onSavedChange?.(opp.id, false)
      onLikedChange?.(opp.id, false)
    } catch (err) {
      console.error('Failed to update applied interaction from modal', err)
      // revert optimistic
      onAppliedChange?.(opp.id, !next)
    }
  }

  const handleLikeFromModal = async () => {
    const primaryTag = (opp.categories || '').split(',')[0]?.trim() || null
    onFilterTag?.(primaryTag)
    onClose()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await upsertUserInteraction(user.id, opp.id, 'liked')
      onSavedChange?.(opp.id, false)
      onAppliedChange?.(opp.id, false)
      onLikedChange?.(opp.id, true)
    } catch (err) {
      console.error('Failed to upsert liked interaction from modal', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-3xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">{opp.title}</h2>
          <button className="text-sm text-muted-foreground" onClick={onClose}>Close</button>
        </div>

        {opp.location && (
          <div className="text-sm text-muted-foreground mb-4">
            <div>Location: {opp.location}</div>
            <div className="mt-1">Opportunity Closes: {opp.deadline ? new Date(opp.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No expiry'}</div>
          </div>
        )}

        <div className="w-full flex justify-center mb-6">
          {opp.file ? (
            <img
              src={opp.file}
              alt={opp.title}
              className="w-full max-w-lg h-auto object-contain rounded bg-gray-50"
              onError={async () => {
                if (!opp) return
                if (triedSignedFor[opp.id]) return
                try {
                  const url = opp.file || ''
                  const m = url.match(/\/flyers\/(.*)$/)
                  const path = m ? decodeURIComponent(m[1]) : null
                  if (!path) return
                  setTriedSignedFor(prev => ({ ...prev, [opp.id]: true }))
                  const res = await fetch('/api/storage/signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path }),
                  })
                  const json = await res.json()
                  if (json?.success && json.signedUrl) {
                    // replace src by directly mutating opp (parent likely uses reference)
                    opp.file = json.signedUrl
                  }
                } catch (err) {
                  console.error('Error attempting signed-url fallback', err)
                }
              }}
            />
          ) : (
            <div className="w-full max-w-lg bg-gray-50 rounded-md p-8 text-center text-muted-foreground">
              No preview available
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">CS</div>
          <p className="text-base">{opp.fullDescription || opp.description || 'No additional details provided.'}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {opp.link && (
            <div>
              <Button size="sm" onClick={(e) => {
                e.stopPropagation()
                const url = opp.link || ''
                if (url.startsWith('mailto:')) {
                  const email = url.replace(/^mailto:/, '')
                  try { navigator.clipboard.writeText(email); setCopiedEmail(email); setTimeout(() => setCopiedEmail(null), 2000) } catch (err) { console.error('Clipboard write failed', err) }
                } else {
                  window.open(url, '_blank', 'noopener,noreferrer')
                }
              }}>
                <ExternalLink size={14} />
                <span className="ml-2">{(opp.link || '').startsWith('mailto:') ? 'Copy email' : 'Open application'}</span>
              </Button>
              {copiedEmail && (<div className="text-sm text-success mt-2">Email copied to clipboard!</div>)}
            </div>
          )}

          <Button variant={isApplied ? 'secondary' : 'outline'} onClick={handleApplyToggle}>
            <Check size={14} />
            <span className="ml-2">{isApplied ? 'Unmark as applied' : 'Mark as applied'}</span>
          </Button>
        </div>

        <div className="mt-2">
          <button className="flex items-center gap-2 text-sm text-muted-foreground" onClick={handleLikeFromModal}>
            <Heart size={16} />
            <span>Show more like this</span>
          </button>
        </div>
      </div>
    </div>
  )
}
