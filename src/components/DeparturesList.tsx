"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDelayMinutes } from "@/utils/time";
import { AlertCircle, Clock, Filter, Navigation, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Departure {
  actualRelativeTime: number;
  actualTime: string;
  plannedTime: string;
  direction: string;
  patternText: string;
  tripId: string;
  status: string;
}

interface DeparturesListProps {
  stopNumber: string;
  stopName: string;
  onSelectTrip: (tripId: string, line: string, destination: string) => void;
  isOffline?: boolean;
}

export default function DeparturesList({
  stopNumber,
  stopName,
  onSelectTrip,
  isOffline = false,
}: DeparturesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const linesParam = searchParams.get("lines");
  const dirsParam = searchParams.get("dirs");

  const selectedLines = linesParam ? linesParam.split(",") : [];
  const selectedDirections = dirsParam ? dirsParam.split(",") : [];

  const [isFiltersOpen, setIsFiltersOpen] = useState(
    !!linesParam || !!dirsParam,
  );

  const { data, error, isLoading } = useSWR(
    `/api/departures?stopNumber=${stopNumber}`,
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
    },
  );

  if (isLoading) {
    return (
      <div className="bg-surface/80 border-border mt-8 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md">
        <div className="bg-brand/10 border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-xl font-bold">
            Abfahrten von {stopName}
          </h2>
          {isOffline ? (
            <div className="flex items-center text-xs font-semibold text-red-500">
              <WifiOff className="mr-1.5 h-3.5 w-3.5" />
              Offline Modus
            </div>
          ) : (
            <div className="text-brand flex items-center text-xs font-semibold">
              <span className="relative mr-2 flex h-3 w-3">
                <span className="bg-brand absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-brand relative inline-flex h-3 w-3 rounded-full"></span>
              </span>
              Live Updates
            </div>
          )}
        </div>

        {/* Filter Skeleton */}
        <div className="border-border bg-surface-hover/30 border-b px-6">
          <div className="flex items-center py-3">
            <div className="bg-surface-hover/80 h-8 w-32 animate-pulse rounded-md" />
          </div>
        </div>

        <div className="divide-border divide-y">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex min-w-0 flex-1 items-center space-x-4">
                <div className="bg-surface-hover/80 h-12 w-12 flex-shrink-0 animate-pulse rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2.5 pr-2">
                  <div className="bg-surface-hover/80 h-5 w-32 animate-pulse rounded-md" />
                  <div className="bg-surface-hover/80 h-3 w-20 animate-pulse rounded-md" />
                </div>
              </div>
              <div className="ml-2 flex flex-col items-end space-y-2.5">
                <div className="bg-surface-hover/80 h-6 w-10 animate-pulse rounded-md" />
                <div className="bg-surface-hover/80 h-3 w-8 animate-pulse rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface/50 mt-8 flex flex-col items-center justify-center rounded-2xl border border-red-500/50 p-12">
        <AlertCircle className="mb-4 h-8 w-8 text-red-500" />
        <p className="text-red-400">
          Fehler beim Laden der Abfahrten. Bitte versuchen Sie es erneut.
        </p>
      </div>
    );
  }

  const departures: Departure[] = data?.actual || [];

  if (departures.length === 0) {
    return (
      <div className="bg-surface/50 border-border mt-8 flex flex-col items-center justify-center rounded-2xl border p-12">
        <Navigation className="text-muted mb-4 h-8 w-8 opacity-50" />
        <p className="text-muted">
          Keine anstehenden Abfahrten für {stopName}.
        </p>
      </div>
    );
  }

  const uniqueLines = Array.from(
    new Set([...departures.map((d) => d.patternText), ...selectedLines]),
  ).sort();
  const uniqueDirections = Array.from(
    new Set([...departures.map((d) => d.direction), ...selectedDirections]),
  ).sort();

  const updateParams = (lines: string[], dirs: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (lines.length > 0) params.set("lines", lines.join(","));
    else params.delete("lines");

    if (dirs.length > 0) params.set("dirs", dirs.join(","));
    else params.delete("dirs");

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const toggleLine = (line: string) => {
    const newLines = selectedLines.includes(line)
      ? selectedLines.filter((l) => l !== line)
      : [...selectedLines, line];
    updateParams(newLines, selectedDirections);
  };

  const toggleDirection = (dir: string) => {
    const newDirs = selectedDirections.includes(dir)
      ? selectedDirections.filter((d) => d !== dir)
      : [...selectedDirections, dir];
    updateParams(selectedLines, newDirs);
  };

  const resetFilters = () => {
    updateParams([], []);
  };

  const filteredDepartures = departures.filter((dep) => {
    const lineMatch =
      selectedLines.length === 0 || selectedLines.includes(dep.patternText);
    const dirMatch =
      selectedDirections.length === 0 ||
      selectedDirections.includes(dep.direction);
    return lineMatch && dirMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface/80 border-border mt-8 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md"
    >
      <div className="bg-brand/10 border-border flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-foreground text-xl font-bold">
          Abfahrten von {stopName}
        </h2>
        {isOffline ? (
          <div className="flex items-center text-xs font-semibold text-red-500">
            <WifiOff className="mr-1.5 h-3.5 w-3.5" />
            Offline Modus
          </div>
        ) : (
          <div className="text-brand flex items-center text-xs font-semibold">
            <span className="relative mr-2 flex h-3 w-3">
              <span className="bg-brand absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-brand relative inline-flex h-3 w-3 rounded-full"></span>
            </span>
            Live Updates
          </div>
        )}
      </div>

      {/* Filters */}
      {(uniqueLines.length > 1 || uniqueDirections.length > 1) && (
        <div className="border-border bg-surface-hover/30 border-b px-6">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="text-muted hover:text-foreground focus-visible:ring-brand -ml-2 flex items-center rounded-md px-2 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-expanded={isFiltersOpen}
            >
              <Filter className="mr-2 h-4 w-4" />
              {isFiltersOpen ? "Filter ausblenden" : "Filter anzeigen"}
              {(selectedLines.length > 0 || selectedDirections.length > 0) && (
                <span className="bg-brand/20 text-brand ml-2 rounded-full px-2 py-0.5 text-[10px]">
                  {selectedLines.length + selectedDirections.length} aktiv
                </span>
              )}
            </button>
            {(selectedLines.length > 0 || selectedDirections.length > 0) && (
              <button
                onClick={resetFilters}
                className="text-brand focus-visible:ring-brand rounded-md px-2 py-2 text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pb-4">
                  {uniqueLines.length > 1 && (
                    <div>
                      <div className="flex flex-wrap gap-2.5">
                        {uniqueLines.map((line) => (
                          <button
                            key={line}
                            onClick={() => toggleLine(line)}
                            className={`focus-visible:ring-brand min-h-[40px] rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none ${selectedLines.includes(line) ? "bg-brand border-brand text-white shadow-md" : "bg-background text-muted border-border hover:border-brand/50 hover:text-foreground"}`}
                          >
                            {line}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {uniqueDirections.length > 1 && (
                    <div>
                      <div className="flex flex-wrap gap-2.5">
                        {uniqueDirections.map((dir) => (
                          <button
                            key={dir}
                            onClick={() => toggleDirection(dir)}
                            className={`focus-visible:ring-brand min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${selectedDirections.includes(dir) ? "bg-brand border-brand text-white shadow-md" : "bg-background text-muted border-border hover:border-brand/50 hover:text-foreground"}`}
                          >
                            {dir}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="divide-border divide-y" aria-live="polite">
        <AnimatePresence>
          {filteredDepartures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted px-6 py-12 text-center"
            >
              Keine Abfahrten entsprechen deinen Filtern.
            </motion.div>
          ) : (
            filteredDepartures.map((dep, idx) => {
              const minutesRemaining = Math.max(
                0,
                Math.round(dep.actualRelativeTime / 60),
              );

              const delay = getDelayMinutes(dep.plannedTime, dep.actualTime);
              const isDelayed = delay > 1; // 1 minute is treated as on-time buffer
              const isEarly = delay < 0;
              const showDiff = isDelayed || isEarly;

              return (
                <motion.div
                  key={`${dep.tripId}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() =>
                    onSelectTrip(dep.tripId, dep.patternText, dep.direction)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectTrip(dep.tripId, dep.patternText, dep.direction);
                    }
                  }}
                  className="hover:bg-surface-hover group focus-visible:ring-brand flex cursor-pointer items-center justify-between px-6 py-4 transition-colors last:rounded-b-2xl focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                >
                  <div className="flex min-w-0 flex-1 items-center space-x-4">
                    <div className="bg-brand flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md">
                      {dep.patternText}
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="text-foreground group-hover:text-brand truncate text-lg font-semibold transition-colors">
                        {dep.direction}
                      </h3>
                      <div className="mt-1 flex items-center text-sm">
                        <Clock className="text-muted mr-1 h-3 w-3 flex-shrink-0" />
                        {dep.plannedTime && dep.actualTime && showDiff ? (
                          <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="text-muted mr-2 flex-shrink-0 line-through">
                              {dep.plannedTime}
                            </span>
                            <span
                              className={`flex min-w-0 items-center font-medium ${isDelayed ? "text-red-400" : "text-emerald-400"}`}
                            >
                              <span className="flex-shrink-0">
                                {dep.actualTime}
                              </span>
                              <span
                                className={`ml-2 flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] tracking-wider uppercase ${isDelayed ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}
                              >
                                {isDelayed ? "Verspätet" : "Früher"}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted flex-shrink-0">
                            {dep.actualTime || dep.plannedTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2 flex-shrink-0 text-right">
                    {minutesRemaining <= 0 ? (
                      <span className="text-brand font-bold">Jetzt</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-foreground text-xl font-bold">
                          {minutesRemaining}
                        </span>
                        <span className="text-muted text-xs tracking-wider uppercase">
                          Min
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
