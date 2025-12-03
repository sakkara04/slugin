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
import { Heart, Check, ExternalLink, Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient} from '@/utils/supabase/client'
import upsertUserInteraction from '@/utils/supabase/interactions';
// Task 1.2.3: Import industries and majors
import industries from "../profile/industries";
import majors from "../profile/majors";

type Props = {
  user: User | null
}

type UserProfile = {
  major?: string;
  industry?: string;
}

export default function OpportunitiesCard({ user }: Props) {
  const supabase = createClient()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<any>([]);
  const [position, setPosition] = useState("Newest to Oldest Post")
  const [selected, setSelected] = useState<any>(null);

  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const [showSuggested, setShowSuggested] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [triedSignedFor, setTriedSignedFor] = useState<Record<string, boolean>>(
    {}
  );

  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<Set<any>>(new Set())

  // Task 1.2: Filter State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // Temporary state for the menu inputs
  const [tempSelectedIndustries, setTempSelectedIndustries] = useState<string[]>([]);
  const [tempSelectedMajors, setTempSelectedMajors] = useState<string[]>([]);
  const [tempSearchKeyword, setTempSearchKeyword] = useState<string>(""); 
  
  // Applied state for the actual filtering
  const [appliedIndustries, setAppliedIndustries] = useState<string[]>([]);
  const [appliedMajors, setAppliedMajors] = useState<string[]>([]);
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState<string>("");

  useEffect(() => {
  if (!user) return;
  
  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles') // or whatever your profile table is called
      .select('major, industry')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  fetchUserProfile();
}, [user]);
  
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
         // Resolve stored file paths to usable URLs.
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
  const sortedOpportunities = opps ? [...opps].sort((a: any, b: any) => {
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
  const updatedOpportunities = sortedOpportunities.map((opp: any) => ({
    ...opp,
    status: opp.deadline ? (new Date(opp.deadline) < currentDate ? 'Archived' : 'Active') : "Active" //converted string to date
  }))

  const activeOpportunities = updatedOpportunities.filter(
    (opp: any) => opp.status === 'Active'
  )

  const suggestedOpportunities = activeOpportunities
  .filter((opp: any) => {
    //first filter: not applied
    if (applied[opp.id]) return false;

    //second filter: match major from profile with opportunity categories/tags
    if (userProfile?.major) {
      const userMajor = userProfile.major.toLowerCase();
      
      //handle both array and string formats
      let tags: string[] = [];
      
      if (Array.isArray(opp.categories)) {
        tags = opp.categories.map((tag: string) => tag.toLowerCase().trim());
      } else if (typeof opp.categories === 'string') {
        try {
          const parsed = JSON.parse(opp.categories);
          tags = Array.isArray(parsed) 
            ? parsed.map((tag: string) => tag.toLowerCase().trim())
            : opp.categories.toLowerCase().split(',').map((tag: string) => tag.trim());
        } catch {
          tags = opp.categories.toLowerCase().split(',').map((tag: string) => tag.trim());
        }
      }
      
      const hasMatchingTag = tags.some((tag: string) => tag === userMajor);
      
      return hasMatchingTag;
    }

    return false;
  })
  //sort by deadline
  .sort((a, b) => {
    const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    
    //opportunities with no deadline go to end
    return deadlineA - deadlineB;
  })
  //add reason to each opportunity
  .map((opp) => ({
    ...opp,
    suggestionReason: `Suggested based on your major: ${userProfile?.major}`
  }));



  // Task 1.2.6: Filter Logic
  // Helper to normalize strings (remove B.S./B.A. distinction)
  const normalizeMajor = (text: string) => {
    return text.replace(/\bB\.?[SA]\.?\b/gi, "").trim().toLowerCase();
  };

  const matchesCustomFilters = (opp: any) => {
    // 1. Keyword Filter (Search)
    if (appliedSearchKeyword) {
        const keyword = appliedSearchKeyword.toLowerCase();
        const titleMatch = (opp.title || "").toLowerCase().includes(keyword);
        const descMatch = (opp.description || "").toLowerCase().includes(keyword);
        // Include fullDescription if it exists
        const fullDescMatch = (opp.fullDescription || "").toLowerCase().includes(keyword);
        
        if (!titleMatch && !descMatch && !fullDescMatch) {
            return false;
        }
    }

    // 2. Category Filters
    if (appliedIndustries.length === 0 && appliedMajors.length === 0) return true;
    
    // Parse categories from opportunity (handle string or array)
    let oppCats = "";
    if (Array.isArray(opp.categories)) {
        oppCats = opp.categories.join(", ");
    } else {
        oppCats = opp.categories || "";
    }
    const catsLower = oppCats.toLowerCase();
    
    // Check Industry
    const industryMatch = appliedIndustries.some(ind => 
        catsLower.includes(ind.toLowerCase())
    );
    
    // Check Major (using normalization)
    const majorMatch = appliedMajors.some(maj => {
        const normFilter = normalizeMajor(maj);
        const normCats = normalizeMajor(oppCats);
        return normCats.includes(normFilter);
    });
    
    return industryMatch || majorMatch;
  };

  return (
     <div className="container mx-auto py-8 px-4 relative">
       {/* Opportunities Page Header */}
       <div className="max-w-6xl mx-auto">
         <header className="mb-6">
         <div className = "flex flex-col md:flex-row justify-between gap-4 md:items-center">
           <h1 className="text-2xl font-semibold">Available Opportunities</h1>
           
           <div className="flex gap-2">
                {/* Task 1.2.1: Filter Button */}
                <Button 
                    variant="outline" 
                    className="flex gap-2"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                    <Filter size={16} /> Filter
                </Button>

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
        </div>

        {/* Task 1.2.2: Filter Dropdown Menu */}
        {showFilterMenu && (
             <div className="mt-4 p-4 border rounded-lg shadow-sm bg-white relative">
                 <button 
                    onClick={() => setShowFilterMenu(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                 >
                     <X size={20} className="text-gray-500" />
                 </button>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-8">
                     {/* Keywords Input */}
                     <div className="lg:col-span-1">
                        <label className="block text-sm font-medium mb-1">Keywords</label>
                        <input
                            type="text"
                            placeholder="Search title or description..."
                            className="w-full p-2 border rounded-md text-sm"
                            value={tempSearchKeyword}
                            onChange={(e) => setTempSearchKeyword(e.target.value)}
                        />
                     </div>

                     {/* Industry Select */}
                     <div className="lg:col-span-1">
                         <label className="block text-sm font-medium mb-1">Industry</label>
                         <select 
                             className="w-full p-2 border rounded-md text-sm"
                             value=""
                             onChange={(e) => {
                                 if (e.target.value) {
                                     setTempSelectedIndustries([...tempSelectedIndustries, e.target.value]);
                                 }
                             }}
                         >
                             <option value="">Select Industry...</option>
                             {industries
                                .filter((i: string) => !tempSelectedIndustries.includes(i))
                                .map((i: string) => (
                                 <option key={i} value={i}>{i}</option>
                             ))}
                         </select>
                         <div className="flex flex-wrap gap-2 mt-2">
                             {tempSelectedIndustries.map(ind => (
                                 <span key={ind} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors">
                                     {ind}
                                     <button 
                                        onClick={() => setTempSelectedIndustries(tempSelectedIndustries.filter(t => t !== ind))}
                                        className="hover:text-red-500"
                                     >
                                        <X size={12} />
                                     </button>
                                 </span>
                             ))}
                         </div>
                     </div>

                     {/* Major Select */}
                     <div className="lg:col-span-1">
                         <label className="block text-sm font-medium mb-1">Major</label>
                         <select 
                             className="w-full p-2 border rounded-md text-sm"
                             value=""
                             onChange={(e) => {
                                 if (e.target.value) {
                                     setTempSelectedMajors([...tempSelectedMajors, e.target.value]);
                                 }
                             }}
                         >
                             <option value="">Select Major...</option>
                             {majors
                                .filter((m: string) => !tempSelectedMajors.includes(m))
                                .map((m: string) => (
                                 <option key={m} value={m}>{m}</option>
                             ))}
                         </select>
                         <div className="flex flex-wrap gap-2 mt-2">
                             {tempSelectedMajors.map(maj => (
                                 <span key={maj} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors">
                                     {maj}
                                     <button 
                                        onClick={() => setTempSelectedMajors(tempSelectedMajors.filter(t => t !== maj))}
                                        className="hover:text-red-500"
                                     >
                                        <X size={12} />
                                     </button>
                                 </span>
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* Task 1.2.4 & 1.2.5: Filter Results Button */}
                 <div className="mt-4 flex justify-end">
                     <Button 
                        onClick={() => {
                            setAppliedIndustries(tempSelectedIndustries);
                            setAppliedMajors(tempSelectedMajors);
                            setAppliedSearchKeyword(tempSearchKeyword);
                        }}
                     >
                        Filter Results
                     </Button>
                 </div>
             </div>
         )}

           <CardDescription className="mt-2">Browse and mark opportunities you've applied to</CardDescription>
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

             {showSuggested && suggestedOpportunities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No new suggested opportunities</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later or browse all opportunities</p>
                </div>
              )}

             {/* Active Filter Summary */}
             {(appliedIndustries.length > 0 || appliedMajors.length > 0 || appliedSearchKeyword) && (
                   <div className="mb-4 text-sm flex gap-2 items-center flex-wrap">
                       <span>Active Filters:</span>
                       {appliedSearchKeyword && (
                           <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-blue-200">
                               Keyword: {appliedSearchKeyword}
                           </span>
                       )}
                       {[...appliedIndustries, ...appliedMajors].map((f, idx) => (
                           <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{f}</span>
                       ))}
                       <button 
                            className="underline text-xs ml-2"
                            onClick={() => {
                                setAppliedIndustries([]);
                                setAppliedMajors([]);
                                setAppliedSearchKeyword("");
                                setTempSelectedIndustries([]);
                                setTempSelectedMajors([]);
                                setTempSearchKeyword("");
                            }}
                       >
                           Clear all
                       </button>
                   </div>
              )}

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(showSuggested ? suggestedOpportunities : activeOpportunities)
                 .filter((o: any) => {
                   // Existing Tag Filter
                   if (filterTag) {
                     const cats = (o.categories || "").toLowerCase();
                     if (!cats.includes(filterTag.toLowerCase())) return false;
                   }
                   
                   // Task 1.2.6: Custom Filter Logic
                   return matchesCustomFilters(o);
                 })
                 .map((o: any) => {
                   const isApplied = Boolean(applied[o.id]);

                   return (
                     <OpportunityCard
                       key={o.id}
                       user={user} // Passed prop
                       opp={o}
                       isApplied={isApplied}
                       isSaved={Boolean(savedMap[o.id])}
                       isLiked={Boolean(likedMap[o.id])}
                       currentFilterTag={filterTag}
                       suggestionReason={showSuggested ? o.suggestionReason : undefined}
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
           <div>Location: {selected.location}</div>
           <div className="mt-1">Opportunity Closes: {selected.deadline ? new Date(selected.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No expiry'}</div>
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
                   const supabase = createClient();
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
                   const supabase = createClient();
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