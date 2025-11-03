'use client'

import React, { useState } from 'react'
import Majors from './majors'
import Industries from './industries'
import { createClient } from '../../utils/supabase/client'

const supabase = createClient()

const majorsList = Majors
const industryList = Industries

const Page = () => {
  const [firstName, setFirstName] = useState('')
  const [preferredName, setPreferredName] = useState('')
  const [lastName, setLastName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [major, setMajor] = useState('')
  const [minor, setMinor] = useState('')
  const [year, setYear] = useState('')
  const [industry, setIndustry] = useState('')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Profile Page</h1>
      <section className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block font-medium mb-1">Name (required)</label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="preferredName" className="block font-medium mb-1">Preferred name</label>
          <input
            id="preferredName"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="Preferred name"
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block font-medium mb-1">Last name (required)</label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="input w-full"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <strong>Current values:</strong> {firstName} {lastName}
        </div>

        <hr className="border-border" />

        <div>
          <label htmlFor="pronouns" className="block font-medium mb-1">Pronouns (required)</label>
          <input
            id="pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g. she/her, they/them"
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium mb-1">Email (UCSC) (required)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@ucsc.edu"
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block font-medium mb-1">Biography (optional)</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a little about yourself"
            rows={4}
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="major" className="block font-medium mb-1">Major (required)</label>
          <select
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="input w-full"
          >
            <option value="">-- Select major --</option>
            {majorsList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="minor" className="block font-medium mb-1">Minor</label>
          <select
            id="minor"
            value={minor}
            onChange={(e) => setMinor(e.target.value)}
            className="input w-full"
          >
            <option value="">-- Select minor --</option>
            <option value="none">None</option>
            {majorsList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block font-medium mb-1">Year in college (required)</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input w-full"
          >
            <option value="">-- Select year --</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </div>

        <div>
          <label htmlFor="industry" className="block font-medium mb-1">Preferred industry</label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input w-full"
          >
            <option value="">-- Select industry --</option>
            {industryList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            onClick={async () => {
              const missing: string[] = []
              if (!firstName.trim()) missing.push('First name')
              if (!lastName.trim()) missing.push('Last name')
              if (!pronouns.trim()) missing.push('Pronouns')
              if (!email.trim()) missing.push('Email')
              if (!major) missing.push('Major')
              if (!year) missing.push('Year')

              if (missing.length > 0) {
                alert('Please fill the required fields: ' + missing.join(', '))
                return
              }

              const saved = {
                firstName,
                preferredName,
                lastName,
                pronouns,
                email,
                bio,
                major,
                minor,
                year,
                industry,
              }

              const { error } = await supabase.from('profiles').upsert(saved)

              if (error) {
                alert('Error saving profile: ' + error.message)
              } else {
                alert('Profile saved successfully!')
              }
            }}
            className="button"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  )
}

export default Page
