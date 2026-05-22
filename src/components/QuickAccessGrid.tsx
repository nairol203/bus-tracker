"use client";

import { useState } from "react";
import { ChevronRight, History, Loader2, MapPin } from "lucide-react";
import { motion } from "motion/react";

import { useRecentStops } from "@/hooks/useRecentStops";
import { Stop } from "@/components/Searchbar";

interface QuickAccessGridProps {
  onSelectStop: (stop: Stop) => void;
}

export const recommendedStops: Stop[] = [
  { name: "Hauptbahnhof", number: "2387" },
  { name: "Andreas-Gayk-Straße", number: "1256" },
  { name: "Dreiecksplatz", number: "2151" },
  { name: "Uni-Westring", number: "1491" },
];

export default function QuickAccessGrid({
  onSelectStop,
}: QuickAccessGridProps) {
  const { addRecentStop } = useRecentStops();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSelect = (stop: Stop, source: "recent" | "recommended") => {
    setPendingId(`${source}-${stop.number}`);
    if (source === "recent") {
      addRecentStop(stop);
    }
    onSelectStop(stop);
  };

  const { recentStops } = useRecentStops();

  return (
    <div className="mt-8 flex w-full flex-col gap-6">
      {recentStops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-muted mb-2 flex items-center px-1 text-xs font-bold tracking-widest uppercase">
            Zuletzt gesucht
          </h2>
          <div className="bg-surface/40 border-border/60 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-md">
            {recentStops.slice(0, 4).map((stop, i) => (
              <button
                key={stop.number}
                onClick={() => handleSelect(stop, "recent")}
                className={`group hover:bg-surface-hover focus-visible:bg-surface-hover active:bg-surface-hover focus-visible:ring-brand flex w-full items-center justify-between p-3.5 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${
                  i !== Math.min(recentStops.length, 4) - 1
                    ? "border-border/40 border-b"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <History className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 opacity-60 transition-colors" />
                  <span className="text-foreground truncate pr-2 font-medium">
                    {stop.name}
                  </span>
                </div>
                {pendingId === `recent-${stop.number}` ? (
                  <Loader2 className="text-brand h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  <ChevronRight className="text-muted group-hover:text-brand h-4 w-4 shrink-0 opacity-30 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-muted mb-2 flex items-center px-1 text-xs font-bold tracking-widest uppercase">
          Vorschläge
        </h2>
        <div className="bg-surface/40 border-border/60 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-md">
          {recommendedStops.map((stop, i) => (
            <button
              key={stop.number}
              onClick={() => handleSelect(stop, "recommended")}
              className={`group hover:bg-surface-hover focus-visible:bg-surface-hover active:bg-surface-hover focus-visible:ring-brand flex w-full items-center justify-between p-3.5 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${
                i !== recommendedStops.length - 1
                  ? "border-border/40 border-b"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MapPin className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 opacity-60 transition-colors" />
                <span className="text-foreground truncate pr-2 font-medium">
                  {stop.name}
                </span>
              </div>
              {pendingId === `recommended-${stop.number}` ? (
                <Loader2 className="text-brand h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <ChevronRight className="text-muted group-hover:text-brand h-4 w-4 shrink-0 opacity-30 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
