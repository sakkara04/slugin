"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'
import OpportunityCard from './opportunityCard'
import { createClient } from '@/utils/supabase/client'
import Navbar from "@/components/ui/navbar";
import { useUser } from '@supabase/auth-helpers-react'
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/ui/card";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuRadioGroup,
 DropdownMenuRadioItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from 'react'

export default function OpportunitiesPage() {
 const supabase = createClient()
 const user = useUser()

 const [fetchError, setFetchError] = useState<any>(null);
 const [opportunities, setOpportunities] = useState<any>(null);
 const [position, setPosition] = React.useState("Newest to Oldest Post")
 const [userProfile, setUserProfile] = useState<any>(null) //store user profile


 //suggested opportunities button
 const [showSuggested, setShowSuggested] = useState(false)
 const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<Set<any>>(new Set())

//US 1.4.3
useEffect(() => {
  const fetchUserProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('major, preferred_industry')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setUserProfile(data)
      console.log('User profile:', data)
    }
  }

  fetchUserProfile()
}, [user])

 //get applied opportunity IDs
useEffect(() => {
  const fetchAppliedOpportunities = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('user_id', user.id)

    if (!error && data) {
      const appliedIds = new Set(data.map(app => app.opportunity_id))
      setAppliedOpportunityIds(appliedIds)
    }
  }

  fetchAppliedOpportunities()
}, [user])

useEffect(()=> {
  const fetchOpportunities = async () => {
    const { data, error } = await supabase.from("opportunities").select(`*, profiles (first_name)`);

    if (error) {
      console.error('Error fetching data:', error);
      setFetchError('Error fetching data');
      setOpportunities(null);
    }
    if (data) {
      setOpportunities(data);
      setFetchError(null);
      console.log(data)
    }
  }
  fetchOpportunities()
},[position])

 //This const was created using ChatGPT's help to brainstorm the sorting logic of the opportunities
 const sortedOpportunities = opportunities ? [...opportunities].sort((a, b) => { if (position == "Earliest to Latest Due Date"){
         return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
     }
     else if (position == "Latest to Earliest Due Date"){
         return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
     }
     else if (position == "Oldest to Newest Post"){
         return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
     }
     else {
         return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
     }
 }): [];

  // US 3.1 - Task 3: update status based on deadline
 const currentDate = new Date()
 const updatedOpportunities = sortedOpportunities.map(opp => ({
   ...opp,
   status: new Date(opp.deadline) < currentDate ? 'Archived' : 'Active' //converted string to date
 }))

 const activeOpportunities = updatedOpportunities.filter(
   opp => opp.status === 'Active'
 );

//updated with major/industry 
const suggestedOpportunities = activeOpportunities
  .filter((opp) => !appliedOpportunityIds.has(opp.id))
  .filter((opp) => {
    if (!userProfile) return true;

    const oppCategories = opp.categories?.toLowerCase() || '';
    
    const userMajor = userProfile.major?.toLowerCase().replace(/\s*(b\.s\.|b\.a\.|m\.s\.|m\.a\.).*$/i, '').trim() || ''; //for major get rid of B.S or B.A
    const userIndustry = userProfile.preferred_industry?.toLowerCase() || '';

    const majorWords = userMajor.split(' ').filter((word: string) => word.length > 3);
    const industryWords = userIndustry.split(' ').filter((word: string) => word.length > 3);

    const matchesMajor = majorWords.some((word: string) => oppCategories.includes(word));
    const matchesIndustry = industryWords.some((word: string) => oppCategories.includes(word));

    return matchesMajor || matchesIndustry;
  });

 return (
  <div>
   <Navbar />
   <div className="container mx-auto py-8 px-4 max-w-2xl">
     <Card>
       <CardHeader>
         <div className = "flex justify-between">
         <CardTitle className="text-2xl">Available Opportunities</CardTitle>
         <DropdownMenu>
             <DropdownMenuTrigger asChild><Button>Sort By:  {position} ↓</Button></DropdownMenuTrigger>
             <DropdownMenuContent>
               <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
               <DropdownMenuRadioItem value={"Newest to Oldest Post"}>Newest to Oldest Post</DropdownMenuRadioItem>
               <DropdownMenuRadioItem value={"Oldest to Newest Post"}>Oldest to Newest Post</DropdownMenuRadioItem>
               <DropdownMenuRadioItem value={"Earliest to Latest Due Date"}>Earliest to Latest Due Date</DropdownMenuRadioItem>
               <DropdownMenuRadioItem value={"Latest to Earliest Due Date"}>Latest to Earliest Due Date</DropdownMenuRadioItem>
             </DropdownMenuRadioGroup>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
         <CardDescription>
           Browse and mark opportunities you've applied to
         </CardDescription>
         {/* Add the suggested opportunities toggle button here */}
         <div className="mt-4">
           <Button 
             onClick={() => setShowSuggested(!showSuggested)}
             variant={showSuggested ? "default" : "outline"}
           >
             {showSuggested ? "Show All Opportunities" : "Show Suggested Opportunities"}
           </Button>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
        {(showSuggested ? suggestedOpportunities : activeOpportunities).map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
          </CardContent>
     </Card>
   </div>
  </div>
 );
}