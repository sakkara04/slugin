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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from 'react'
import { Nav } from "react-bootstrap";

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

  const [position, setPosition] = React.useState("")

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
              <DropdownMenuTrigger>Sort By ↓</DropdownMenuTrigger>
              <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
              <DropdownMenuContent>
                <DropdownMenuItem>Most recently posted</DropdownMenuItem>
                <DropdownMenuItem>Oldest Posting</DropdownMenuItem>
                <DropdownMenuItem>Oldest Due Date</DropdownMenuItem>
                <DropdownMenuItem>Newest Due Date</DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenuRadioGroup>
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
