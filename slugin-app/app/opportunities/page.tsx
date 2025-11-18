"use client";

import { useEffect, useState } from 'react';
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

  return (
   <div>
    <Navbar />
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Available Opportunities</CardTitle>
          <CardDescription>
            Browse and mark opportunities you’ve applied to
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
