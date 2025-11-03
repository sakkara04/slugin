"use client"
import React, { useState } from 'react'
import Majors from './majors'
import Industries from './industries'
import { createClient } from '../../utils/supabase/client'

const supabase = createClient()

const majorsList = Majors; 
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
    <div>
      <h1>Profile Page</h1>
      <section>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="firstName">Name (required)</label>
          <br />
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="preferredName">Preferred name</label>
          <br />
          <input
            id="preferredName"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="Preferred name"
            className="input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="lastName">Last name (required)</label>
          <br />
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="input"
          />
        </div>

        <div>
          <strong>Current values:</strong>
          <p>{firstName} {lastName}</p>
        </div>
        <hr style={{ margin: '16px 0' }} />

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="pronouns">Pronouns (required)</label>
          <br />
          <input
            id="pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g. she/her, they/them"
            className="input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email (UCSC) (required)</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@ucsc.edu"
            className="input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="bio">Biography (optional)</label>
          <br />
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a little about yourself"
            rows={4}
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="major">Major (required)</label>
          <br />
          <select
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="input"
          >
            <option value="">-- Select major --</option>
            {majorsList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="minor">Minor</label>
          <br />
          <select
            id="minor"
            value={minor}
            onChange={(e) => setMinor(e.target.value)}
            className="input"
          >
            <option value="">-- Select minor --</option>
            <option value="none">None</option>
            {majorsList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="year">Year in college (required)</label>
          <br />
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input"
          >
            <option value="">-- Select year --</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="major">Preferred industry</label>
          <br />
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input"
          >
            <option value="">-- Select industry --</option>
            {industryList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={async() => {
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
              const { data, error } = await supabase
                .from('profiles')
                .upsert(saved)

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
