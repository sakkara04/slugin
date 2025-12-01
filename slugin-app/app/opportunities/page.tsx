"use client";

import React, { useEffect, useState } from 'react'
import Navbar from "@/components/ui/navbar";
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import {
  CardDescription,
} from "@/components/ui/card";
import OpportunityCard from '@/components/opportunities/OpportunitiesCard'
// Card UI is rendered by OpportunityCard component
import { Button } from '@/components/ui/button'
import { Heart, Check, ExternalLink } from 'lucide-react'

type Opportunity = {
  id: string
  title: string
  description?: string
  fullDescription?: string
  location?: string
  categories?: string
  link?: string
  file?: string | null
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [applied, setApplied] = useState<Record<string, boolean>>({})
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [triedSignedFor, setTriedSignedFor] = useState<Record<string, boolean>>({})
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading opportunities', error)
          return
        }

        if (mounted && data) {
          // Resolve stored file paths to usable URLs. If the `file` field is
          // already an absolute URL (starts with http) we keep it. Otherwise
          // try to get a public URL from the `flyers` storage bucket.
          const resolved = await Promise.all(
            (data as Opportunity[]).map(async (row) => {
              const copy = { ...row }
              if (copy.file && !copy.file.startsWith('http')) {
                try {
                  const { data: publicData } = supabase.storage.from('flyers').getPublicUrl(copy.file)
                  if (publicData?.publicUrl) {
                    copy.file = publicData.publicUrl
                  }
                } catch (err) {
                  console.error('Error resolving file URL for', copy.file, err)
                }
              }
              return copy
            })
          )

          setOpps(resolved)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Available Opportunities</h1>
            <CardDescription>Browse and mark opportunities you’ve applied to</CardDescription>
          </header>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              {filterTag && (
                <div className="mb-4 text-sm">
                  Showing events like "{filterTag}" — <button className="underline" onClick={() => setFilterTag(null)}>Clear filter</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opps
                  .filter((o) => {
                    if (!filterTag) return true
                    const cats = (o.categories || '').toLowerCase()
                    return cats.includes(filterTag.toLowerCase())
                  })
                  .map((o) => {
                    const isApplied = Boolean(applied[o.id])

                    return (
                      <OpportunityCard
                        key={o.id}
                        opp={o}
                        isApplied={isApplied}
                        currentFilterTag={filterTag}
                        onSelect={(item) => setSelected(item)}
                        onToggleApplied={(id) => setApplied(prev => ({ ...prev, [id]: !prev[id] }))}
                        onFilterTag={(tag) => setFilterTag(tag)}
                      />
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-3xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
            {/* Header: title left, close right */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">{selected.title}</h2>
              <button className="text-sm text-muted-foreground" onClick={() => setSelected(null)}>Close</button>
            </div>

            {/* Location under title */}
            {selected.location && <div className="text-sm text-muted-foreground mb-4">Location: {selected.location}</div>}

            {/* Centered preview (or placeholder) */}
            <div className="w-full flex justify-center mb-6">
              {selected.file ? (
                <img
                  src={selected.file}
                  alt={selected.title}
                  className="w-full max-w-lg h-auto object-contain rounded bg-gray-50"
                  onError={async () => {
                    if (!selected) return
                    if (triedSignedFor[selected.id]) return
                    try {
                      const url = selected.file || ''
                      const m = url.match(/\/flyers\/(.*)$/)
                      const path = m ? decodeURIComponent(m[1]) : null
                      if (!path) return
                      setTriedSignedFor(prev => ({ ...prev, [selected.id]: true }))
                      const res = await fetch('/api/storage/signed-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path }),
                      })
                      const json = await res.json()
                      if (json?.success && json.signedUrl) {
                        setSelected({ ...selected, file: json.signedUrl })
                      }
                    } catch (err) {
                      console.error('Error attempting signed-url fallback', err)
                    }
                  }}
                />
              ) : (
                <div className="w-full max-w-lg bg-gray-50 rounded-md p-8 text-center text-muted-foreground">No preview available</div>
              )}
            </div>

            {/* Avatar + description */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">CS</div>
              <p className="text-base">{selected.fullDescription || selected.description || 'No additional details provided.'}</p>
            </div>

            {/* Actions row: open application, mark applied */}
            <div className="flex items-center gap-4 mb-4">
                {selected.link && (
                  <div>
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation()
                      const url = selected.link || ''
                      if (url.startsWith('mailto:')) {
                        const email = url.replace(/^mailto:/, '')
                        try {
                          navigator.clipboard.writeText(email)
                          setCopiedEmail(email)
                          setTimeout(() => setCopiedEmail(null), 2000)
                        } catch (err) {
                          console.error('Clipboard write failed', err)
                        }
                      } else {
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }
                    }}>
                      <ExternalLink size={14} />
                      <span className="ml-2">{(selected.link || '').startsWith('mailto:') ? 'Copy email' : 'Open application'}</span>
                    </Button>
                    {copiedEmail && <div className="text-sm text-success mt-2">Email copied to clipboard!</div>}
                  </div>
                )}

              <Button variant={applied[selected.id] ? 'secondary' : 'outline'} onClick={() => setApplied(prev => ({ ...prev, [selected.id]: !prev[selected.id] }))}>
                <Check size={14} />
                <span className="ml-2">{applied[selected.id] ? 'Unmark as applied' : 'Mark as applied'}</span>
              </Button>
            </div>

            {/* Show more like this: fixed position below actions, left-aligned */}
            <div className="mt-2">
              <button className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => {
                const primaryTag = (selected.categories || '').split(',')[0]?.trim() || null
                setFilterTag(prev => prev === primaryTag ? null : primaryTag)
                setSelected(null)
              }}>
                <Heart size={16} />
                <span>Show more like this</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
