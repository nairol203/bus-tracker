"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Loader2, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePlausible } from "next-plausible";
import useSWR from "swr";

import { useRecentStops } from "@/hooks/useRecentStops";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Stop {
  name: string;
  number: string;
}

interface SearchbarProps {
  onSelectStop: (stop: Stop) => void;
}

export default function Searchbar({ onSelectStop }: SearchbarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { addRecentStop } = useRecentStops();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);
  const plausible = usePlausible();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(/Mac/i.test(navigator.userAgent));

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

  const handleSelect = (
    stop: Stop,
    source: "search" | "recommendedStop" | "lastSearch",
  ) => {
    plausible(source, { props: { stop: stop.name, number: stop.number } });
    onSelectStop(stop);
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();

    // Update recent stops
    addRecentStop(stop);
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

  return (
    <div
      className="relative z-50 mx-auto w-full max-w-2xl"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      <div
        className={`bg-surface relative flex w-full items-center rounded-2xl border px-4 py-3 shadow-lg transition-colors duration-300 ${isFocused ? "border-brand" : "border-border"} cursor-text`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="text-muted mr-3 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isFocused && filteredStops.length > 0}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className="text-foreground placeholder:text-muted w-full border-none bg-transparent pr-12 outline-none"
          placeholder="Nach Haltestelle suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsFocused(false);
              inputRef.current?.blur();
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (filteredStops.length > 0) {
                handleSelect(filteredStops[0], "search");
              }
            }
          }}
        />
        {!isFocused && !query && (
          <div className="text-muted pointer-events-none absolute right-4 hidden items-center gap-1 text-[10px] font-bold md:flex">
            <kbd className="bg-surface-hover border-border rounded border px-1.5 py-0.5">
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="bg-surface-hover border-border rounded border px-1.5 py-0.5">
              K
            </kbd>
          </div>
        )}
        {isLoading && (
          <Loader2 className="text-brand absolute right-4 h-5 w-5 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isFocused && filteredStops.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-surface border-border absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border shadow-2xl"
          >
            <ul
              id="search-suggestions"
              role="listbox"
              className="max-h-64 overflow-y-auto py-2"
            >
              {filteredStops.map((stop, idx) => (
                <li
                  key={stop.number}
                  role="presentation"
                  className="hover:bg-surface-hover flex items-center px-2 transition-colors"
                >
                  <button
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(stop, "search")}
                    className="focus-visible:ring-brand flex flex-1 items-center justify-between rounded-md px-2 py-3 text-left focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="text-foreground font-medium">
                      {stop.name}
                    </span>
                    {idx === 0 && (
                      <span className="text-muted flex items-center gap-1 text-xs opacity-50">
                        <kbd className="bg-background border-border rounded border px-1.5 py-0.5">
                          ↵
                        </kbd>
                        <span className="hidden sm:inline">Enter</span>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
