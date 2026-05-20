"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Navigation, AlertCircle, Filter } from "lucide-react";
import { getDelayMinutes } from "@/utils/time";

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
  stopId: string;
  stopName: string;
  onSelectTrip: (tripId: string, line: string, destination: string) => void;
}

export default function DeparturesList({
  stopId,
  stopName,
  onSelectTrip,
}: DeparturesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLines, setSelectedLines] = useState<string[]>(
    searchParams.get("lines") ? searchParams.get("lines")!.split(",") : [],
  );
  const [selectedDirections, setSelectedDirections] = useState<string[]>(
    searchParams.get("dirs") ? searchParams.get("dirs")!.split(",") : [],
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    searchParams.has("lines") || searchParams.has("dirs"),
  );

  const { data, error, isLoading } = useSWR(
    `/api/departures?stopId=${stopId}`,
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
    },
  );

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 bg-surface/50 border border-border rounded-2xl">
        <Clock className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-muted">Lade Live-Abfahrten...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 bg-surface/50 border border-red-500/50 rounded-2xl">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-400">
          Fehler beim Laden der Abfahrten. Bitte versuchen Sie es erneut.
        </p>
      </div>
    );
  }

  const departures: Departure[] = data?.actual || [];

  if (departures.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 bg-surface/50 border border-border rounded-2xl">
        <Navigation className="w-8 h-8 text-muted mb-4 opacity-50" />
        <p className="text-muted">
          Keine anstehenden Abfahrten für {stopName}.
        </p>
      </div>
    );
  }

  const uniqueLines = Array.from(
    new Set(departures.map((d) => d.patternText)),
  ).sort();
  const uniqueDirections = Array.from(
    new Set(departures.map((d) => d.direction)),
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
    setSelectedLines(newLines);
    updateParams(newLines, selectedDirections);
  };

  const toggleDirection = (dir: string) => {
    const newDirs = selectedDirections.includes(dir)
      ? selectedDirections.filter((d) => d !== dir)
      : [...selectedDirections, dir];
    setSelectedDirections(newDirs);
    updateParams(selectedLines, newDirs);
  };

  const resetFilters = () => {
    setSelectedLines([]);
    setSelectedDirections([]);
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
      className="mt-8 bg-surface/80 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="bg-brand/10 border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Abfahrten von {stopName}
        </h2>
        <div className="flex items-center text-xs text-brand">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
          </span>
          Live Updates
        </div>
      </div>

      {/* Filters */}
      {(uniqueLines.length > 1 || uniqueDirections.length > 1) && (
        <div className="px-6 border-b border-border bg-surface-hover/30">
          <div className="py-3 flex items-center justify-between">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center py-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              {isFiltersOpen ? "Filter ausblenden" : "Filter anzeigen"}
              {(selectedLines.length > 0 || selectedDirections.length > 0) && (
                <span className="ml-2 px-2 py-0.5 bg-brand/20 text-brand rounded-full text-[10px]">
                  {selectedLines.length + selectedDirections.length} aktiv
                </span>
              )}
            </button>
            {(selectedLines.length > 0 || selectedDirections.length > 0) && (
              <button
                onClick={resetFilters}
                className="text-brand py-2 text-sm font-medium hover:underline"
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
                <div className="pb-4 space-y-4">
                  {uniqueLines.length > 1 && (
                    <div>
                      <div className="flex flex-wrap gap-2.5">
                        {uniqueLines.map((line) => (
                          <button
                            key={line}
                            onClick={() => toggleLine(line)}
                            className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-bold transition-colors border ${selectedLines.includes(line) ? "bg-brand text-white border-brand shadow-md" : "bg-background text-muted border-border hover:border-brand/50 hover:text-foreground"}`}
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
                            className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-medium transition-colors border ${selectedDirections.includes(dir) ? "bg-brand text-white border-brand shadow-md" : "bg-background text-muted border-border hover:border-brand/50 hover:text-foreground"}`}
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

      <div className="divide-y divide-border">
        <AnimatePresence>
          {filteredDepartures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-12 text-center text-muted"
            >
              Keine Abfahrten entsprechen deinen Filtern.
            </motion.div>
          ) : (
            filteredDepartures.map((dep, idx) => {
              const isLeavingSoon =
                dep.actualRelativeTime > 0 && dep.actualRelativeTime < 300; // Less than 5 mins

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
                  className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-lg ${isLeavingSoon ? "bg-brand text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-background text-foreground"}`}
                    >
                      {dep.patternText}
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-brand transition-colors truncate">
                        {dep.direction}
                      </h3>
                      <div className="text-sm flex items-center mt-1">
                        <Clock className="w-3 h-3 flex-shrink-0 mr-1 text-muted" />
                        {dep.plannedTime && dep.actualTime && showDiff ? (
                          <div className="flex items-center min-w-0 overflow-hidden">
                            <span className="line-through text-muted mr-2 flex-shrink-0">
                              {dep.plannedTime}
                            </span>
                            <span
                              className={`font-medium flex items-center min-w-0 ${isDelayed ? "text-red-400" : "text-emerald-400"}`}
                            >
                              <span className="flex-shrink-0">
                                {dep.actualTime}
                              </span>
                              <span
                                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${isDelayed ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}
                              >
                                {isDelayed ? "Verspätet" : "Früher"}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted flex-shrink-0">
                            {dep.actualTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    {dep.actualRelativeTime <= 0 ? (
                      <span className="text-brand font-bold animate-pulse">
                        Jetzt
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xl font-bold ${isLeavingSoon ? "text-brand" : "text-foreground"}`}
                        >
                          {Math.floor(dep.actualRelativeTime / 60)}
                        </span>
                        <span className="text-xs text-muted uppercase tracking-wider">
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
