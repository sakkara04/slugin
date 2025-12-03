'use client'

// all opportunities card

import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button'
import OpportunityCard from '@/components/opportunities/OpportunitiesCard';
import {
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Check, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient} from '@/utils/supabase/client'
import upsertUserInteraction from '@/utils/supabase/interactions';
import OpportunityModal from '@/components/opportunities/OpportunityModal';

type Props = {
  user: User | null
}

export default function OpportunitiesCard({ user }: Props) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<any>([]);
  const [position, setPosition] = useState("Newest to Oldest Post")
  const [selected, setSelected] = useState<any>(null);

  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const [showSuggested, setShowSuggested] = useState(false)
  const [showUnapplied, setShowUnapplied] = useState(false)
  

  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<Set<any>>(new Set())

  useEffect(() => {
    if (!user) return
    const fetchAppliedOpportunities = async () => {
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

   useEffect(() => {
   let mounted = true;
   async function load() {
     try {
       const supabase = createClient();
       const { data, error } = await supabase
         .from("opportunities")
         .select("*")
         .order("created_at", { ascending: false });

       if (error) {
         console.error("Error loading opportunities", error);
         return;
       }

       if (mounted && data) {
         // Resolve stored file paths to usable URLs. If the `file` field is
         // already an absolute URL (starts with http) we keep it. Otherwise
         // try to get a public URL from the `flyers` storage bucket.
         const resolved = await Promise.all(
           (data).map(async (row) => {
             const copy = { ...row };
             if (copy.file && !copy.file.startsWith("http")) {
               try {
                 const { data: publicData } = supabase.storage
                   .from("flyers")
                   .getPublicUrl(copy.file);
                 if (publicData?.publicUrl) {
                   copy.file = publicData.publicUrl;
                 }
               } catch (err) {
                 console.error("Error resolving file URL for", copy.file, err);
               }
             }
             return copy;
           })
         );

         setOpps(resolved);
         try {
           const { data: userData } = await supabase.auth.getUser();
           const user = userData?.user;
           if (user) {
             const { data: interactions } = await supabase
               .from("user_interactions")
               .select("opportunity_id,action")
               .eq("user_id", user.id);

             const appliedInit: Record<string, boolean> = {};
             const savedInit: Record<string, boolean> = {};
             const likedInit: Record<string, boolean> = {};
             const list = (interactions as any[]) || [];
             list.forEach((r: any) => {
               const id = String(r.opportunity_id);
               if (r.action === "applied") appliedInit[id] = true;
               if (r.action === "saved") savedInit[id] = true;
               if (r.action === "liked") likedInit[id] = true;
             });
             setApplied(appliedInit);
             setSavedMap(savedInit);
             setLikedMap(likedInit);
           }
         } catch (err) {
           console.error("Failed to load user interactions", err);
         }
       }
     } finally {
       if (mounted) setLoading(false);
     }
   }

   load()
   return () => { mounted = false }
 }, [])

  //This const was created using ChatGPT's help to brainstorm the sorting logic of the opportunities
  const sortedOpportunities = opps ? [...opps].sort((a, b) => {
    const time = (s?: string) => (s ? new Date(s).getTime(): 0);

    if (position == "Earliest to Latest Due Date") {
      return time(a.deadline)- time(b.deadline);
    }
    else if (position == "Latest to Earliest Due Date") {
      return time(b.deadline) - time(a.deadline);
    }
    else if (position == "Oldest to Newest Post") {
      return time(a.created_at) - time(b.created_at);
    }
    else {
      return time(b.created_at) - time(a.created_at);
    }
  }) : [];

  // US 3.1 - Task 3: update status based on deadline
  const currentDate = new Date()
  const updatedOpportunities = sortedOpportunities.map(opp => ({
    ...opp,
    status: opp.deadline ? (new Date(opp.deadline) < currentDate ? 'Archived' : 'Active') : "Active" //converted string to date
  }))

  const activeOpportunities = updatedOpportunities.filter(
    opp => opp.status === 'Active'
  )

  const suggestedOpportunities = activeOpportunities
 .filter((opp) => opp.categories?.toLowerCase().includes("research"))
 .filter((opp) => !appliedOpportunityIds.has(opp.id));

  // compute the list to render, optionally filtering out applied items
  const baseList = showSuggested ? suggestedOpportunities : activeOpportunities;
  const isAppliedFor = (opp: any) => {
    // check both loaded interactions map and application ids returned from DB
    if (applied[String(opp.id)]) return true;
    if (appliedOpportunityIds.has(opp.id)) return true;
    if (appliedOpportunityIds.has(Number(opp.id))) return true;
    return false;
  }
  const displayList = showUnapplied ? baseList.filter((o) => !isAppliedFor(o)) : baseList;

  return (
     <div className="container mx-auto py-8 px-4">
       {/* Opportunities Page Header */}
       <div className="max-w-6xl mx-auto">
         <header className="mb-6">
         <div className = "flex justify-between">
           <h1 className="text-2xl font-semibold">Available Opportunities</h1>
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
           <CardDescription>Browse and mark opportunities you've applied to</CardDescription>
           {/* Add the suggested opportunities toggle button here */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => setShowSuggested(!showSuggested)}
            variant={showSuggested ? "default" : "outline"}
          >
            {showSuggested ? "Show All Opportunities" : "Show Suggested Opportunities"}
          </Button>
          <Button
            onClick={() => setShowUnapplied(!showUnapplied)}
            variant={showUnapplied ? "default" : "outline"}
          >
            {showUnapplied ? "Show All (include applied)" : "Show Unapplied Only"}
          </Button>
        </div>
         </header>

         {/* Showing Similar Events Based on Tags */}
         {loading ? (
           <div>Loading...</div>
         ) : (
           <div>
             {filterTag && (
               <div className="mb-4 text-sm">
                 Showing events like "{filterTag}" —{" "}
                 <button
                   className="underline"
                   onClick={() => setFilterTag(null)}
                 >
                   Clear filter
                 </button>
               </div>
             )}

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {displayList
                 .filter((o) => {
                   if (!filterTag) return true;
                   const cats = (o.categories || "").toLowerCase();
                   return cats.includes(filterTag.toLowerCase());
                 })
                 .map((o) => {
                   const isApplied = isAppliedFor(o);

                   return (
                     <OpportunityCard
                       key={o.id}
                       user={user}
                       opp={o}
                       isApplied={isApplied}
                       isSaved={Boolean(savedMap[o.id])}
                       isLiked={Boolean(likedMap[o.id])}
                       currentFilterTag={filterTag}
                       onSelect={(item) => setSelected(item)}
                       onToggleApplied={(id, val) =>
                         setApplied((prev) => ({ ...prev, [id]: val }))
                       }
                       onToggleSaved={(id, val) =>
                         setSavedMap((prev) => ({ ...prev, [id]: val }))
                       }
                       onToggleLiked={(id, val) =>
                         setLikedMap((prev) => ({ ...prev, [id]: val }))
                       }
                       onFilterTag={(tag) => setFilterTag(tag)}
                     />
                   );
                 })}
             </div>
           </div>
         )}
       </div>
     {/* Opportunity Details Modal (shared) */}
     {selected && (
       <OpportunityModal
         opp={selected}
         isApplied={Boolean(applied[selected.id])}
         isSaved={Boolean(savedMap[selected.id])}
         isLiked={Boolean(likedMap[selected.id])}
         onClose={() => setSelected(null)}
         onAppliedChange={(id, val) => setApplied((prev) => ({ ...prev, [id]: val }))}
         onSavedChange={(id, val) => setSavedMap((prev) => ({ ...prev, [id]: val }))}
         onLikedChange={(id, val) => setLikedMap((prev) => ({ ...prev, [id]: val }))}
         onFilterTag={(tag) => setFilterTag(tag)}
       />
     )}
   </div>
);
}
