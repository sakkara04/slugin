'use client'

import OpportunityCard from './opportunityCard'

const mockOpportunities = [
  {
    id: 'abc123',
    title: 'Join the AI Research Lab',
    description: 'Work on cutting-edge machine learning projects with UCSC faculty.',
    professor: 'Dr. Nguyen',
    application_link: 'mailto:nguyen@ucsc.edu',
  },
  {
    id: 'def456',
    title: 'Environmental Action Club',
    description: 'Help organize campus events and advocate for sustainability.',
    professor: 'Prof. Martinez',
    application_link: 'https://forms.gle/example',
  },
]

export default function OpportunitiesPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Available Opportunities</h1>
      {mockOpportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </main>
  )
}
