"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Loader2, Clock, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Stop {
  id: string;
  name: string;
  number?: string;
}

interface SearchbarProps {
  onSelectStop: (stop: Stop) => void;
}

export default function Searchbar({ onSelectStop }: SearchbarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentStops, setRecentStops] = useState<Stop[]>([]);

  // Kiel recommended stops
  const recommendedStops: Stop[] = [
    { id: "1610075375461732195", name: "Hauptbahnhof", number: "2387" },
    { id: "1610075375461731969", name: "Uni-Westring", number: "1491" },
    { id: "1610075375461731909", name: "Reventloubrücke", number: "1237" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("kvg-recent-stops");
    if (saved) {
      try {
        setRecentStops(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSelect = (stop: Stop) => {
    onSelectStop(stop);
    setQuery("");
    setIsFocused(false);

    // Update recent stops
    const newRecent = [
      stop,
      ...recentStops.filter((s) => s.id !== stop.id),
    ].slice(0, 5);
    setRecentStops(newRecent);
    localStorage.setItem("kvg-recent-stops", JSON.stringify(newRecent));
  };

  const handleRemoveRecent = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    const newRecent = recentStops.filter((s) => s.id !== stopId);
    setRecentStops(newRecent);
    localStorage.setItem("kvg-recent-stops", JSON.stringify(newRecent));
  };

  const { data: stops = [], isLoading } = useSWR<Stop[]>(
    "/api/stops",
    fetcher,
    {
      revalidateOnFocus: false, // Stops rarely change
      revalidateIfStale: false,
    },
  );

  const fuse = useMemo(
    () =>
      new Fuse(stops, {
        keys: ["name", "number"],
        threshold: 0.3,
      }),
    [stops],
  );

  const filteredStops =
    query.trim() === ""
      ? []
      : fuse
          .search(query)
          .map((result) => result.item)
          .slice(0, 8);

  const showSuggestions = isFocused && query.trim() === "";
  const suggestionsToDisplay =
    recentStops.length > 0 ? recentStops : recommendedStops;
  const suggestionLabel =
    recentStops.length > 0 ? "Zuletzt gesucht" : "Empfohlen";

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      <div
        className={`relative flex items-center w-full px-4 py-3 bg-surface border transition-colors duration-300 rounded-2xl shadow-lg ${isFocused ? "border-brand" : "border-border"}`}
      >
        <Search className="w-5 h-5 text-muted mr-3" />
        <input
          type="text"
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted"
          placeholder="Haltestelle suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (query.trim() === "" && suggestionsToDisplay.length > 0) {
                handleSelect(suggestionsToDisplay[0]);
              } else if (filteredStops.length > 0) {
                handleSelect(filteredStops[0]);
              }
            }
          }}
        />
        {isLoading && <Loader2 className="w-5 h-5 text-brand animate-spin" />}
      </div>

      <AnimatePresence>
        {(isFocused && filteredStops.length > 0) || showSuggestions ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {showSuggestions && (
              <div className="px-4 py-2 bg-surface-hover/50 text-xs font-semibold text-muted uppercase tracking-wider flex items-center">
                {recentStops.length > 0 ? (
                  <Clock className="w-3 h-3 mr-2" />
                ) : (
                  <Star className="w-3 h-3 mr-2" />
                )}
                {suggestionLabel}
              </div>
            )}
            <ul className="max-h-64 overflow-y-auto py-2">
              {(showSuggestions ? suggestionsToDisplay : filteredStops).map(
                (stop) => (
                  <li
                    key={stop.id}
                    className="flex items-center hover:bg-surface-hover transition-colors px-2"
                  >
                    <button
                      onClick={() => handleSelect(stop)}
                      className="flex-1 text-left px-2 py-3"
                    >
                      <span className="font-medium text-foreground">
                        {stop.name}
                      </span>
                    </button>

                    {showSuggestions &&
                      suggestionsToDisplay === recentStops && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input from losing focus
                            e.stopPropagation();
                          }}
                          onClick={(e) => handleRemoveRecent(e, stop.id)}
                          className="p-2 mr-2 rounded-full hover:bg-border text-muted hover:text-red-400 transition-colors"
                          title="Aus Verlauf löschen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                  </li>
                ),
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
