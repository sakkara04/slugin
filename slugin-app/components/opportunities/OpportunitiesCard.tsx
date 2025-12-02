"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Check, Bookmark } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  upsertUserInteraction,
  deleteUserInteraction,
} from "@/utils/supabase/interactions";

export type Opportunity = {
  id: string;
  title: string;
  description?: string;
  fullDescription?: string;
  location?: string;
  categories?: string;
  link?: string;
};

type Props = {
  opp: Opportunity;
  isApplied?: boolean;
  isSaved?: boolean;
  isLiked?: boolean;
  onSelect?: (opp: Opportunity) => void;
  onToggleApplied?: (id: string, val: boolean) => void;
  onToggleSaved?: (id: string, val: boolean) => void;
  onToggleLiked?: (id: string, val: boolean) => void;
  // current active filter (so the card can toggle on/off)
  currentFilterTag?: string | null;
  // set the filter to a specific tag (or null to clear)
  onFilterTag?: (tag: string | null) => void;
};

export default function OpportunityCard({
  opp,
  isApplied = false,
  isSaved = false,
  isLiked = false,
  onSelect,
  onToggleApplied,
  onToggleSaved,
  onToggleLiked,
  onFilterTag,
  currentFilterTag,
}: Props) {
  const primaryTag = (opp.categories || "").split(",")[0]?.trim() || null;
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<boolean>(isSaved ?? false);
  const [liked, setLiked] = useState<boolean>(isLiked ?? false);

  // keep local saved state in sync with parent prop
  React.useEffect(() => {
    setSaved(Boolean(isSaved));
  }, [isSaved]);

  React.useEffect(() => {
    setLiked(Boolean(isLiked));
  }, [isLiked]);

  return (
    <div
      key={opp.id}
      className="border rounded-md p-4 hover:shadow-md flex flex-col justify-between min-h-[200px] break-words bg-transparent"
      onClick={() => onSelect?.(opp)}
    >
      {/* Posting Information */}
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{opp.title}</h3>
          {isApplied && <span className="text-sm text-success">Applied</span>}
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {opp.description
            ? opp.description.length > 120
              ? opp.description.slice(0, 117) + "..."
              : opp.description
            : "No description"}
        </p>
        {opp.location && (
          <div className="text-xs text-muted-foreground mt-3">
            Location: {opp.location}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 items-center">
        <div>
          {/* Save button logic */}
          <Button
            size="sm"
            variant={saved ? "secondary" : "outline"}
            onClick={async (e) => {
              e.stopPropagation();
              const next = !saved;
              // optimistic UI update
              setSaved(next);
              try {
                const supabase = createClient();
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");
                if (next) {
                  // turning on: upsert saved
                  await upsertUserInteraction(user.id, opp.id, "saved");
                } else {
                  // turning off: remove any interaction so DB shows no action
                  await deleteUserInteraction(user.id, opp.id);
                }
                // notify parent of change
                onToggleSaved?.(opp.id, next);
                // ensure only one action exists: clear applied in parent when saved
                onToggleApplied?.(opp.id, false);
                onToggleLiked?.(opp.id, false);
              } catch (err) {
                console.error("Failed to save/unsave interaction", err);
                // revert optimistic update on error
                setSaved(!next);
              }
            }}
          >
            <Bookmark size={14} />
            <span className="ml-2">{saved ? "Saved" : "Save"}</span>
          </Button>
        </div>
        {/* Applied button logic */}
        <div className="flex justify-end">
          <Button
            variant={isApplied ? "secondary" : "outline"}
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              const next = !isApplied;
              // optimistic parent update (set explicit value)
              onToggleApplied?.(opp.id, next);
              try {
                const supabase = createClient();
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");
                if (next) {
                  await upsertUserInteraction(user.id, opp.id, "applied");
                } else {
                  await deleteUserInteraction(user.id, opp.id);
                }
                // ensure only one action exists at a time: clear saved state in parent when applied toggles
                onToggleSaved?.(opp.id, false);
                onToggleLiked?.(opp.id, false);
              } catch (err) {
                console.error("Failed to update applied interaction", err);
              }
            }}
          >
            <Check size={14} />
            <span className="ml-2">
              {isApplied ? "Unmark" : "Mark as Applied"}
            </span>
          </Button>
        </div>
        {/* Like button logic */}
        <div>
          <Button
            variant={liked ? "secondary" : "ghost"}
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              if (!primaryTag) return;
              const next = currentFilterTag === primaryTag ? null : primaryTag;
              onFilterTag?.(next);
              // record a 'liked' interaction (best-effort)
              try {
                const supabase = createClient();
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;
                await upsertUserInteraction(user.id, opp.id, "liked");
                // clear other actions in parent when user likes (only one action allowed)
                onToggleSaved?.(opp.id, false);
                onToggleApplied?.(opp.id, false);
                onToggleLiked?.(opp.id, true);
                // optimistic local update
                setLiked(true);
              } catch (err) {
                console.error("Failed to upsert liked interaction", err);
              }
            }}
          >
            <Heart size={14} />
            <span className="ml-2">Show more like this</span>
          </Button>
        </div>
        {/* Apply Now / Copy Email button logic */}
        <div className="flex justify-end">
          {(opp as any).link || (opp as any).application_link ? (
            (() => {
              const url = (opp as any).link || (opp as any).application_link;
              const isMail = url?.toString().startsWith("mailto:");

              return (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMail) {
                      try {
                        const email = url.replace(/^mailto:/, "");
                        navigator.clipboard.writeText(email);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        console.error("Clipboard write failed", err);
                      }
                    } else {
                      // open external URL in new tab
                      window.open(String(url), "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  {isMail ? "Copy email" : "Apply Now"}
                </Button>
              );
            })()
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              onClick={(e) => e.stopPropagation()}
            >
              No link available
            </Button>
          )}
        </div>
        {copied && (
          <div className="text-xs text-success mt-2">
            Email copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
