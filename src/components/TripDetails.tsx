"use client";

import { useEffect, useRef } from "react";
import { getDelayMinutes } from "@/utils/time";
import { Bus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StopPassage {
  stop: {
    name: string;
  };
  actualTime?: string;
  plannedTime?: string;
}

interface TripDetailsProps {
  tripId: string | null;
  line: string;
  destination: string;
  onClose: () => void;
}

export default function TripDetails({
  tripId,
  line,
  destination,
  onClose,
}: TripDetailsProps) {
  const { data, isLoading } = useSWR(
    tripId ? `/api/trip?tripId=${tripId}` : null,
    fetcher,
    {
      refreshInterval: 15000,
    },
  );

  const allPassages = data ? [...(data.old || []), ...(data.actual || [])] : [];
  const nextStopIdx = data?.old ? data.old.length : 0;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (tripId) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Delay focus slightly to allow animation to start
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 10);

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      // Restore focus when closing
      previouslyFocusedElement.current?.focus();
    };
  }, [tripId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && tripId) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tripId, onClose]);

  // Handle Focus Trapping
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    // As this modal is simple and mostly informational,
    // we only have the close button as an interactive element.
    // If we had more, we'd query all focusable elements.
    e.preventDefault();
    closeButtonRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {tripId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-details-title"
            onKeyDown={handleTabKey}
            className="bg-surface border-border fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-2xl"
          >
            <div className="border-border bg-surface flex items-start justify-between border-b p-6">
              <div>
                <div className="mb-2 flex items-center space-x-3">
                  <div className="bg-brand rounded-lg px-3 py-1 font-bold text-white">
                    {line}
                  </div>
                  <h2
                    id="trip-details-title"
                    className="text-foreground text-xl font-bold"
                  >
                    {destination}
                  </h2>
                </div>
                <p className="text-muted mt-1 flex items-center text-sm">
                  <Bus className="text-brand mr-2 h-4 w-4" />
                  {data?.actual && data.actual.length > 0 ? (
                    <span>
                      Nächster Halt:{" "}
                      <strong className="text-foreground">
                        {data.actual[0].stop.name}
                      </strong>
                    </span>
                  ) : (
                    "Routeninformation"
                  )}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Schließen"
                className="bg-background hover:bg-surface-hover text-muted hover:text-foreground focus-visible:ring-brand rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center space-x-4"
                    >
                      <div className="bg-border h-4 w-4 rounded-full" />
                      <div className="bg-border h-4 w-3/4 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-border absolute top-2 bottom-2 left-[7px] z-0 w-0.5" />
                  <div className="relative z-10 space-y-6">
                    {allPassages.length === 0 && !isLoading ? (
                      <p className="text-muted py-4 text-center">
                        Keine Routendaten verfügbar
                      </p>
                    ) : (
                      allPassages.map((passage: StopPassage, idx: number) => {
                        const isLast = idx === allPassages.length - 1;
                        const hasTime =
                          !!passage.actualTime || !!passage.plannedTime;
                        const timeString =
                          passage.actualTime || passage.plannedTime;

                        let showDiff = false;
                        let isDelayed = false;
                        if (passage.plannedTime && passage.actualTime) {
                          const delay = getDelayMinutes(
                            passage.plannedTime,
                            passage.actualTime,
                          );
                          isDelayed = delay > 1;
                          const isEarly = delay < 0;
                          showDiff = isDelayed || isEarly;
                        }

                        const isNextStop =
                          idx === nextStopIdx &&
                          data?.actual &&
                          data.actual.length > 0;
                        const isPast = idx < nextStopIdx;

                        return (
                          <div
                            key={idx}
                            className={`flex items-start space-x-6 ${isPast ? "opacity-40" : ""}`}
                          >
                            <div className="relative mt-1">
                              <div
                                className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${isNextStop ? "border-brand bg-brand shadow-[0_0_10px_rgba(59,130,246,0.5)]" : isLast ? "border-brand bg-brand" : isPast ? "border-border bg-surface" : "border-brand bg-surface"}`}
                              />
                              {isNextStop && (
                                <span className="bg-brand absolute top-0 left-0 h-4 w-4 animate-ping rounded-full opacity-75"></span>
                              )}
                            </div>
                            <div className="flex flex-1 items-start justify-between">
                              <div>
                                <p
                                  className={`font-medium ${isNextStop ? "text-brand text-lg font-bold" : isLast ? "text-foreground font-bold" : "text-foreground"}`}
                                >
                                  {passage.stop.name}
                                </p>
                                {isNextStop && (
                                  <p className="text-brand mt-1 text-[10px] font-bold tracking-widest uppercase">
                                    Nächster Halt
                                  </p>
                                )}
                              </div>
                              {hasTime && (
                                <div className="flex flex-col items-end">
                                  {showDiff ? (
                                    <>
                                      <span className="text-muted text-[10px] line-through">
                                        {passage.plannedTime}
                                      </span>
                                      <span
                                        className={`rounded border px-2 py-0.5 font-mono text-sm ${isDelayed ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}
                                      >
                                        {passage.actualTime}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted bg-background rounded px-2 py-0.5 font-mono text-sm">
                                      {timeString}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
