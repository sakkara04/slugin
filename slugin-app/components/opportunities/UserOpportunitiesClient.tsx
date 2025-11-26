"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Opportunity = {
  id: string
  title: string
  description?: string
  deadline?: string | null
  location?: string
  categories?: string
}

export default function UserOpportunitiesClient({ initial }: { initial: Opportunity[] }) {
  const [opps, setOpps] = useState<Opportunity[]>(initial || [])
  const [editing, setEditing] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(false)

  // form state mirrors the post form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '')
      setDescription(editing.description || '')
      setDeadline(editing.deadline ? editing.deadline.slice(0,10) : '')
      setLocation(editing.location || '')
      setCategories(editing.categories || '')
    }
  }, [editing])

  const openEdit = (opp: Opportunity) => setEditing(opp)
  const closeEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return
    setLoading(true)
    try {
      const res = await fetch('/api/opportunities/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title, description, deadline: deadline || null, location, categories }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Update failed')
      const updated = json.data
      setOpps((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      closeEdit()
    } catch (err: any) {
      alert('Error updating opportunity: ' + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {opps.length === 0 ? (
        <p>No opportunities posted yet.</p>
      ) : (
        opps.map((opp) => {
          const deadlineDate = opp.deadline ? new Date(opp.deadline) : null
          const formatted = deadlineDate
            ? deadlineDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : '—'

            // Calculate days left
            const daysLeft = deadlineDate
              ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null

          return (
            <Card key={opp.id} className="mb-4">
              <CardHeader>
                <CardTitle>
                  {opp.title}
                  {daysLeft === 2 && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Expiring Soon
                    </span>
                    )}
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>Expires: {formatted}</div>
                  <div>
                    <Button variant="ghost" onClick={() => openEdit(opp)}>Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ background: 'white', padding: 20, width: '90%', maxWidth: 800, borderRadius: 8 }}>
            <h3 className="text-xl mb-4">Edit Opportunity</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />

              <label>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />

              <label>Deadline</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mb-2" />

              <label>Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mb-2" />

              <label>Categories</label>
              <Input value={categories} onChange={(e) => setCategories(e.target.value)} className="mb-2" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <div>
                <Button variant="destructive" onClick={async () => {
                  if (!editing) return
                  const ok = confirm('Delete this opportunity? This cannot be undone.')
                  if (!ok) return
                  try {
                    setLoading(true)
                    const res = await fetch('/api/opportunities/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: editing.id }),
                    })
                    const j = await res.json()
                    if (!res.ok) throw new Error(j?.error || 'Delete failed')
                    setOpps((prev) => prev.filter((o) => o.id !== editing.id))
                    closeEdit()
                  } catch (err: any) {
                    alert('Error deleting opportunity: ' + (err?.message || String(err)))
                  } finally {
                    setLoading(false)
                  }
                }} disabled={loading}>Delete</Button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="ghost" onClick={closeEdit} disabled={loading}>Cancel</Button>
                <Button onClick={saveEdit} disabled={loading}>{loading ? 'Saving...' : 'Save Edit'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
