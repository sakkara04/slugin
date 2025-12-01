"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Check } from 'lucide-react'

export type Opportunity = {
	id: string
	title: string
	description?: string
	fullDescription?: string
	location?: string
	categories?: string
	link?: string
}

type Props = {
	opp: Opportunity
	isApplied?: boolean
	onSelect?: (opp: Opportunity) => void
	onToggleApplied?: (id: string) => void
	// current active filter (so the card can toggle on/off)
	currentFilterTag?: string | null
	// set the filter to a specific tag (or null to clear)
	onFilterTag?: (tag: string | null) => void
}

export default function OpportunityCard({ opp, isApplied = false, onSelect, onToggleApplied, onFilterTag, currentFilterTag }: Props) {
	const primaryTag = (opp.categories || '').split(',')[0]?.trim() || null
	const [copied, setCopied] = useState(false)

		return (
		<div
			key={opp.id}
			className="border rounded-md p-4 hover:shadow-md flex flex-col justify-between min-h-[200px] break-words bg-transparent"
			onClick={() => onSelect?.(opp)}
		>
			<div>
				<div className="flex justify-between items-start">
					<h3 className="text-lg font-semibold">{opp.title}</h3>
					{isApplied && <span className="text-sm text-success">Applied</span>}
				</div>

				<p className="text-sm text-muted-foreground mt-2">{opp.description ? (opp.description.length > 120 ? opp.description.slice(0, 117) + '...' : opp.description) : 'No description'}</p>
				{opp.location && <div className="text-xs text-muted-foreground mt-3">Location: {opp.location}</div>}
			</div>

			<div className="mt-4 grid grid-cols-2 gap-2 items-center">
				<div></div>
				<div className="flex justify-end">
					<Button variant={isApplied ? 'secondary' : 'outline'} size="sm" onClick={(e) => { e.stopPropagation(); onToggleApplied?.(opp.id) }}>
						<Check size={14} />
						<span className="ml-2">{isApplied ? 'Unmark' : 'Mark as Applied'}</span>
					</Button>
				</div>

										<div>
											<Button variant="ghost" size="sm" onClick={(e) => {
												e.stopPropagation();
												if (!primaryTag) return
												const next = currentFilterTag === primaryTag ? null : primaryTag
												onFilterTag?.(next)
											}}>
						<Heart size={14} />
						<span className="ml-2">Show more like this</span>
					</Button>
				</div>

						<div className="flex justify-end">
							{((opp as any).link || (opp as any).application_link) ? (
								(() => {
									const url = (opp as any).link || (opp as any).application_link
									const isMail = url?.toString().startsWith('mailto:')

									return (
										<Button size="sm" onClick={(e) => {
											e.stopPropagation()
											if (isMail) {
												try {
													const email = url.replace(/^mailto:/, '')
													navigator.clipboard.writeText(email)
													setCopied(true)
													setTimeout(() => setCopied(false), 2000)
												} catch (err) {
													console.error('Clipboard write failed', err)
												}
											} else {
												// open external URL in new tab
												window.open(String(url), '_blank', 'noopener,noreferrer')
											}
										}}>
											{isMail ? 'Copy email' : 'Apply Now'}
										</Button>
									)
								})()
							) : (
								<Button variant="outline" size="sm" disabled onClick={(e) => e.stopPropagation()}>
									No link available
								</Button>
							)}
						</div>
						{copied && <div className="text-xs text-success mt-2">Email copied to clipboard!</div>}
			</div>
		</div>
	)
}
