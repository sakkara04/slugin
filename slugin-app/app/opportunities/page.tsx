"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import { createClient as createBrowserClient } from '@/utils/supabase/client'
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
import OpportunityCard from '@/components/opportunities/OpportunitiesCard'
// Card UI is rendered by OpportunityCard component
import { Button } from "@/components/ui/button";
import { Heart, Check, ExternalLink } from "lucide-react";
import { upsertUserInteraction } from "@/utils/supabase/interactions";

type Opportunity = {
  id: string;
  title: string;
  description?: string;
  fullDescription?: string;
  location?: string;
  categories?: string;
  link?: string;
  file?: string | null;
  created_at?: string;
  deadline?: string;
};

export default function OpportunitiesPage() {
  const supabase = createBrowserClient()

  const [fetchError, setFetchError] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any>(null);
  const [position, setPosition] = React.useState("Newest to Oldest Post")

  //suggested opportunities button
  const [showSuggested, setShowSuggested] = useState(false)
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [triedSignedFor, setTriedSignedFor] = useState<Record<string, boolean>>(
    {}
  );
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const supabase = createBrowserClient();
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
            (data as Opportunity[]).map(async (row) => {
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

   // Sort the currently-loaded & resolved opportunities (`opps`) according to the selected `position`.
   const sortedOpportunities = opps
     ? [...opps].sort((a, b) => {
         const time = (s?: string) => (s ? new Date(s).getTime() : 0);

         if (position === "Earliest to Latest Due Date") {
           return time(a.deadline) - time(b.deadline);
         } else if (position === "Latest to Earliest Due Date") {
           return time(b.deadline) - time(a.deadline);
         } else if (position === "Oldest to Newest Post") {
           return time(a.created_at) - time(b.created_at);
         } else {
           return time(b.created_at) - time(a.created_at);
         }
       })
     : [];

  // US 3.1 - Task 3: update status based on deadline
 const currentDate = new Date()
 const updatedOpportunities = sortedOpportunities.map((opp) => ({
   ...opp,
   status: opp.deadline ? (new Date(opp.deadline) < currentDate ? "Archived" : "Active") : "Active",
}));

 const activeOpportunities = updatedOpportunities.filter(
   opp => opp.status === 'Active'
 );

 const suggestedOpportunities = activeOpportunities.filter((opp) => opp.categories?.toLowerCase().includes("research"));

  return (
    <div>
      <Navbar />
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
            <CardDescription>Browse and mark opportunities you’ve applied to</CardDescription>
            {/* Add the suggested opportunities toggle button here */}
         <div className="mt-4">
           <Button 
             onClick={() => setShowSuggested(!showSuggested)}
             variant={showSuggested ? "default" : "outline"}
           >
             {showSuggested ? "Show All Opportunities" : "Show Suggested Opportunities"}
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
                {(showSuggested ? suggestedOpportunities : activeOpportunities)
                  .filter((o) => {
                    if (!filterTag) return true;
                    const cats = (o.categories || "").toLowerCase();
                    return cats.includes(filterTag.toLowerCase());
                  })
                  .map((o) => {
                    const isApplied = Boolean(applied[o.id]);

                    return (
                      <OpportunityCard
                        key={o.id}
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
      </div>
      {/* Opportunity Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-3xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">{selected.title}</h2>
              <button
                className="text-sm text-muted-foreground"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            {selected.location && (
              <div className="text-sm text-muted-foreground mb-4">
                Location: {selected.location}
              </div>
            )}

            <div className="w-full flex justify-center mb-6">
              {selected.file ? (
                <img
                  src={selected.file}
                  alt={selected.title}
                  className="w-full max-w-lg h-auto object-contain rounded bg-gray-50"
                  onError={async () => {
                    if (!selected) return;
                    if (triedSignedFor[selected.id]) return;
                    try {
                      const url = selected.file || "";
                      const m = url.match(/\/flyers\/(.*)$/);
                      const path = m ? decodeURIComponent(m[1]) : null;
                      if (!path) return;
                      setTriedSignedFor((prev) => ({
                        ...prev,
                        [selected.id]: true,
                      }));
                      const res = await fetch("/api/storage/signed-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ path }),
                      });
                      const json = await res.json();
                      if (json?.success && json.signedUrl) {
                        setSelected({ ...selected, file: json.signedUrl });
                      }
                    } catch (err) {
                      console.error(
                        "Error attempting signed-url fallback",
                        err
                      );
                    }
                  }}
                />
              ) : (
                <div className="w-full max-w-lg bg-gray-50 rounded-md p-8 text-center text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">
                CS
              </div>
              <p className="text-base">
                {selected.fullDescription ||
                  selected.description ||
                  "No additional details provided."}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {selected.link && (
                <div>
                  {/* Application Link or Email Button */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = selected.link || "";
                      if (url.startsWith("mailto:")) {
                        const email = url.replace(/^mailto:/, "");
                        try {
                          navigator.clipboard.writeText(email);
                          setCopiedEmail(email);
                          setTimeout(() => setCopiedEmail(null), 2000);
                        } catch (err) {
                          console.error("Clipboard write failed", err);
                        }
                      } else {
                        window.open(url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <ExternalLink size={14} />
                    <span className="ml-2">
                      {(selected.link || "").startsWith("mailto:")
                        ? "Copy email"
                        : "Open application"}
                    </span>
                  </Button>
                  {copiedEmail && (
                    <div className="text-sm text-success mt-2">
                      Email copied to clipboard!
                    </div>
                  )}
                </div>
              )}
              {/* Applied button logic */}
              <Button
                variant={applied[selected.id] ? "secondary" : "outline"}
                onClick={async () => {
                  const next = !applied[selected.id];
                  setApplied((prev) => ({ ...prev, [selected.id]: next }));
                  try {
                    const supabase = createBrowserClient();
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) return;
                    if (next) {
                      await upsertUserInteraction(
                        user.id,
                        selected.id,
                        "applied"
                      );
                    } else {
                      // remove interaction when unmarking
                      const { error } = await supabase
                        .from("user_interactions")
                        .delete()
                        .match({
                          user_id: user.id,
                          opportunity_id: Number(selected.id),
                        });
                      if (error) throw error;
                    }
                    // ensure saved state cleared when applying/unapplying
                    setSavedMap((prev) => ({ ...prev, [selected.id]: false }));
                    setLikedMap((prev) => ({ ...prev, [selected.id]: false }));
                  } catch (err) {
                    console.error(
                      "Failed to update applied interaction from modal",
                      err
                    );
                    // revert optimistic update on error
                    setApplied((prev) => ({ ...prev, [selected.id]: !next }));
                  }
                }}
              >
                <Check size={14} />
                <span className="ml-2">
                  {applied[selected.id]
                    ? "Unmark as applied"
                    : "Mark as applied"}
                </span>
              </Button>
            </div>
            {/* Show more like this button logic */}
            <div className="mt-2">
              <button
                className="flex items-center gap-2 text-sm text-muted-foreground"
                onClick={async () => {
                  const primaryTag =
                    (selected.categories || "").split(",")[0]?.trim() || null;
                  setFilterTag((prev) =>
                    prev === primaryTag ? null : primaryTag
                  );
                  setSelected(null);
                  try {
                    const supabase = createBrowserClient();
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) return;
                    await upsertUserInteraction(user.id, selected.id, "liked");
                    // clear other actions in UI when liked and mark liked
                    setSavedMap((prev) => ({ ...prev, [selected.id]: false }));
                    setApplied((prev) => ({ ...prev, [selected.id]: false }));
                    setLikedMap((prev) => ({ ...prev, [selected.id]: true }));
                  } catch (err) {
                    console.error(
                      "Failed to upsert liked interaction from modal",
                      err
                    );
                  }
                }}
              >
                <Heart size={16} />
                <span>Show more like this</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
