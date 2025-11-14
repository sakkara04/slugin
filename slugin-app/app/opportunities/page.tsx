"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'
import OpportunityCard from './opportunityCard'
import { createClient } from '@/utils/supabase/client'
import Navbar from "@/components/ui/navbar";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from 'react'

const supabase = createClient();

export default function OpportunitiesPage() {
  const [fetchError, setFetchError] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any>(null);

  useEffect(()=> {
    const fetchOpportunities = async () => {
    const { data, error } = await supabase.from("opportunities").select()

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
},[]) 

  const [position, setPosition] = React.useState("Newest to Oldest Post")

  return (
   <div>
    <Navbar />
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className = "flex justify-between">
          <CardTitle className="text-2xl">Available Opportunities</CardTitle>
          <Button>
          <DropdownMenu>
              <DropdownMenuTrigger>Sort By:  {position} ↓</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                <DropdownMenuRadioItem value={"Newest to Oldest Post"}>Newest to Oldest Post</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={"Oldest to Newest Post"}>Oldest to Newest Post</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={"Earliest to Latest Due Date"}>Earliest to Latest Due Date</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={"Latest to Earliest Due Date"}>Latest to Earliest Due Date</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Button>
          </div>
          <CardDescription>
            Browse and mark opportunities you've applied to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {opportunities && opportunities.map((opportunities: { id: any; title?: string; description?: string; deadline?: string; location?: string; categories?: string; listedBy?: string; application_link?: string | undefined; }) => (
            <OpportunityCard key={opportunities.id} opportunity={opportunities} />
          ))}
        </CardContent>
      </Card>
    </div>
   </div>
  );
}
