"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import { Clock, Loader2, Search, Star, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  // Kiel recommended stops
  const recommendedStops: Stop[] = [
    { id: "1610075375461732195", name: "Hauptbahnhof", number: "2387" },
    { id: "1610075375461731969", name: "Uni-Westring", number: "1491" },
    { id: "1610075375461731909", name: "Reventloubrücke", number: "1237" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }

    const saved = localStorage.getItem("kvg-recent-stops");
    if (saved) {
      try {
        setRecentStops(JSON.parse(saved));
      } catch {}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        // Don't intercept if user is typing in another input
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          if (document.activeElement !== inputRef.current) return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (stop: Stop) => {
    onSelectStop(stop);
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();

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
    <div className="relative z-50 mx-auto w-full max-w-2xl">
      <div
        className={`bg-surface relative flex w-full items-center rounded-2xl border px-4 py-3 shadow-lg transition-colors duration-300 ${isFocused ? "border-brand" : "border-border"} cursor-text`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="text-muted mr-3 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          className="text-foreground placeholder:text-muted w-full border-none bg-transparent outline-none pr-12"
          placeholder="Haltestelle suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsFocused(false);
              inputRef.current?.blur();
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (query.trim() === "" && suggestionsToDisplay.length > 0) {
                handleSelect(suggestionsToDisplay[0]);
              } else if (filteredStops.length > 0) {
                handleSelect(filteredStops[0]);
              }
            }
          }}
        />
        {!isFocused && !query && (
          <div className="hidden md:flex absolute right-4 items-center gap-1 pointer-events-none text-muted text-[10px] font-bold">
            <kbd className="bg-surface-hover rounded px-1.5 py-0.5 border border-border">
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="bg-surface-hover rounded px-1.5 py-0.5 border border-border">
              K
            </kbd>
          </div>
        )}
        {isLoading && <Loader2 className="text-brand absolute right-4 h-5 w-5 animate-spin" />}
      </div>

      <AnimatePresence>
        {(isFocused && filteredStops.length > 0) || showSuggestions ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-surface border-border absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border shadow-2xl"
          >
            {showSuggestions && (
              <div className="bg-surface-hover/50 text-muted flex items-center px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                {recentStops.length > 0 ? (
                  <Clock className="mr-2 h-3 w-3" />
                ) : (
                  <Star className="mr-2 h-3 w-3" />
                )}
                {suggestionLabel}
              </div>
            )}
            <ul className="max-h-64 overflow-y-auto py-2">
              {(showSuggestions ? suggestionsToDisplay : filteredStops).map(
                (stop) => (
                  <li
                    key={stop.id}
                    className="hover:bg-surface-hover flex items-center px-2 transition-colors"
                  >
                    <button
                      onClick={() => handleSelect(stop)}
                      className="flex-1 px-2 py-3 text-left"
                    >
                      <span className="text-foreground font-medium">
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
                          className="hover:bg-border text-muted mr-2 rounded-full p-2 transition-colors hover:text-red-400"
                          title="Aus Verlauf löschen"
                        >
                          <X className="h-4 w-4" />
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
