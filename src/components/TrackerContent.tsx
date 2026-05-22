"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BusFront } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import DeparturesList from "@/components/DeparturesList";
import QuickAccessGrid from "@/components/QuickAccessGrid";
import Searchbar, { Stop } from "@/components/Searchbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import TripDetails from "@/components/TripDetails";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;

  const { data: stopsData } = useSWR<Stop[]>("/api/stops", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const [optimisticStop, setOptimisticStop] = useState<string | null>(null);
  const stopNumberParam = searchParams.get("stop");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimisticStop(null);
  }, [stopNumberParam]);

  const displayStopNumber = optimisticStop || stopNumberParam;
  const stops = stopsData || [];

  let selectedStop: Stop | null = null;
  if (displayStopNumber) {
    if (stops.length > 0) {
      selectedStop = stops.find((s) => s.number === displayStopNumber) || null;
    }

    if (!selectedStop) {
      selectedStop = {
        name: "Lade Haltestelle...",
        number: displayStopNumber,
      };
    }
  }

  const handleSelectStop = (stop: Stop) => {
    setOptimisticStop(stop.number);
    // Update URL to make it shareable, pushing state to history
    // We intentionally wipe out lines/dirs filters when selecting a NEW stop
    const params = new URLSearchParams();
    params.set("stop", stop.number);
    router.push(`/?${params.toString()}`);
  };

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripLine, setSelectedTripLine] = useState<string>("");
  const [selectedTripDest, setSelectedTripDest] = useState<string>("");

  useEffect(() => {
    const handlePopState = () => {
      // Close the modal if the pushed state is popped via back button/gesture
      if (!window.history.state?.tripModalOpen) {
        setSelectedTripId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSelectTrip = (
    tripId: string,
    line: string,
    destination: string,
  ) => {
    setSelectedTripId(tripId);
    setSelectedTripLine(line);
    setSelectedTripDest(destination);

    // Push state to browser history to allow closing via back button/gesture
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, tripModalOpen: true }, "");
  };

  const handleCloseTrip = () => {
    setSelectedTripId(null);

    // If the modal was closed via the UI button, pop the history state manually
    if (window.history.state?.tripModalOpen) {
      window.history.back();
    }
  };

  return (
    <>
      {selectedStop ? (
        <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="bg-surface border-border hover:border-brand/30 hover:bg-brand/10 block rounded-xl border p-2 shadow-sm transition-all active:scale-95"
              >
                <BusFront className="text-brand h-6 w-6" />
              </Link>
            </div>
            <Link
              href="/"
              className="text-foreground hover:text-brand text-lg font-bold tracking-tight transition-colors active:scale-95"
            >
              KVG Bus Tracker
            </Link>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </header>
      ) : (
        <header className="relative z-10 px-4 pt-16 pb-8 text-center">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border-border mb-6 inline-flex items-center justify-center rounded-2xl border p-3 shadow-xl"
          >
            <BusFront className="text-brand h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
          >
            KVG Bus{" "}
            <span className="from-brand-light to-brand bg-gradient-to-r bg-clip-text text-transparent">
              Tracker
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted mx-auto max-w-xl text-lg"
          >
            Echtzeit Abfahrten für Kiel.
          </motion.p>
        </header>
      )}

      <main
        className={`z-10 mx-auto mb-16 flex w-full max-w-3xl flex-1 flex-col px-4 ${
          selectedStop ? "pt-6" : ""
        }`}
      >
        <motion.div
          initial={selectedStop ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: selectedStop ? 0 : 0.3 }}
          className="relative z-50 w-full"
        >
          <Searchbar
            onSelectStop={handleSelectStop}
            showRecentSuggestions={!!selectedStop}
          />
        </motion.div>

        {selectedStop ? (
          <DeparturesList
            key={selectedStop.number}
            stopNumber={selectedStop.number}
            stopName={selectedStop.name}
            onSelectTrip={handleSelectTrip}
            isOffline={isOffline}
          />
        ) : (
          <QuickAccessGrid onSelectStop={handleSelectStop} />
        )}
      </main>

      <TripDetails
        tripId={selectedTripId}
        line={selectedTripLine}
        destination={selectedTripDest}
        onClose={handleCloseTrip}
      />
    </>
  );
}
